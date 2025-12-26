import * as crypto from 'crypto';

/**
 * BloomFilter implementation for the BloomJoin algorithm
 * Used to efficiently synchronize exam modifications across distributed college sites
 */
export class BloomFilter {
  private bitArray: Uint8Array;
  private size: number;
  private hashCount: number;

  constructor(size: number = 1024, hashCount: number = 3) {
    this.size = size;
    this.hashCount = hashCount;
    this.bitArray = new Uint8Array(Math.ceil(size / 8));
  }

  /**
   * Generate multiple hash values for an item
   */
  private hash(item: string, seed: number): number {
    const hash = crypto
      .createHash('sha256')
      .update(`${seed}:${item}`)
      .digest('hex');
    return parseInt(hash.slice(0, 8), 16) % this.size;
  }

  /**
   * Add an item to the bloom filter
   */
  add(item: string): void {
    for (let i = 0; i < this.hashCount; i++) {
      const position = this.hash(item, i);
      const byteIndex = Math.floor(position / 8);
      const bitIndex = position % 8;
      this.bitArray[byteIndex] |= 1 << bitIndex;
    }
  }

  /**
   * Check if an item might be in the set
   */
  contains(item: string): boolean {
    for (let i = 0; i < this.hashCount; i++) {
      const position = this.hash(item, i);
      const byteIndex = Math.floor(position / 8);
      const bitIndex = position % 8;
      if (!(this.bitArray[byteIndex] & (1 << bitIndex))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Serialize the bloom filter for network transmission
   */
  serialize(): { bitArray: number[]; size: number; hashCount: number } {
    return {
      bitArray: Array.from(this.bitArray),
      size: this.size,
      hashCount: this.hashCount,
    };
  }

  /**
   * Deserialize a bloom filter from network data
   */
  static deserialize(data: {
    bitArray: number[];
    size: number;
    hashCount: number;
  }): BloomFilter {
    const filter = new BloomFilter(data.size, data.hashCount);
    filter.bitArray = new Uint8Array(data.bitArray);
    return filter;
  }

  /**
   * Merge another bloom filter into this one (OR operation)
   */
  merge(other: BloomFilter): void {
    if (this.size !== other.size || this.hashCount !== other.hashCount) {
      throw new Error(
        'Cannot merge bloom filters with different configurations',
      );
    }
    for (let i = 0; i < this.bitArray.length; i++) {
      this.bitArray[i] |= other.bitArray[i];
    }
  }

  /**
   * Get the approximate number of items in the filter
   */
  estimateCount(): number {
    let setBits = 0;
    for (let i = 0; i < this.bitArray.length; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.bitArray[i] & (1 << j)) setBits++;
      }
    }
    // Using the formula: n ≈ -(m/k) * ln(1 - X/m)
    const m = this.size;
    const k = this.hashCount;
    const X = setBits;
    if (X === 0) return 0;
    if (X >= m) return Infinity;
    return Math.round(-(m / k) * Math.log(1 - X / m));
  }
}

/**
 * BloomJoin implementation for distributed exam paper synchronization
 *
 * Scenario:
 * - Site 1 (Admin): Has the master question bank and exam papers
 * - Site 2..N (Colleges): Have distributed copies of exam papers
 *
 * When modifications are made after PDF distribution:
 * 1. Admin creates a bloom filter of modified question IDs
 * 2. Colleges filter their local records against the bloom filter
 * 3. Only potentially affected records are fetched for synchronization
 */
export class BloomJoinService {
  /**
   * Create a bloom filter from a set of record IDs (Step 1)
   * Site 1 computes F(T1) and sends to Site 2
   */
  createFilterFromRecords(recordIds: string[]): BloomFilter {
    const filter = new BloomFilter(1024, 3);
    recordIds.forEach((id) => filter.add(id));
    return filter;
  }

  /**
   * Filter local records against received bloom filter (Step 2)
   * Site 2 filters records that might match F(T1)
   */
  filterRecords<T extends { id: string }>(
    records: T[],
    filter: BloomFilter,
  ): T[] {
    return records.filter((record) => filter.contains(record.id));
  }

  /**
   * Compute the join between filtered records and master data (Step 3)
   * Site 1 performs the final join
   */
  computeJoin<T extends { id: string }>(
    masterRecords: T[],
    filteredRecords: T[],
  ): { updated: T[]; toSync: T[] } {
    const masterMap = new Map(masterRecords.map((r) => [r.id, r]));
    const filteredMap = new Map(filteredRecords.map((r) => [r.id, r]));

    const updated: T[] = [];
    const toSync: T[] = [];

    // Find records that need syncing
    masterRecords.forEach((master) => {
      const filtered = filteredMap.get(master.id);
      if (filtered) {
        // Record exists in both - check if update needed
        if (JSON.stringify(master) !== JSON.stringify(filtered)) {
          updated.push(master);
          toSync.push(master);
        }
      }
    });

    return { updated, toSync };
  }
}

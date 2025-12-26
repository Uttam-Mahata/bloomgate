import { Injectable } from '@nestjs/common';
import { BloomFilter, BloomJoinService } from './bloom-filter';

@Injectable()
export class BloomFilterService {
  private bloomJoin = new BloomJoinService();
  private siteFilters: Map<string, BloomFilter> = new Map();

  /**
   * Create and store a bloom filter for a site's modifications
   */
  createModificationFilter(siteId: string, modifiedIds: string[]): { bitArray: number[]; size: number; hashCount: number } {
    const filter = this.bloomJoin.createFilterFromRecords(modifiedIds);
    this.siteFilters.set(siteId, filter);
    return filter.serialize();
  }

  /**
   * Get records that match the modification filter from another site
   */
  getMatchingRecords<T extends { id: string }>(
    siteId: string,
    localRecords: T[],
    filterData: { bitArray: number[]; size: number; hashCount: number },
  ): T[] {
    const filter = BloomFilter.deserialize(filterData);
    return this.bloomJoin.filterRecords(localRecords, filter);
  }

  /**
   * Perform the bloom join to sync modifications
   */
  performBloomJoin<T extends { id: string }>(
    masterRecords: T[],
    siteRecords: T[],
    modifiedIds: string[],
  ): { filter: ReturnType<BloomFilter['serialize']>; matchingRecords: T[]; syncRequired: T[] } {
    // Step 1: Create bloom filter from master modifications
    const filter = this.bloomJoin.createFilterFromRecords(modifiedIds);

    // Step 2: Filter site records
    const matchingRecords = this.bloomJoin.filterRecords(siteRecords, filter);

    // Step 3: Compute join
    const { toSync } = this.bloomJoin.computeJoin(masterRecords, matchingRecords);

    return {
      filter: filter.serialize(),
      matchingRecords,
      syncRequired: toSync,
    };
  }
}


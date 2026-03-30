package com.bloomgate.bloomfilter;

import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class BloomFilter {

    private byte[] bitArray;
    private final int size;
    private final int hashCount;

    public BloomFilter(int size, int hashCount) {
        this.size = size;
        this.hashCount = hashCount;
        this.bitArray = new byte[(int) Math.ceil(size / 8.0)];
    }

    /**
     * Generate hash value matching the TypeScript implementation:
     * sha256("${seed}:${item}").hex().slice(0,8) parsed as hex integer
     */
    private int hash(String item, int seed) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            String input = seed + ":" + item;
            byte[] hashBytes = md.digest(input.getBytes(StandardCharsets.UTF_8));

            // Convert to hex string and take first 8 hex chars (matching TypeScript)
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            long value = Long.parseLong(sb.substring(0, 8), 16);
            return (int) (value % size);
        } catch (Exception e) {
            throw new RuntimeException("Hash computation failed", e);
        }
    }

    public void add(String item) {
        for (int i = 0; i < hashCount; i++) {
            int position = hash(item, i);
            int byteIndex = position / 8;
            int bitIndex = position % 8;
            bitArray[byteIndex] |= (byte) (1 << bitIndex);
        }
    }

    public boolean contains(String item) {
        for (int i = 0; i < hashCount; i++) {
            int position = hash(item, i);
            int byteIndex = position / 8;
            int bitIndex = position % 8;
            if ((bitArray[byteIndex] & (1 << bitIndex)) == 0) {
                return false;
            }
        }
        return true;
    }

    public BloomFilterData serialize() {
        List<Integer> intArray = new ArrayList<>(bitArray.length);
        for (byte b : bitArray) {
            intArray.add(b & 0xFF);
        }
        return new BloomFilterData(intArray, size, hashCount);
    }

    public static BloomFilter deserialize(BloomFilterData data) {
        BloomFilter filter = new BloomFilter(data.getSize(), data.getHashCount());
        List<Integer> intArray = data.getBitArray();
        filter.bitArray = new byte[intArray.size()];
        for (int i = 0; i < intArray.size(); i++) {
            filter.bitArray[i] = (byte) intArray.get(i).intValue();
        }
        return filter;
    }

    public void merge(BloomFilter other) {
        if (this.size != other.size || this.hashCount != other.hashCount) {
            throw new IllegalArgumentException("Cannot merge bloom filters with different configurations");
        }
        for (int i = 0; i < this.bitArray.length; i++) {
            this.bitArray[i] |= other.bitArray[i];
        }
    }
}

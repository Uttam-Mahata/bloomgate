package com.bloomgate.bloomfilter;

import java.util.List;

public class BloomFilterData {
    private List<Integer> bitArray;
    private int size;
    private int hashCount;

    public BloomFilterData() {}

    public BloomFilterData(List<Integer> bitArray, int size, int hashCount) {
        this.bitArray = bitArray;
        this.size = size;
        this.hashCount = hashCount;
    }

    public List<Integer> getBitArray() { return bitArray; }
    public void setBitArray(List<Integer> bitArray) { this.bitArray = bitArray; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public int getHashCount() { return hashCount; }
    public void setHashCount(int hashCount) { this.hashCount = hashCount; }
}

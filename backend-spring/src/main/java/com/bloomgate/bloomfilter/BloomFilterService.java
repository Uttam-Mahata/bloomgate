package com.bloomgate.bloomfilter;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class BloomFilterService {

    private final Map<String, BloomFilter> siteFilters = new ConcurrentHashMap<>();

    /**
     * Create and store a bloom filter for a site's modifications
     */
    public BloomFilterData createModificationFilter(String siteId, List<String> modifiedIds) {
        BloomFilter filter = createFilterFromRecords(modifiedIds);
        siteFilters.put(siteId, filter);
        return filter.serialize();
    }

    /**
     * Get records that match the modification filter from another site
     */
    public <T extends Map<String, Object>> List<T> getMatchingRecords(
            String siteId, List<T> localRecords, BloomFilterData filterData) {
        BloomFilter filter = BloomFilter.deserialize(filterData);
        return filterRecords(localRecords, filter);
    }

    /**
     * Perform the bloom join to sync modifications
     */
    public Map<String, Object> performBloomJoin(
            List<Map<String, Object>> masterRecords,
            List<Map<String, Object>> siteRecords,
            List<String> modifiedIds) {

        BloomFilter filter = createFilterFromRecords(modifiedIds);
        List<Map<String, Object>> matchingRecords = filterRecords(siteRecords, filter);
        Map<String, Object> joinResult = computeJoin(masterRecords, matchingRecords);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> toSync = (List<Map<String, Object>>) joinResult.get("toSync");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("filter", filter.serialize());
        result.put("matchingRecords", matchingRecords);
        result.put("syncRequired", toSync);
        return result;
    }

    public BloomFilter createFilterFromRecords(List<String> recordIds) {
        BloomFilter filter = new BloomFilter(1024, 3);
        if (recordIds != null) {
            recordIds.forEach(filter::add);
        }
        return filter;
    }

    public <T extends Map<String, Object>> List<T> filterRecords(List<T> records, BloomFilter filter) {
        return records.stream()
                .filter(r -> {
                    Object idObj = r.get("id");
                    return idObj != null && filter.contains(idObj.toString());
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> computeJoin(
            List<Map<String, Object>> masterRecords,
            List<Map<String, Object>> filteredRecords) {

        Map<String, Map<String, Object>> filteredMap = filteredRecords.stream()
                .collect(Collectors.toMap(r -> r.get("id").toString(), r -> r));

        List<Map<String, Object>> updated = new ArrayList<>();
        List<Map<String, Object>> toSync = new ArrayList<>();

        for (Map<String, Object> master : masterRecords) {
            String id = master.get("id").toString();
            Map<String, Object> filtered = filteredMap.get(id);
            if (filtered != null) {
                if (!master.equals(filtered)) {
                    updated.add(master);
                    toSync.add(master);
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("updated", updated);
        result.put("toSync", toSync);
        return result;
    }
}

package com.bloomgate.bloomfilter;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service layer for the Bloom Filter module.
 *
 * <p>All probabilistic-filter business logic lives here.  Site-level filter
 * state is persisted through the {@link BloomFilterRepository}, decoupling
 * the algorithm from its storage mechanism.</p>
 */
@Service
public class BloomFilterService {

    private final BloomFilterRepository bloomFilterRepository;

    public BloomFilterService(BloomFilterRepository bloomFilterRepository) {
        this.bloomFilterRepository = bloomFilterRepository;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Build a new filter from the supplied modification IDs, persist it for
     * {@code siteId}, and return the serialised representation.
     */
    public BloomFilterData createModificationFilter(String siteId, List<String> modifiedIds) {
        BloomFilter filter = createFilterFromRecords(modifiedIds);
        bloomFilterRepository.save(siteId, filter);
        return filter.serialize();
    }

    /**
     * Given a previously-persisted filter for {@code siteId}, return only
     * those local records whose IDs are contained in the filter.
     */
    public <T extends Map<String, Object>> List<T> getMatchingRecords(
            String siteId, List<T> localRecords, BloomFilterData filterData) {
        BloomFilter filter = BloomFilter.deserialize(filterData);
        return filterRecords(localRecords, filter);
    }

    /**
     * Full BloomJoin: build a filter over {@code modifiedIds}, find matching
     * records in {@code siteRecords}, compute the diff against
     * {@code masterRecords}, and return sync-ready data.
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

    // ── Package-private helpers (used by ExamService) ─────────────────────────

    BloomFilter createFilterFromRecords(List<String> recordIds) {
        BloomFilter filter = new BloomFilter(1024, 3);
        if (recordIds != null) recordIds.forEach(filter::add);
        return filter;
    }

    <T extends Map<String, Object>> List<T> filterRecords(List<T> records, BloomFilter filter) {
        return records.stream()
                .filter(r -> {
                    Object id = r.get("id");
                    return id != null && filter.contains(id.toString());
                })
                .collect(Collectors.toList());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Map<String, Object> computeJoin(
            List<Map<String, Object>> masterRecords,
            List<Map<String, Object>> filteredRecords) {

        Map<String, Map<String, Object>> filteredMap = filteredRecords.stream()
                .collect(Collectors.toMap(r -> r.get("id").toString(), r -> r));

        List<Map<String, Object>> updated = new ArrayList<>();
        List<Map<String, Object>> toSync  = new ArrayList<>();

        for (Map<String, Object> master : masterRecords) {
            String id = master.get("id").toString();
            Map<String, Object> filtered = filteredMap.get(id);
            if (filtered != null && !master.equals(filtered)) {
                updated.add(master);
                toSync.add(master);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("updated", updated);
        result.put("toSync", toSync);
        return result;
    }
}

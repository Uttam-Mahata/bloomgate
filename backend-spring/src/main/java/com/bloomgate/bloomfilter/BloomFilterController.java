package com.bloomgate.bloomfilter;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bloom-filter")
public class BloomFilterController {

    private final BloomFilterService bloomFilterService;

    public BloomFilterController(BloomFilterService bloomFilterService) {
        this.bloomFilterService = bloomFilterService;
    }

    @PostMapping("/create-filter")
    public BloomFilterData createFilter(@RequestBody Map<String, Object> body) {
        String siteId = (String) body.get("siteId");
        @SuppressWarnings("unchecked")
        List<String> modifiedIds = (List<String>) body.get("modifiedIds");
        return bloomFilterService.createModificationFilter(siteId, modifiedIds);
    }

    @PostMapping("/filter-records")
    public Object filterRecords(@RequestBody Map<String, Object> body) {
        String siteId = (String) body.get("siteId");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> records = (List<Map<String, Object>>) body.get("records");
        @SuppressWarnings("unchecked")
        Map<String, Object> filterMap = (Map<String, Object>) body.get("filter");

        BloomFilterData filterData = parseFilterData(filterMap);
        return bloomFilterService.getMatchingRecords(siteId, records, filterData);
    }

    @PostMapping("/bloom-join")
    public Object performBloomJoin(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> masterRecords = (List<Map<String, Object>>) body.get("masterRecords");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> siteRecords = (List<Map<String, Object>>) body.get("siteRecords");
        @SuppressWarnings("unchecked")
        List<String> modifiedIds = (List<String>) body.get("modifiedIds");
        return bloomFilterService.performBloomJoin(masterRecords, siteRecords, modifiedIds);
    }

    @SuppressWarnings("unchecked")
    private BloomFilterData parseFilterData(Map<String, Object> map) {
        List<Integer> bitArray = (List<Integer>) map.get("bitArray");
        int size = ((Number) map.get("size")).intValue();
        int hashCount = ((Number) map.get("hashCount")).intValue();
        return new BloomFilterData(bitArray, size, hashCount);
    }
}

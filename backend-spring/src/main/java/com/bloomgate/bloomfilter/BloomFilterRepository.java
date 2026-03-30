package com.bloomgate.bloomfilter;

import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

/**
 * In-memory repository for {@link BloomFilter} state, keyed by site ID.
 *
 * <p>The Bloom Filter is a stateless probabilistic algorithm; only the
 * serialised bit-array state needs to be stored between requests.  An H2
 * table would add unnecessary overhead here, so a thread-safe in-memory
 * store is the right choice while still honouring the repository pattern.</p>
 *
 * <p>To persist state across restarts, replace the {@link ConcurrentHashMap}
 * with a JPA entity + {@link org.springframework.data.jpa.repository.JpaRepository}.</p>
 */
@Repository
public class BloomFilterRepository {

    private final Map<String, BloomFilter> store = new ConcurrentHashMap<>();

    /** Persist (or overwrite) the filter for a given site. */
    public void save(String siteId, BloomFilter filter) {
        store.put(siteId, filter);
    }

    /** Retrieve the filter for a site, if one exists. */
    public Optional<BloomFilter> findBySiteId(String siteId) {
        return Optional.ofNullable(store.get(siteId));
    }

    /** Check whether a filter is stored for the given site. */
    public boolean existsBySiteId(String siteId) {
        return store.containsKey(siteId);
    }

    /** Remove the filter entry for a site. */
    public void deleteBySiteId(String siteId) {
        store.remove(siteId);
    }
}

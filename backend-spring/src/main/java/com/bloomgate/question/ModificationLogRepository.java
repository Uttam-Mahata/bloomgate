package com.bloomgate.question;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Spring Data JPA repository for {@link ModificationLog} entries.
 *
 * <p>Provides audit-trail queries used by the BloomJoin synchronisation
 * mechanism to determine which questions were modified after a given
 * point in time.</p>
 */
@Repository
public interface ModificationLogRepository extends JpaRepository<ModificationLog, Long> {

    /** Return all logs recorded at or after the supplied timestamp. */
    List<ModificationLog> findByTimestampGreaterThanEqual(Instant since);

    /** Return all logs for a specific question. */
    List<ModificationLog> findByQuestionId(String questionId);
}

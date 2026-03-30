package com.bloomgate.email;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Spring Data JPA repository for {@link EmailLog} entities.
 *
 * <p>Provides persistence for the email dispatch audit trail backed by
 * the H2 in-memory database.  Custom query methods below supplement the
 * standard CRUD operations inherited from {@link JpaRepository}.</p>
 */
@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {

    /** Return all log entries for a given recipient e-mail address. */
    List<EmailLog> findByRecipient(String recipient);

    /** Return all entries with a given status ("sent" or "failed"). */
    List<EmailLog> findByStatus(String status);

    /** Return all entries dispatched at or after the supplied timestamp. */
    List<EmailLog> findBySentAtGreaterThanEqual(Instant since);
}

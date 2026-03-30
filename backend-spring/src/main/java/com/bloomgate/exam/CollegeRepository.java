package com.bloomgate.exam;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link College} entities.
 *
 * <p>Backed by the H2 in-memory database.  Standard CRUD operations are
 * inherited from {@link JpaRepository}.  Custom finders are declared below.</p>
 */
@Repository
public interface CollegeRepository extends JpaRepository<College, String> {

    /** Look up a college by its e-mail address. */
    Optional<College> findByEmail(String email);
}

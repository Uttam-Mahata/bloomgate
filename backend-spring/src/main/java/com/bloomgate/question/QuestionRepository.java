package com.bloomgate.question;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Question} entities.
 *
 * <p>Extends {@link JpaRepository} to inherit standard CRUD operations
 * (save, findById, findAll, deleteById, …) backed by the H2 in-memory
 * database.  Custom query methods are declared here as needed.</p>
 */
@Repository
public interface QuestionRepository extends JpaRepository<Question, String> {

    /** Find all questions belonging to a given subject (case-insensitive). */
    @Query("SELECT q FROM Question q WHERE LOWER(q.subject) LIKE LOWER(CONCAT('%', :subject, '%'))")
    List<Question> findBySubjectContainingIgnoreCase(String subject);

    /** Find all active / inactive questions. */
    List<Question> findByIsActive(boolean isActive);

    /** Find by complexity. */
    List<Question> findByComplexity(QuestionComplexity complexity);

    /** Find by type. */
    List<Question> findByType(QuestionType type);
}

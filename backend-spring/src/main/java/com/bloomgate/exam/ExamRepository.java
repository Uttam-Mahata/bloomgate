package com.bloomgate.exam;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Exam} entities.
 *
 * <p>Backed by the H2 in-memory database.  All standard CRUD operations are
 * inherited from {@link JpaRepository}.  Custom query methods are declared
 * below as needed by the {@link ExamService}.</p>
 */
@Repository
public interface ExamRepository extends JpaRepository<Exam, String> {

    /** Return all exams with a specific status. */
    List<Exam> findByStatus(ExamStatus status);

    /** Return all exams for a given subject. */
    List<Exam> findBySubjectIgnoreCase(String subject);
}

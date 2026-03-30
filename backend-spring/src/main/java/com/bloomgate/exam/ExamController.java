package com.bloomgate.exam;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    // ============ Exam CRUD ============

    @PostMapping
    public Exam create(@RequestBody Map<String, Object> body) {
        return examService.create(body);
    }

    @GetMapping
    public List<Exam> findAll() {
        return examService.findAll();
    }

    @GetMapping("/{id}")
    public Exam findOne(@PathVariable String id) {
        return examService.findOne(id);
    }

    @GetMapping("/{id}/full")
    public Map<String, Object> getExamWithQuestions(@PathVariable String id) {
        return examService.getExamWithQuestions(id);
    }

    @PutMapping("/{id}")
    public Exam update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return examService.update(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable String id) {
        examService.remove(id);
        return ResponseEntity.noContent().build();
    }

    // ============ Exam Generation ============

    @PostMapping("/generate")
    public Exam generateExam(@RequestBody Map<String, Object> body) {
        return examService.generateExam(body);
    }

    // ============ PDF Generation ============

    @GetMapping("/{id}/pdf")
    public ResponseEntity<String> generatePdf(
            @PathVariable String id,
            @RequestParam(defaultValue = "false") String includeAnswers) {
        Map<String, Object> result = examService.generatePdfContent(id, "true".equals(includeAnswers));
        String html = (String) result.get("html");
        Exam exam = (Exam) result.get("exam");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_HTML);
        String filename = exam.getTitle().replaceAll("\\s+", "_") + ".html";
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"");
        return new ResponseEntity<>(html, headers, HttpStatus.OK);
    }

    @GetMapping("/{id}/pdf-content")
    public Map<String, Object> getPdfContent(
            @PathVariable String id,
            @RequestParam(defaultValue = "false") String includeAnswers) {
        return examService.generatePdfContent(id, "true".equals(includeAnswers));
    }

    // ============ College Management ============

    @PostMapping("/colleges")
    public College createCollege(@RequestBody Map<String, Object> body) {
        return examService.createCollegeFromDto(body);
    }

    @GetMapping("/colleges/all")
    public List<College> getAllColleges() {
        return examService.getAllColleges();
    }

    @GetMapping("/colleges/{id}")
    public College getCollege(@PathVariable String id) {
        return examService.getCollege(id);
    }

    // ============ Distribution ============

    @PostMapping("/distribute")
    public Exam distributeExam(@RequestBody Map<String, Object> body) {
        String examId = (String) body.get("examId");
        @SuppressWarnings("unchecked")
        List<String> collegeIds = (List<String>) body.get("collegeIds");
        return examService.distributeExam(examId, collegeIds);
    }

    // ============ Modifications with BloomJoin ============

    @PostMapping("/modify")
    public Map<String, Object> modifyDistributedExam(@RequestBody Map<String, Object> body) {
        return examService.modifyDistributedExam(body);
    }

    @PostMapping("/{id}/sync")
    public Map<String, Object> syncWithCollege(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        String collegeId = (String) body.get("collegeId");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> collegeModifications =
                (List<Map<String, Object>>) body.get("collegeModifications");
        return examService.syncWithCollege(id, collegeId, collegeModifications);
    }
}

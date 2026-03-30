package com.bloomgate.exam;

import com.bloomgate.bloomfilter.BloomFilterData;
import com.bloomgate.bloomfilter.BloomFilterService;
import com.bloomgate.question.Question;
import com.bloomgate.question.QuestionComplexity;
import com.bloomgate.question.QuestionService;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service layer for the Exam module.
 *
 * <p>All business logic (generation, distribution, BloomJoin sync, PDF
 * rendering) lives here.  Persistence is delegated to {@link ExamRepository}
 * and {@link CollegeRepository}; question data is accessed via
 * {@link QuestionService}.</p>
 */
@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final CollegeRepository collegeRepository;
    private final QuestionService questionService;
    private final BloomFilterService bloomFilterService;

    public ExamService(ExamRepository examRepository,
                       CollegeRepository collegeRepository,
                       QuestionService questionService,
                       BloomFilterService bloomFilterService) {
        this.examRepository = examRepository;
        this.collegeRepository = collegeRepository;
        this.questionService = questionService;
        this.bloomFilterService = bloomFilterService;
    }

    // ── Seed sample colleges on startup ──────────────────────────────────────

    @PostConstruct
    @Transactional
    public void seedSampleColleges() {
        if (collegeRepository.count() > 0) return;
        createCollege("MIT College of Engineering", "exam@mitcoe.edu", "Dr. John Smith", null, null);
        createCollege("Stanford University", "exams@stanford.edu", "Prof. Jane Doe", null, null);
        createCollege("IIT Mumbai", "exams@iitb.ac.in", "Dr. Ramesh Kumar", null, null);
        createCollege("Oxford University", "exams@ox.ac.uk", "Dr. Elizabeth Brown", null, null);
    }

    // ── Exam CRUD ─────────────────────────────────────────────────────────────

    @Transactional
    public Exam create(Map<String, Object> dto) {
        Exam exam = new Exam();
        applyExamDto(exam, dto);
        return examRepository.save(exam);
    }

    public List<Exam> findAll() {
        return examRepository.findAll();
    }

    public Exam findOne(String id) {
        return examRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Exam with ID " + id + " not found"));
    }

    @Transactional
    public Exam update(String id, Map<String, Object> dto) {
        Exam exam = findOne(id);
        applyExamDto(exam, dto);
        exam.setUpdatedAt(Instant.now());
        exam.setVersion(exam.getVersion() + 1);
        return examRepository.save(exam);
    }

    @Transactional
    public void remove(String id) {
        if (!examRepository.existsById(id)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Exam with ID " + id + " not found");
        }
        examRepository.deleteById(id);
    }

    // ── Exam Generation ───────────────────────────────────────────────────────

    @Transactional
    public Exam generateExam(Map<String, Object> dto) {
        String title = (String) dto.get("title");
        String subject = (String) dto.get("subject");
        int duration = dto.containsKey("duration") ? ((Number) dto.get("duration")).intValue() : 60;
        int totalMarks = dto.containsKey("totalMarks") ? ((Number) dto.get("totalMarks")).intValue() : 100;
        int passingMarks = dto.containsKey("passingMarks") ? ((Number) dto.get("passingMarks")).intValue() : 40;

        @SuppressWarnings("unchecked")
        Map<String, Object> criteria = (Map<String, Object>) dto.get("criteria");
        int easyCount   = criteria != null && criteria.containsKey("easyCount")   ? ((Number) criteria.get("easyCount")).intValue()   : 0;
        int mediumCount = criteria != null && criteria.containsKey("mediumCount") ? ((Number) criteria.get("mediumCount")).intValue() : 0;
        int hardCount   = criteria != null && criteria.containsKey("hardCount")   ? ((Number) criteria.get("hardCount")).intValue()   : 0;
        int expertCount = criteria != null && criteria.containsKey("expertCount") ? ((Number) criteria.get("expertCount")).intValue() : 0;

        List<ExamSection> sections = new ArrayList<>();

        if (easyCount > 0)   sections.add(buildSection("Section A - Easy Questions",   subject, QuestionComplexity.EASY,   easyCount));
        if (mediumCount > 0) sections.add(buildSection("Section B - Medium Questions", subject, QuestionComplexity.MEDIUM, mediumCount));
        if (hardCount > 0)   sections.add(buildSection("Section C - Hard Questions",   subject, QuestionComplexity.HARD,   hardCount));
        if (expertCount > 0) sections.add(buildSection("Section D - Expert Questions", subject, QuestionComplexity.EXPERT, expertCount));

        Exam exam = new Exam();
        exam.setTitle(title);
        exam.setSubject(subject != null ? subject : "");
        exam.setInstructions("Read all questions carefully before answering.");
        exam.setDuration(duration);
        exam.setTotalMarks(totalMarks);
        exam.setPassingMarks(passingMarks);
        exam.setSections(sections);
        return examRepository.save(exam);
    }

    private ExamSection buildSection(String sectionTitle, String subject,
            QuestionComplexity complexity, int count) {
        List<Question> qs = questionService.generateRandomSelection(
            count, subject, List.of(complexity), null, null);
        int marks = qs.stream().mapToInt(Question::getWeight).sum();
        return new ExamSection(null, sectionTitle,
            "Answer all questions. Each question carries marks as indicated.",
            qs.stream().map(Question::getId).collect(Collectors.toList()), marks);
    }

    // ── PDF Generation ────────────────────────────────────────────────────────

    public Map<String, Object> generatePdfContent(String id, boolean includeAnswers) {
        Exam exam = findOne(id);
        List<Question> allQuestions = questionService.getByIds(exam.getAllQuestionIds());
        String html = buildPdfHtml(exam, allQuestions, includeAnswers);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("html", html);
        result.put("exam", exam);
        result.put("questions", allQuestions);
        return result;
    }

    private String buildPdfHtml(Exam exam, List<Question> questions, boolean includeAnswers) {
        Map<String, Question> qMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        StringBuilder html = new StringBuilder();
        html.append("""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .section { margin: 20px 0; }
    .question { margin: 15px 0; padding: 10px; border-left: 3px solid #2563eb; }
    .options { margin-left: 20px; }
    .answer-box { background: #f0fdf4; padding: 10px; margin-top: 10px; border-radius: 4px; }
    .explanation { color: #666; font-style: italic; margin-top: 5px; }
    .footer { text-align: center; margin-top: 40px; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>""");
        html.append(esc(exam.getTitle()))
            .append("</h1>\n    <p>Subject: ").append(esc(exam.getSubject()))
            .append(" | Duration: ").append(exam.getDuration()).append(" minutes")
            .append(" | Total Marks: ").append(exam.getTotalMarks()).append("</p>\n");
        if (exam.getInstructions() != null)
            html.append("    <p><em>").append(esc(exam.getInstructions())).append("</em></p>\n");
        html.append("  </div>\n");

        int qNum = 1;
        for (ExamSection section : exam.getSections()) {
            html.append("  <div class=\"section\">\n    <h2>").append(esc(section.getTitle())).append("</h2>\n");
            if (section.getInstructions() != null)
                html.append("    <p><em>").append(esc(section.getInstructions())).append("</em></p>\n");

            for (String qId : section.getQuestionIds()) {
                Question q = qMap.get(qId);
                if (q == null) continue;
                html.append("    <div class=\"question\">\n      <p><strong>Q").append(qNum)
                    .append(".</strong> [").append(q.getWeight()).append(" marks] ")
                    .append(esc(q.getText())).append("</p>\n");
                if (q.getOptions() != null && !q.getOptions().isEmpty()) {
                    html.append("      <div class=\"options\">\n");
                    q.getOptions().forEach(opt -> html.append("        <p>(")
                        .append(esc(opt.getId())).append(") ").append(esc(opt.getText())).append("</p>\n"));
                    html.append("      </div>\n");
                }
                if (includeAnswers) {
                    html.append("      <div class=\"answer-box\"><h4>Answer</h4><p>")
                        .append(esc(q.getAnswer())).append("</p></div>\n");
                    if (q.getExplanation() != null)
                        html.append("      <div class=\"explanation\"><strong>Explanation:</strong> ")
                            .append(esc(q.getExplanation())).append("</div>\n");
                }
                html.append("    </div>\n");
                qNum++;
            }
            html.append("  </div>\n");
        }
        html.append("  <div class=\"footer\">\n    <p>Generated by BloomGate | Exam ID: ")
            .append(exam.getId()).append("</p>\n  </div>\n</body>\n</html>");
        return html.toString();
    }

    private String esc(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                   .replace("\"", "&quot;").replace("'", "&#x27;");
    }

    // ── College Management ────────────────────────────────────────────────────

    @Transactional
    public College createCollege(String name, String email, String contactPerson,
            String address, String phone) {
        College college = new College();
        college.setName(name);
        college.setEmail(email);
        college.setContactPerson(contactPerson);
        college.setAddress(address);
        college.setPhone(phone);
        return collegeRepository.save(college);
    }

    @Transactional
    public College createCollegeFromDto(Map<String, Object> dto) {
        return createCollege(
            (String) dto.get("name"),
            (String) dto.get("email"),
            (String) dto.get("contactPerson"),
            (String) dto.get("address"),
            (String) dto.get("phone")
        );
    }

    public List<College> getAllColleges() {
        return collegeRepository.findAll();
    }

    public College getCollege(String id) {
        return collegeRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "College with ID " + id + " not found"));
    }

    // ── Distribution ──────────────────────────────────────────────────────────

    @Transactional
    public Exam distributeExam(String examId, List<String> collegeIds) {
        Exam exam = findOne(examId);
        List<ExamDistribution> newDist = collegeIds.stream().map(cId -> {
            College c = getCollege(cId);
            return new ExamDistribution(cId, c.getName(), c.getEmail());
        }).collect(Collectors.toList());

        exam.getDistributions().addAll(newDist);
        exam.setStatus(ExamStatus.DISTRIBUTED);
        exam.setUpdatedAt(Instant.now());
        return examRepository.save(exam);
    }

    // ── Modifications with BloomJoin ──────────────────────────────────────────

    @Transactional
    public Map<String, Object> modifyDistributedExam(Map<String, Object> dto) {
        String examId = (String) dto.get("examId");
        Exam exam = findOne(examId);

        if (exam.getStatus() != ExamStatus.DISTRIBUTED && exam.getStatus() != ExamStatus.MODIFIED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Can only modify distributed exams");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> modDtos = (List<Map<String, Object>>) dto.get("modifications");

        List<ExamModification> newMods = modDtos.stream().map(m -> {
            ExamModification mod = new ExamModification();
            mod.setQuestionId((String) m.get("questionId"));
            mod.setChangeType(ChangeType.fromValue((String) m.get("changeType")));
            mod.setDescription((String) m.get("description"));
            return mod;
        }).collect(Collectors.toList());

        for (Map<String, Object> m : modDtos) {
            String ct = (String) m.get("changeType");
            String qId = (String) m.get("questionId");
            if ("remove".equals(ct)) {
                exam.getSections().forEach(s -> s.getQuestionIds().remove(qId));
            } else if ("add".equals(ct)) {
                String newQId = (String) m.get("newQuestionId");
                if (newQId != null && !exam.getSections().isEmpty())
                    exam.getSections().get(0).getQuestionIds().add(newQId);
            }
        }

        exam.getModifications().addAll(newMods);
        exam.setStatus(ExamStatus.MODIFIED);
        exam.setVersion(exam.getVersion() + 1);
        exam.setUpdatedAt(Instant.now());
        Exam saved = examRepository.save(exam);

        List<String> modIds = newMods.stream().map(ExamModification::getId).collect(Collectors.toList());
        BloomFilterData filter = bloomFilterService.createModificationFilter(examId, modIds);
        List<String> affectedColleges = saved.getDistributions().stream()
                .map(ExamDistribution::getCollegeId).collect(Collectors.toList());

        Map<String, Object> syncData = new LinkedHashMap<>();
        syncData.put("filter", filter);
        syncData.put("modificationsToSync", newMods);
        syncData.put("affectedColleges", affectedColleges);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("exam", saved);
        result.put("syncData", syncData);
        return result;
    }

    public Map<String, Object> syncWithCollege(String examId, String collegeId,
            List<Map<String, Object>> collegeModifications) {
        Exam exam = findOne(examId);
        List<String> masterModIds = exam.getModifications().stream()
                .map(ExamModification::getId).collect(Collectors.toList());
        List<Map<String, Object>> masterModMaps = exam.getModifications().stream().map(m -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", m.getId());
            map.put("questionId", m.getQuestionId());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> joinResult = bloomFilterService.performBloomJoin(
                masterModMaps, collegeModifications, masterModIds);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> matching = (List<Map<String, Object>>) joinResult.get("matchingRecords");
        Set<String> matchedIds = matching.stream()
                .map(r -> r.get("id").toString()).collect(Collectors.toSet());

        List<ExamModification> toApply = exam.getModifications().stream()
                .filter(m -> !matchedIds.contains(m.getId())).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("needsSync", !toApply.isEmpty());
        result.put("modificationsToApply", toApply);
        return result;
    }

    // ── Full exam with questions ───────────────────────────────────────────────

    public Map<String, Object> getExamWithQuestions(String examId) {
        Exam exam = findOne(examId);
        List<Map<String, Object>> sections = exam.getSections().stream().map(section -> {
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("section", section);
            s.put("questions", questionService.getByIds(section.getQuestionIds()));
            return s;
        }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("exam", exam);
        result.put("sections", sections);
        return result;
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private void applyExamDto(Exam exam, Map<String, Object> dto) {
        if (dto.containsKey("title"))       exam.setTitle((String) dto.get("title"));
        if (dto.containsKey("subject"))     exam.setSubject((String) dto.get("subject"));
        if (dto.containsKey("description")) exam.setDescription((String) dto.get("description"));
        if (dto.containsKey("instructions")) exam.setInstructions((String) dto.get("instructions"));
        if (dto.containsKey("duration") && dto.get("duration") != null)
            exam.setDuration(((Number) dto.get("duration")).intValue());
        if (dto.containsKey("totalMarks") && dto.get("totalMarks") != null)
            exam.setTotalMarks(((Number) dto.get("totalMarks")).intValue());
        if (dto.containsKey("passingMarks") && dto.get("passingMarks") != null)
            exam.setPassingMarks(((Number) dto.get("passingMarks")).intValue());
        if (dto.containsKey("status") && dto.get("status") != null)
            exam.setStatus(ExamStatus.fromValue(dto.get("status").toString()));
        if (dto.containsKey("sections") && dto.get("sections") != null) {
            List<Map<String, Object>> sectionDtos = (List<Map<String, Object>>) dto.get("sections");
            List<ExamSection> sections = sectionDtos.stream().map(s -> {
                ExamSection sec = new ExamSection();
                if (s.containsKey("id"))           sec.setId((String) s.get("id"));
                if (s.containsKey("title"))        sec.setTitle((String) s.get("title"));
                if (s.containsKey("instructions")) sec.setInstructions((String) s.get("instructions"));
                if (s.containsKey("questionIds"))  sec.setQuestionIds((List<String>) s.get("questionIds"));
                if (s.containsKey("totalMarks") && s.get("totalMarks") != null)
                    sec.setTotalMarks(((Number) s.get("totalMarks")).intValue());
                return sec;
            }).collect(Collectors.toList());
            exam.setSections(sections);
        }
    }
}

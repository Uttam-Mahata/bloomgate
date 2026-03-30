package com.bloomgate.question;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service layer for the Question module.
 *
 * <p>All business logic lives here.  Data access is delegated to
 * {@link QuestionRepository} (entities) and {@link ModificationLogRepository}
 * (audit trail), keeping the service free of persistence concerns.</p>
 */
@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ModificationLogRepository modificationLogRepository;

    public QuestionService(QuestionRepository questionRepository,
                           ModificationLogRepository modificationLogRepository) {
        this.questionRepository = questionRepository;
        this.modificationLogRepository = modificationLogRepository;
    }

    // ── Seed sample data on startup ───────────────────────────────────────────

    @PostConstruct
    @Transactional
    public void seedSampleQuestions() {
        if (questionRepository.count() > 0) return;

        createQuestion(buildQuestion(
            "What is the time complexity of binary search?",
            QuestionType.MULTIPLE_CHOICE, QuestionComplexity.MEDIUM, 2,
            "Computer Science", "Algorithms",
            List.of("search", "complexity", "binary-search"),
            List.of(
                new QuestionOption("1", "O(n)", false),
                new QuestionOption("2", "O(log n)", true),
                new QuestionOption("3", "O(n²)", false),
                new QuestionOption("4", "O(1)", false)
            ),
            "O(log n)",
            "Binary search divides the search space in half each iteration, resulting in logarithmic time complexity."
        ));

        createQuestion(buildQuestion(
            "Explain the concept of a Bloom Filter and its applications.",
            QuestionType.LONG_ANSWER, QuestionComplexity.HARD, 10,
            "Computer Science", "Data Structures",
            List.of("bloom-filter", "probabilistic", "data-structures"),
            null,
            "A Bloom filter is a space-efficient probabilistic data structure used to test whether an element is a member of a set. It may have false positives but never false negatives.",
            "Applications include spell checkers, cache filtering, and distributed systems for membership queries."
        ));

        createQuestion(buildQuestion(
            "What is the difference between TCP and UDP?",
            QuestionType.SHORT_ANSWER, QuestionComplexity.EASY, 3,
            "Computer Science", "Networking",
            List.of("networking", "protocols", "tcp", "udp"),
            null,
            "TCP is connection-oriented and reliable, while UDP is connectionless and faster but unreliable.",
            null
        ));

        createQuestion(buildQuestion(
            "A hash table has O(1) average time complexity for search operations.",
            QuestionType.TRUE_FALSE, QuestionComplexity.EASY, 1,
            "Computer Science", "Data Structures",
            List.of("hash-table", "complexity"),
            List.of(
                new QuestionOption("1", "True", true),
                new QuestionOption("2", "False", false)
            ),
            "True", null
        ));

        createQuestion(buildQuestion(
            "The process of converting data into a fixed-size value is called ________.",
            QuestionType.FILL_BLANK, QuestionComplexity.MEDIUM, 2,
            "Computer Science", "Cryptography",
            List.of("hashing", "cryptography"),
            null, "hashing", null
        ));
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Transactional
    public Question createQuestion(Question question) {
        Question saved = questionRepository.save(question);
        log(saved.getId(), "create");
        return saved;
    }

    @Transactional
    public Question create(Map<String, Object> dto) {
        Question q = new Question();
        applyDto(q, dto);
        return createQuestion(q);
    }

    public List<Question> findAll(String subject, String topic,
            QuestionComplexity complexity, QuestionType type,
            List<String> tags, Integer minWeight, Integer maxWeight,
            Boolean isActive) {

        return questionRepository.findAll().stream()
            .filter(q -> subject == null || (q.getSubject() != null &&
                         q.getSubject().toLowerCase().contains(subject.toLowerCase())))
            .filter(q -> topic == null || (q.getTopic() != null &&
                         q.getTopic().toLowerCase().contains(topic.toLowerCase())))
            .filter(q -> complexity == null || q.getComplexity() == complexity)
            .filter(q -> type == null || q.getType() == type)
            .filter(q -> tags == null || tags.isEmpty() ||
                         tags.stream().anyMatch(t -> q.getTags().contains(t)))
            .filter(q -> minWeight == null || q.getWeight() >= minWeight)
            .filter(q -> maxWeight == null || q.getWeight() <= maxWeight)
            .filter(q -> isActive == null || q.getIsActive() == isActive)
            .collect(Collectors.toList());
    }

    public Question findOne(String id) {
        return questionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Question with ID " + id + " not found"));
    }

    @Transactional
    public Question update(String id, Map<String, Object> dto) {
        Question existing = findOne(id);
        applyDto(existing, dto);
        existing.setUpdatedAt(Instant.now());
        existing.setVersion(existing.getVersion() + 1);
        Question saved = questionRepository.save(existing);
        log(id, "update");
        return saved;
    }

    @Transactional
    public void remove(String id) {
        if (!questionRepository.existsById(id)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Question with ID " + id + " not found");
        }
        questionRepository.deleteById(id);
        log(id, "delete");
    }

    @Transactional
    public List<Question> bulkImport(List<Map<String, Object>> dtos) {
        return dtos.stream().map(this::create).collect(Collectors.toList());
    }

    public List<Question> getByIds(List<String> ids) {
        return questionRepository.findAllById(ids);
    }

    // ── Modification log queries ───────────────────────────────────────────────

    public List<String> getModifiedIds(Instant since) {
        List<ModificationLog> logs = (since == null)
            ? modificationLogRepository.findAll()
            : modificationLogRepository.findByTimestampGreaterThanEqual(since);
        return logs.stream().map(ModificationLog::getQuestionId).collect(Collectors.toList());
    }

    // ── Statistics ────────────────────────────────────────────────────────────

    public Map<String, Object> getStatistics() {
        List<Question> all = questionRepository.findAll();
        Map<String, Integer> byComplexity = new LinkedHashMap<>();
        Map<String, Integer> byType = new LinkedHashMap<>();
        Map<String, Integer> bySubject = new LinkedHashMap<>();

        for (QuestionComplexity c : QuestionComplexity.values()) byComplexity.put(c.getValue(), 0);
        for (QuestionType t : QuestionType.values()) byType.put(t.getValue(), 0);

        for (Question q : all) {
            byComplexity.merge(q.getComplexity().getValue(), 1, Integer::sum);
            byType.merge(q.getType().getValue(), 1, Integer::sum);
            if (q.getSubject() != null)
                bySubject.merge(q.getSubject(), 1, Integer::sum);
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", all.size());
        stats.put("byComplexity", byComplexity);
        stats.put("byType", byType);
        stats.put("bySubject", bySubject);
        return stats;
    }

    // ── Random selection ─────────────────────────────────────────────────────

    public List<Question> generateRandomSelection(int count, String subject,
            List<QuestionComplexity> complexity, List<QuestionType> types,
            Integer totalWeight) {

        List<Question> pool = findAll(subject, null, null, null, null, null, null, true);

        if (complexity != null && !complexity.isEmpty())
            pool = pool.stream().filter(q -> complexity.contains(q.getComplexity())).collect(Collectors.toList());
        if (types != null && !types.isEmpty())
            pool = pool.stream().filter(q -> types.contains(q.getType())).collect(Collectors.toList());

        Collections.shuffle(pool);

        if (totalWeight != null) {
            List<Question> selected = new ArrayList<>();
            int currentWeight = 0;
            for (Question q : pool) {
                if (currentWeight + q.getWeight() <= totalWeight) {
                    selected.add(q);
                    currentWeight += q.getWeight();
                }
                if (selected.size() >= count) break;
            }
            return selected;
        }

        return pool.subList(0, Math.min(count, pool.size()));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void log(String questionId, String action) {
        modificationLogRepository.save(new ModificationLog(questionId, Instant.now(), action));
    }

    private Question buildQuestion(String text, QuestionType type, QuestionComplexity complexity,
            int weight, String subject, String topic, List<String> tags,
            List<QuestionOption> options, String answer, String explanation) {
        Question q = new Question();
        q.setText(text);
        q.setType(type);
        q.setComplexity(complexity);
        q.setWeight(weight);
        q.setSubject(subject);
        q.setTopic(topic);
        q.setTags(new ArrayList<>(tags));
        q.setOptions(options);
        q.setAnswer(answer);
        q.setExplanation(explanation);
        return q;
    }

    @SuppressWarnings("unchecked")
    private void applyDto(Question q, Map<String, Object> dto) {
        if (dto.containsKey("text")) q.setText((String) dto.get("text"));
        if (dto.containsKey("type") && dto.get("type") != null)
            q.setType(QuestionType.fromValue(dto.get("type").toString()));
        if (dto.containsKey("complexity") && dto.get("complexity") != null)
            q.setComplexity(QuestionComplexity.fromValue(dto.get("complexity").toString()));
        if (dto.containsKey("weight") && dto.get("weight") != null)
            q.setWeight(((Number) dto.get("weight")).intValue());
        if (dto.containsKey("subject")) q.setSubject((String) dto.get("subject"));
        if (dto.containsKey("topic")) q.setTopic((String) dto.get("topic"));
        if (dto.containsKey("tags"))
            q.setTags(dto.get("tags") != null ? (List<String>) dto.get("tags") : new ArrayList<>());
        if (dto.containsKey("answer")) q.setAnswer((String) dto.get("answer"));
        if (dto.containsKey("explanation")) q.setExplanation((String) dto.get("explanation"));
        if (dto.containsKey("imageUrl")) q.setImageUrl((String) dto.get("imageUrl"));
        if (dto.containsKey("isActive") && dto.get("isActive") != null)
            q.setIsActive((Boolean) dto.get("isActive"));
        if (dto.containsKey("options") && dto.get("options") != null) {
            List<Map<String, Object>> optList = (List<Map<String, Object>>) dto.get("options");
            List<QuestionOption> opts = optList.stream().map(o -> {
                QuestionOption opt = new QuestionOption();
                opt.setId((String) o.get("id"));
                opt.setText((String) o.get("text"));
                Object ic = o.get("isCorrect");
                if (ic instanceof Boolean) opt.setIsCorrect((Boolean) ic);
                return opt;
            }).collect(Collectors.toList());
            q.setOptions(opts);
        }
    }
}

package com.bloomgate.question;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    public Question create(@RequestBody Map<String, Object> body) {
        return questionService.create(body);
    }

    @GetMapping
    public List<Question> findAll(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String complexity,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) Integer minWeight,
            @RequestParam(required = false) Integer maxWeight,
            @RequestParam(required = false) Boolean isActive) {

        QuestionComplexity complexityEnum = complexity != null ? QuestionComplexity.fromValue(complexity) : null;
        QuestionType typeEnum = type != null ? QuestionType.fromValue(type) : null;
        List<String> tagList = tags != null ? List.of(tags.split(",")) : null;

        return questionService.findAll(subject, topic, complexityEnum, typeEnum, tagList, minWeight, maxWeight, isActive);
    }

    @GetMapping("/statistics")
    public Map<String, Object> getStatistics() {
        return questionService.getStatistics();
    }

    @GetMapping("/modified")
    public List<String> getModified(@RequestParam(required = false) String since) {
        Instant sinceInstant = since != null ? Instant.parse(since) : null;
        return questionService.getModifiedIds(sinceInstant);
    }

    @GetMapping("/{id}")
    public Question findOne(@PathVariable String id) {
        return questionService.findOne(id);
    }

    @PutMapping("/{id}")
    public Question update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return questionService.update(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable String id) {
        questionService.remove(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk-import")
    public List<Question> bulkImport(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> questionsList = (List<Map<String, Object>>) body.get("questions");
        return questionService.bulkImport(questionsList);
    }

    @PostMapping("/generate-selection")
    public List<Question> generateSelection(@RequestBody Map<String, Object> criteria) {
        int count = criteria.containsKey("count") ? ((Number) criteria.get("count")).intValue() : 5;
        String subject = (String) criteria.get("subject");

        @SuppressWarnings("unchecked")
        List<String> complexityStrings = (List<String>) criteria.get("complexity");
        List<QuestionComplexity> complexities = complexityStrings != null
                ? complexityStrings.stream().map(QuestionComplexity::fromValue).toList()
                : null;

        @SuppressWarnings("unchecked")
        List<String> typeStrings = (List<String>) criteria.get("types");
        List<QuestionType> types = typeStrings != null
                ? typeStrings.stream().map(QuestionType::fromValue).toList()
                : null;

        Integer totalWeight = criteria.containsKey("totalWeight") && criteria.get("totalWeight") != null
                ? ((Number) criteria.get("totalWeight")).intValue() : null;

        return questionService.generateRandomSelection(count, subject, complexities, types, totalWeight);
    }
}

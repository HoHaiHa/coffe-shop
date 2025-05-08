package com.haui.coffee_shop.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RagService {

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    private final List<String> documentChunks = new ArrayList<>();
    private final Map<String, List<Double>> embeddingCache = new HashMap<>();
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Autowired
    private ResourceLoader resourceLoader;

    //@Value("${google.api.key}")
    private String apiKey = "AIzaSyCPJbGm_42wwBW3kP0ldtsFmxweHLzvf90";

    @PostConstruct
    public void init() {
        try {
            loadDocuments(List.of("classpath:gioiThieuQuan.docx"));
        } catch (Exception e) {
            throw new RuntimeException("Không thể khởi tạo tài liệu", e);
        }
    }

    public void loadDocuments(List<String> wordFiles) throws Exception {
        documentChunks.clear();
        embeddingCache.clear();

        for (String path : wordFiles) {
            Resource resource = resourceLoader.getResource(path);
            try (InputStream inputStream = resource.getInputStream()) {
                XWPFDocument doc = new XWPFDocument(inputStream);
                StringBuilder currentChunk = new StringBuilder();
                
                for (XWPFParagraph para : doc.getParagraphs()) {
                    String text = para.getText().trim();
                    if (!text.isEmpty()) {
                        if (currentChunk.length() + text.length() < 500) {
                            if (currentChunk.length() > 0) currentChunk.append("\n");
                            currentChunk.append(text);
                        } else {
                            addChunk(currentChunk.toString());
                            currentChunk = new StringBuilder(text);
                        }
                    }
                }
                if (currentChunk.length() > 0) {
                    addChunk(currentChunk.toString());
                }
            }
        }
    }

    private void addChunk(String chunk) {
        documentChunks.add(chunk);
    }

    public String ask(String question) throws Exception {
        if (documentChunks.isEmpty()) {
            throw new IllegalStateException("Chưa load tài liệu");
        }

        // 1. Tính embedding cho câu hỏi
        List<Double> questionEmbedding = getOrComputeEmbedding(question);
        
        // 2. Tìm các đoạn phù hợp nhất
        List<String> topChunks = findMostRelevantChunks(questionEmbedding, 3);

        // 3. Tạo prompt và gọi Gemini
        return generateResponse(question, topChunks);
    }

    private List<String> findMostRelevantChunks(List<Double> questionEmbedding, int topN) {
        return documentChunks.stream()
                .map(chunk -> new ChunkSimilarity(
                        chunk, 
                        cosineSimilarity(questionEmbedding, getOrComputeEmbedding(chunk))
                )) // Đảm bảo dấu ngoặc đóng đúng
                .sorted(Comparator.comparingDouble(ChunkSimilarity::similarity).reversed())
                .limit(topN)
                .map(ChunkSimilarity::chunk)
                .collect(Collectors.toList());
    }

    private String generateResponse(String question, List<String> contextChunks) throws Exception {
        String context = String.join("\n\n", contextChunks);
        String prompt = String.format(
                "Bạn là trợ lý ảo của quán cà phê. Hãy trả lời câu hỏi dựa trên thông tin sau:\n" +
                "=== THÔNG TIN THAM KHẢO ===\n%s\n" +
                "=== CÂU HỎI ===\n%s\n" +
                "=== YÊU CẦU ===\n" +
                "- Trả lời ngắn gọn, chính xác\n" +
                "- Nếu không có thông tin, trả lời 'Tôi không tìm thấy thông tin phù hợp'", 
                context, question);
        
        return askGemini(prompt);
    }

    private List<Double> getOrComputeEmbedding(String text) {
        return embeddingCache.computeIfAbsent(text, this::computeEmbedding);
    }

    private List<Double> computeEmbedding(String text) {
        // Triển khai thực tế nên dùng thư viện embedding local
        // Ở đây dùng ví dụ đơn giản cho mục đích minh họa
        int vectorSize = 384;
        List<Double> embedding = new ArrayList<>(vectorSize);
        Random rand = new Random(text.hashCode());
        for (int i = 0; i < vectorSize; i++) {
            embedding.add(rand.nextDouble() * 2 - 1);
        }
        return embedding;
    }

    private double cosineSimilarity(List<Double> a, List<Double> b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.size(); i++) {
            dot += a.get(i) * b.get(i);
            normA += a.get(i) * a.get(i);
            normB += b.get(i) * b.get(i);
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private String askGemini(String prompt) throws Exception {
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            ),
            "generationConfig", Map.of(
                "temperature", 0.7,
                "topP", 0.9,
                "maxOutputTokens", 1000
            )
        );

        String requestBodyJson = objectMapper.writeValueAsString(requestBody);
        String apiUrl = GEMINI_API_URL + "?key=" + apiKey;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(apiUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("API request failed: " + response.body());
        }

        try {
            Map<String, Object> responseMap = objectMapper.readValue(response.body(), Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
            
            if (candidates == null || candidates.isEmpty()) {
                return "Không nhận được phản hồi từ API";
            }

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            throw new RuntimeException("Lỗi phân tích phản hồi từ API", e);
        }
    }

    private record ChunkSimilarity(String chunk, double similarity) {}
}
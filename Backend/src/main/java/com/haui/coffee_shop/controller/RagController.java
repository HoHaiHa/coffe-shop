package com.haui.coffee_shop.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.haui.coffee_shop.service.RagService;

@RestController
@RequestMapping("/api")
public class RagController {

    @Autowired
    private RagService ragService;

    @PostMapping("/ask")
    public ResponseEntity<String> askQuestion(@RequestBody String question) {
        try {
            String answer = ragService.ask(question);
            return ResponseEntity.ok(answer);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}


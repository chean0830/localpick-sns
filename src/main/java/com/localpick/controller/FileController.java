package com.localpick.controller;

import com.localpick.global.LoginSession;
import com.localpick.service.FileService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/api/files")
    public Map<String, String> upload(@RequestParam("file") MultipartFile file, HttpSession session) {
        LoginSession.require(session);
        return Map.of("url", fileService.save(file));
    }
}

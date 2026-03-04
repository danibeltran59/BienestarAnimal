package com.bienestaranimal.app.controller;

import com.bienestaranimal.app.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.storeFile(file);
        return ResponseEntity.ok(Collections.singletonMap("url", url));
    }

    @GetMapping("/download/{*fileName}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String fileName,
            @RequestParam(required = false, defaultValue = "false") boolean download) {
        try {
            String cleanFileName = fileName.startsWith("/") ? fileName.substring(1) : fileName;
            Path filePath = Paths.get("uploads").resolve(cleanFileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null || (!contentType.equals("application/pdf")
                        && filePath.toString().toLowerCase().endsWith(".pdf"))) {
                    if (filePath.toString().toLowerCase().endsWith(".pdf")) {
                        contentType = "application/pdf";
                    } else if (contentType == null) {
                        contentType = "application/octet-stream";
                    }
                }

                ResponseEntity.BodyBuilder responseBuilder = ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType));

                if (download) {
                    responseBuilder.header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"");
                } else {
                    responseBuilder.header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + resource.getFilename() + "\"");
                }

                return responseBuilder.body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

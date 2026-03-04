package com.bienestaranimal.app.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.web.util.UriUtils;

@RestController
@RequestMapping("/api/guias")
public class GuiaController {

    // Carpeta donde están los PDFs reales
    private final String guidesDir = "Guias animales";

    @GetMapping
    public ResponseEntity<List<GuiaItem>> listGuias() {
        try {
            Path path = Paths.get(guidesDir);
            if (!Files.exists(path)) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            try (Stream<Path> stream = Files.list(path)) {
                List<GuiaItem> guias = stream
                        .filter(file -> !Files.isDirectory(file))
                        .filter(file -> file.getFileName().toString().toLowerCase().endsWith(".pdf"))
                        .map(file -> {
                            String fileName = file.getFileName().toString();
                            String title = beautifyTitle(fileName);
                            String encodedName = UriUtils.encodePathSegment(fileName, StandardCharsets.UTF_8);
                            return new GuiaItem(title, "/api/guias/file/" + encodedName);
                        })
                        .collect(Collectors.toList());
                return ResponseEntity.ok(guias);
            }
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/file/{*fileName}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String fileName,
            @RequestParam(required = false, defaultValue = "false") boolean download) {
        try {
            // Eliminar barra inicial si existe
            String cleanName = fileName.startsWith("/") ? fileName.substring(1) : fileName;
            Path filePath = Paths.get(guidesDir).resolve(cleanName).normalize();

            // Seguridad: evitar path traversal
            if (!filePath.startsWith(Paths.get(guidesDir).toAbsolutePath()) &&
                    !filePath.toAbsolutePath().startsWith(Paths.get(guidesDir).toAbsolutePath())) {
                // allow relative check too
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = "application/pdf";

            ResponseEntity.BodyBuilder builder = ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType));

            if (download) {
                builder.header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"");
            } else {
                builder.header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\"");
            }

            return builder.body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String beautifyTitle(String fileName) {
        String title = fileName.replace(".pdf", "");
        title = title.replace("_", " ").replace("-", " ");
        title = title.replaceAll("\\s[a-f0-9]{10}$", "");
        return title.trim();
    }

    @Data
    @AllArgsConstructor
    public static class GuiaItem {
        private String title;
        private String downloadUrl;
    }
}

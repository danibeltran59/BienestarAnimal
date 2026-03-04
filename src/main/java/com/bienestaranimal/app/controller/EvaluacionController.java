package com.bienestaranimal.app.controller;

import com.bienestaranimal.app.model.Evaluacion;
import com.bienestaranimal.app.service.AnimalService;
import com.bienestaranimal.app.service.EvaluacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluaciones")
@RequiredArgsConstructor
public class EvaluacionController {

    private final EvaluacionService evaluacionService;
    private final AnimalService animalService;

    // DTO for List Views (Lightweight - History/Dashboard)
    @lombok.Data
    @lombok.Builder
    private static class EvaluacionResumenDTO {
        private Long id;
        private String fechaHora;
        private String animalNombre;
        private Long animalId;
        private String evaluador;
        private String cargo;
        private Integer puntuacionGlobal;
        private Integer nivelConfianza;
        private Integer puntuacionMental; // New field for Dashboard
    }

    // DTO for Detailed Views (Graphs/Intelligence)
    @lombok.Data
    @lombok.Builder
    private static class EvaluacionDetalleDTO {
        private Long id;
        private String fechaHora;
        private String animalNombre;
        private Long animalId;
        private String evaluador;
        private String cargo;
        private Integer puntuacionGlobal;
        private Integer nivelConfianza;
        private java.util.List<RespuestaDTO> respuestasDetalladas;
    }

    // Nested DTOs to mimic Entity structure for Frontend logic compatibility
    // (Graphs.jsx)
    @lombok.Data
    @lombok.Builder
    private static class RespuestaDTO {
        private Integer puntos;
        private PreguntaDTO pregunta;
    }

    @lombok.Data
    @lombok.Builder
    private static class PreguntaDTO {
        private String categoria;
    }

    private EvaluacionResumenDTO mapToDTO(Evaluacion e) {
        // Calculate Mental State score specifically for Dashboard
        Integer mentalScore = 0;
        if (e.getRespuestasDetalladas() != null && !e.getRespuestasDetalladas().isEmpty()) {
            double sum = 0;
            int count = 0;
            // System.out.println("Processing Eval ID: " + e.getId() + " - Answers: " +
            // e.getRespuestasDetalladas().size());
            for (com.bienestaranimal.app.model.RespuestaPregunta r : e.getRespuestasDetalladas()) {
                if (r.getPregunta() != null) {
                    // System.out.println(" - Pregunta Category: " +
                    // r.getPregunta().getCategoria());
                    if ("ESTADO MENTAL".equalsIgnoreCase(r.getPregunta().getCategoria())) {
                        if (r.getPuntos() != null) {
                            // Points are already 0-100 (A=100, B=50, C=0)
                            sum += r.getPuntos();
                            count++;
                            // System.out.println(" -> MATCH Mental! Points: " + r.getPuntos() + ", Count: "
                            // + count);
                        }
                    }
                }
            }
            if (count > 0) {
                mentalScore = (int) Math.round(sum / count);
                // System.out.println(" => Final Mental Score: " + mentalScore);
            }
        } else {
            // System.out.println("Eval ID: " + e.getId() + " has NULL or EMPTY answers.");
        }

        // Force logging for at least one evaluation if needed, but let's keep it clean
        // for now.
        // Or actually, user says it DOES NOT work, so I NEED logs.
        if (mentalScore > 0) {
            System.out.println("DEBUG: Eval " + e.getId() + " Mental Score Calculated: " + mentalScore);
        } else if (e.getRespuestasDetalladas() != null && !e.getRespuestasDetalladas().isEmpty()) {
            // Check if we are missing it
            long mentalCount = e.getRespuestasDetalladas().stream().filter(
                    r -> r.getPregunta() != null && "ESTADO MENTAL".equalsIgnoreCase(r.getPregunta().getCategoria()))
                    .count();
            if (mentalCount == 0)
                System.out.println("DEBUG: Eval " + e.getId() + " has answers but NO 'ESTADO MENTAL' category found.");
        }

        return EvaluacionResumenDTO.builder()
                .id(e.getId())
                .fechaHora(e.getFechaHora() != null ? e.getFechaHora().toString() : null)
                .animalNombre(e.getAnimal() != null ? e.getAnimal().getNombre() : "Desconocido")
                .animalId(e.getAnimal() != null ? e.getAnimal().getId() : null)
                .evaluador(e.getEvaluador())
                .cargo(e.getCargo())
                .puntuacionGlobal(e.getPuntuacionGlobal())
                .nivelConfianza(e.getNivelConfianza())
                .puntuacionMental(mentalScore)
                .build();
    }

    private EvaluacionDetalleDTO mapToDetalleDTO(Evaluacion e) {
        return EvaluacionDetalleDTO.builder()
                .id(e.getId())
                .fechaHora(e.getFechaHora() != null ? e.getFechaHora().toString() : null)
                .animalNombre(e.getAnimal() != null ? e.getAnimal().getNombre() : "Desconocido")
                .animalId(e.getAnimal() != null ? e.getAnimal().getId() : null)
                .evaluador(e.getEvaluador())
                .cargo(e.getCargo())
                .puntuacionGlobal(e.getPuntuacionGlobal())
                .nivelConfianza(e.getNivelConfianza())
                .respuestasDetalladas(e.getRespuestasDetalladas() != null ? e.getRespuestasDetalladas().stream()
                        .map(r -> RespuestaDTO.builder()
                                .puntos(r.getPuntos())
                                .pregunta(r.getPregunta() != null
                                        ? PreguntaDTO.builder().categoria(r.getPregunta().getCategoria()).build()
                                        : null)
                                .build())
                        .toList() : java.util.Collections.emptyList())
                .build();
    }

    @GetMapping
    public ResponseEntity<List<EvaluacionResumenDTO>> getAll() {
        return ResponseEntity.ok(evaluacionService.findAll().stream()
                .map(this::mapToDTO)
                .toList());
    }

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<List<EvaluacionDetalleDTO>> getByAnimal(@PathVariable Long animalId) {
        return ResponseEntity.ok(evaluacionService.findByAnimal(animalId).stream()
                .map(this::mapToDetalleDTO)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evaluacion> getById(@PathVariable Long id) {
        return ResponseEntity.ok(evaluacionService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Evaluacion> create(@Valid @RequestBody Evaluacion evaluacion) {
        if (evaluacion.getAnimal() != null && evaluacion.getAnimal().getId() != null) {
            evaluacion.setAnimal(animalService.findById(evaluacion.getAnimal().getId()));
        }
        return ResponseEntity.ok(evaluacionService.save(evaluacion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        evaluacionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

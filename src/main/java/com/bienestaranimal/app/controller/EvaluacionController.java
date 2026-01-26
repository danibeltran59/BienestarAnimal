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

    @GetMapping
    public ResponseEntity<List<Evaluacion>> getAll() {
        return ResponseEntity.ok(evaluacionService.findAll());
    }

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<List<Evaluacion>> getByAnimal(@PathVariable Long animalId) {
        return ResponseEntity.ok(evaluacionService.findByAnimal(animalId));
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

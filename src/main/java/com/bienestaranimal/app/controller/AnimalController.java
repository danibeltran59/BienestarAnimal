package com.bienestaranimal.app.controller;

import com.bienestaranimal.app.model.Animal;
import com.bienestaranimal.app.model.Usuario;
import com.bienestaranimal.app.service.AnimalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/animales")
@RequiredArgsConstructor
public class AnimalController {

    private final AnimalService animalService;

    @GetMapping
    public ResponseEntity<List<Animal>> getAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(animalService.search(search));
        }
        return ResponseEntity.ok(animalService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Animal> getById(@PathVariable Long id) {
        return ResponseEntity.ok(animalService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Animal> create(@Valid @RequestBody Animal animal,
            @AuthenticationPrincipal Usuario usuario) {
        // Asignar el usuario que crea el animal
        animal.setUsuario(usuario);
        return ResponseEntity.ok(animalService.save(animal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Animal> update(@PathVariable Long id, @Valid @RequestBody Animal animalDetails) {
        Animal animal = animalService.findById(id);

        animal.setNombre(animalDetails.getNombre());
        animal.setEspecie(animalDetails.getEspecie());
        animal.setFechaNacimiento(animalDetails.getFechaNacimiento());
        animal.setNotas(animalDetails.getNotas());
        animal.setFotoUrl(animalDetails.getFotoUrl());

        return ResponseEntity.ok(animalService.save(animal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        animalService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

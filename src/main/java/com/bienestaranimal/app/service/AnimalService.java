package com.bienestaranimal.app.service;

import com.bienestaranimal.app.model.Animal;
import com.bienestaranimal.app.repository.AnimalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnimalService {

    private final AnimalRepository animalRepository;

    public List<Animal> findAll() {
        return animalRepository.findAll();
    }

    public List<Animal> search(String query) {
        return animalRepository.findByNombreContainingIgnoreCaseOrEspecieContainingIgnoreCase(query, query);
    }

    public Animal findById(Long id) {
        return animalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Animal no encontrado"));
    }

    public Animal save(Animal animal) {
        return animalRepository.save(animal);
    }

    public void deleteById(Long id) {
        animalRepository.deleteById(id);
    }
}

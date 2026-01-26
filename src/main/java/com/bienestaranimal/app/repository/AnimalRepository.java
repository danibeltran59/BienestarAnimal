package com.bienestaranimal.app.repository;

import com.bienestaranimal.app.model.Animal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnimalRepository extends JpaRepository<Animal, Long> {
    List<Animal> findByNombreContainingIgnoreCaseOrEspecieContainingIgnoreCase(String nombre, String especie);
}

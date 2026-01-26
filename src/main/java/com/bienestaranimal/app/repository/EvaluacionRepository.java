package com.bienestaranimal.app.repository;

import com.bienestaranimal.app.model.Evaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {
    List<Evaluacion> findByAnimalIdOrderByFechaHoraDesc(Long animalId);
}

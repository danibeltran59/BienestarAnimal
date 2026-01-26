package com.bienestaranimal.app.service;

import com.bienestaranimal.app.model.Evaluacion;
import com.bienestaranimal.app.repository.EvaluacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluacionService {

    private final EvaluacionRepository evaluacionRepository;

    public List<Evaluacion> findAll() {
        return evaluacionRepository.findAll();
    }

    public List<Evaluacion> findByAnimal(Long animalId) {
        return evaluacionRepository.findByAnimalIdOrderByFechaHoraDesc(animalId);
    }

    public Evaluacion findById(Long id) {
        return evaluacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
    }

    public Evaluacion save(Evaluacion evaluacion) {
        if (evaluacion.getFechaHora() == null) {
            evaluacion.setFechaHora(LocalDateTime.now());
        }
        if (evaluacion.getRespuestasDetalladas() != null) {
            evaluacion.getRespuestasDetalladas().forEach(r -> r.setEvaluacion(evaluacion));
        }
        return evaluacionRepository.save(evaluacion);
    }

    public void deleteById(Long id) {
        evaluacionRepository.deleteById(id);
    }
}

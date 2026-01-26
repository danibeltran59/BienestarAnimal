package com.bienestaranimal.app.repository;

import com.bienestaranimal.app.model.PreguntaEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreguntaRepository extends JpaRepository<PreguntaEvaluacion, Long> {
    List<PreguntaEvaluacion> findByCategoria(String categoria);
}

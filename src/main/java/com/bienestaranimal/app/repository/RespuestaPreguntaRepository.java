package com.bienestaranimal.app.repository;

import com.bienestaranimal.app.model.RespuestaPregunta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RespuestaPreguntaRepository extends JpaRepository<RespuestaPregunta, Long> {
}

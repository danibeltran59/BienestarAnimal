package com.bienestaranimal.app.controller;

import com.bienestaranimal.app.model.PreguntaEvaluacion;
import com.bienestaranimal.app.repository.PreguntaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/preguntas")
@RequiredArgsConstructor
public class PreguntaController {

    private final PreguntaRepository preguntaRepository;

    @GetMapping
    public List<PreguntaEvaluacion> getPreguntas() {
        return preguntaRepository.findAll();
    }
}

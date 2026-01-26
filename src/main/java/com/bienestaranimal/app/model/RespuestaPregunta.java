package com.bienestaranimal.app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "respuestas_preguntas")
public class RespuestaPregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluacion_id")
    @JsonIgnore
    private Evaluacion evaluacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pregunta_id")
    private PreguntaEvaluacion pregunta;

    private String seleccion; // A, B, C

    private Integer puntos;

    @Column(columnDefinition = "TEXT")
    private String comentario;
}

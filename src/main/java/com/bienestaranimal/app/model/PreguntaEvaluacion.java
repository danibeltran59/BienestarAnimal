package com.bienestaranimal.app.model;

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
@Table(name = "preguntas")
public class PreguntaEvaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String texto;

    @Column(nullable = false)
    private String categoria; // NUTRICIÓN, ALOJAMIENTO, SALUD, COMPORTAMIENTO

    private String opcionA;
    private String opcionB;
    private String opcionC;
    private String opcionD;
    private String opcionE;

    private Integer puntosA;
    private Integer puntosB;
    private Integer puntosC;
    private Integer puntosD;
    private Integer puntosE;
}

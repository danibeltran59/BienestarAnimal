package com.bienestaranimal.app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "evaluaciones")
public class Evaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fechaHora;

    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String recinto;
    private String evaluador;
    private String cargo;

    private Integer puntuacionGlobal;

    @OneToMany(mappedBy = "evaluacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RespuestaPregunta> respuestasDetalladas;

    @Min(1)
    @Max(5)
    private Integer nivelConfianza;

    @Column(columnDefinition = "TEXT")
    private String notas;

    private String fotosUrl; // URLs separadas por coma

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id")
    private Animal animal;
}

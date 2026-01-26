package com.bienestaranimal.app.config;

import com.bienestaranimal.app.model.Animal;
import com.bienestaranimal.app.model.Evaluacion;
import com.bienestaranimal.app.model.Role;
import com.bienestaranimal.app.model.Usuario;
import com.bienestaranimal.app.repository.AnimalRepository;
import com.bienestaranimal.app.repository.EvaluacionRepository;
import com.bienestaranimal.app.repository.UsuarioRepository;
import com.bienestaranimal.app.repository.PreguntaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

        private final UsuarioRepository usuarioRepository;
        private final AnimalRepository animalRepository;
        private final EvaluacionRepository evaluacionRepository;
        private final PreguntaRepository preguntaRepository;
        private final PasswordEncoder passwordEncoder;

        @PersistenceContext
        private EntityManager entityManager;

        private final Random random = new Random();

        @Override
        @Transactional
        public void run(String... args) throws Exception {
                // 1. Asegurar Preguntas (Siempre necesario)
                if (preguntaRepository.count() == 0) {
                        System.out.println("DataLoader: Sembrando preguntas de bienestar...");
                        seedPreguntas();
                }

                // 2. Asegurar Usuarios
                Usuario admin = usuarioRepository.findByEmail("admin@test.com")
                                .orElseGet(() -> usuarioRepository.save(Usuario.builder()
                                                .email("admin@test.com")
                                                .password(passwordEncoder.encode("123456"))
                                                .role(Role.ADMIN)
                                                .build()));

                Usuario cuidador = usuarioRepository.findByEmail("cuidador@test.com")
                                .orElseGet(() -> usuarioRepository.save(Usuario.builder()
                                                .email("cuidador@test.com")
                                                .password(passwordEncoder.encode("123456"))
                                                .role(Role.CUIDADOR)
                                                .build()));

                // 3. Simulación Realista (Solo si la base de datos de animales está vacía)
                if (animalRepository.count() == 0) {
                        System.out.println(
                                        "DataLoader: Base de datos de animales vacía. Iniciando Simulación Realista...");
                        seedSimulation(admin, cuidador);
                } else {
                        System.out.println(
                                        "DataLoader: Registros existentes detectados. Saltando simulación para preservar datos.");
                }

                System.out.println("DataLoader: Proceso finalizado.");
        }

        private void seedSimulation(Usuario admin, Usuario cuidador) {
                String[][] animalData = {
                                { "Kaiser", "León Africano",
                                                "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800" },
                                { "Kiara", "Leona",
                                                "https://images.unsplash.com/photo-1614027129531-1f474818a7c2?w=800" },
                                { "Shere Khan", "Tigre de Bengala",
                                                "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800" },
                                { "Dumbo", "Elefante Africano",
                                                "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800" },
                                { "Melman", "Jirafa Reticulada",
                                                "https://images.unsplash.com/photo-1526336028067-6484187f56b2?w=800" },
                                { "Caesar", "Chimpancé",
                                                "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=800" },
                                { "Pabu", "Panda Rojo",
                                                "https://images.unsplash.com/photo-1544237526-cae15a57ed1e?w=800" },
                                { "Rico", "Flamenco Rosado",
                                                "https://images.unsplash.com/photo-1539418561314-565804e349c0?w=800" },
                                { "George", "Tortuga Galápagos",
                                                "https://images.unsplash.com/photo-1516934024742-b461fba47600?w=800" },
                                { "Frosty", "Leopardo de las Nieves",
                                                "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=800" },
                                { "Marty", "Cebra de Grant",
                                                "https://images.unsplash.com/photo-1501705388883-4ed8a543392c?w=800" },
                                { "Tank", "Rinoceronte Blanco",
                                                "https://images.unsplash.com/photo-1534293230397-c067fc201ab8?w=800" },
                                { "Kala", "Gorila de Montaña",
                                                "https://images.unsplash.com/photo-1591824438708-ce405f36dfaf?w=800" },
                                { "Pascal", "Camaleón Pantera",
                                                "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800" },
                                { "Nile", "Cocodrilo del Nilo",
                                                "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800" }
                };

                List<Animal> createdAnimals = new ArrayList<>();
                for (String[] data : animalData) {
                        createdAnimals.add(animalRepository.save(Animal.builder()
                                        .nombre(data[0])
                                        .especie(data[1])
                                        .fotoUrl(data[2])
                                        .fechaNacimiento(LocalDate.now().minusYears(random.nextInt(15) + 2))
                                        .notas("Ejemplar residente para monitoreo continuo.")
                                        .usuario(random.nextBoolean() ? admin : cuidador)
                                        .build()));
                }

                List<com.bienestaranimal.app.model.PreguntaEvaluacion> preguntas = preguntaRepository.findAll();
                String[] recintos = { "Sector Sabana A", "Aviario Central", "Pabellón Primates", "Reserva Norte" };
                String[] evaluadores = { "Dr. Smith", "Dra. García", "Cuidador Martínez", "Vet. Roberts" };

                for (Animal animal : createdAnimals) {
                        double healthProfile = 0.6 + (random.nextDouble() * 0.4);
                        int numEvals = random.nextInt(5) + 3;

                        for (int j = 0; j < numEvals; j++) {
                                Evaluacion eval = Evaluacion.builder()
                                                .fechaHora(LocalDateTime.now().minusDays((numEvals - j) * 5))
                                                .fechaInicio(LocalDateTime.now().minusHours(2))
                                                .fechaFin(LocalDateTime.now().minusHours(1))
                                                .recinto(recintos[random.nextInt(recintos.length)])
                                                .evaluador(evaluadores[random.nextInt(evaluadores.length)])
                                                .cargo(j == 0 ? "Veterinario Jefe" : "Cuidador Senior")
                                                .nivelConfianza(5)
                                                .animal(animal)
                                                .respuestasDetalladas(new ArrayList<>())
                                                .notas("Monitoreo rutinario de protocolo de bienestar.")
                                                .build();

                                int totalPts = 0;
                                for (com.bienestaranimal.app.model.PreguntaEvaluacion p : preguntas) {
                                        double roll = random.nextDouble();
                                        String sel;
                                        int pts;
                                        if (roll < healthProfile * 0.7) {
                                                sel = "A";
                                                pts = 5;
                                        } else if (roll < healthProfile) {
                                                sel = "B";
                                                pts = 4;
                                        } else if (roll < 0.9) {
                                                sel = "C";
                                                pts = 3;
                                        } else {
                                                sel = "D";
                                                pts = 2;
                                        }

                                        eval.getRespuestasDetalladas()
                                                        .add(com.bienestaranimal.app.model.RespuestaPregunta.builder()
                                                                        .pregunta(p).evaluacion(eval).seleccion(sel)
                                                                        .puntos(pts)
                                                                        .comentario(pts < 4 ? "Observación necesaria."
                                                                                        : "Sin novedades.")
                                                                        .build());
                                        totalPts += pts;
                                }
                                eval.setPuntuacionGlobal((int) Math.round((totalPts * 100.0) / (preguntas.size() * 5)));
                                evaluacionRepository.save(eval);
                        }
                }
        }

        private void seedPreguntas() {
                List<com.bienestaranimal.app.model.PreguntaEvaluacion> preguntas = new ArrayList<>();
                // NUTRICIÓN
                preguntas.add(createPregunta(
                                "¿El animal presenta buena condición corporal respecto a su especie, edad, sexo y estado fisiológico?",
                                "NUTRICIÓN", "Excelente", null, "Bueno", null, "Pobre (1 o 5)", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta(
                                "¿La dieta es adecuada en nutrientes (según especie, edad, sexo, estado fisiológico y salud) y son seguros para ellos?",
                                "NUTRICIÓN", "Si, totalmente", null, "Aceptable", null, "No, inadecuada", 5, 4, 3, 2,
                                1));
                preguntas.add(createPregunta("¿La comida que se ofrece al animal está en buenas condiciones?",
                                "NUTRICIÓN", "Excelente estado", null, "Aceptable", null, "Mal estado", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿La preparación de la comida es higiénica?", "NUTRICIÓN", "Muy higiénica",
                                null, "Aceptable", null, "Antitigénica", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta(
                                "¿La presentación de la comida corresponde con las necesidades de cada individuo?",
                                "NUTRICIÓN", "Si, óptima", null, "Parcialmente", null, "Inadecuada", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta(
                                "¿El agua que se ofrece al animal está en buenas condiciones macroscópicas?",
                                "NUTRICIÓN", "Cristalina", null, "Aceptable", null, "Sucia / No potable", 5, 4, 3, 2,
                                1));
                preguntas.add(createPregunta("¿El agua proporcionada es suficiente y accesible en todo momento?",
                                "NUTRICIÓN", "Suficiente y accesible", null, "Limitada", null, "Insuficiente", 5, 4, 3,
                                2, 1));
                preguntas.add(createPregunta(
                                "¿La presentación del agua respeta la forma en que se encuentra en la naturaleza?",
                                "NUTRICIÓN", "Totalmente natural", null, "Aceptable", null, "Antinatural", 5, 4, 3, 2,
                                1));
                // ALOJAMIENTO
                preguntas.add(createPregunta(
                                "¿Es el ambiente seguro para el animal y permite que exprese sus comportamientos?",
                                "ALOJAMIENTO", "Totalmente seguro", null, "Parcialmente", null, "Inseguro", 5, 4, 3, 2,
                                1));
                preguntas.add(createPregunta("¿Es el sustrato adecuado para que el animal descanse cómodamente?",
                                "ALOJAMIENTO", "Es muy adecuado", null, "Aceptable", null, "Es inadecuado", 5, 4, 3, 2,
                                1));
                preguntas.add(createPregunta("¿Las condiciones térmicas del recinto son adecuadas?", "ALOJAMIENTO",
                                "Confort térmico total", null, "Deficiencia leve", null, "Riesgo vital", 5, 4, 3, 2,
                                1));
                preguntas.add(createPregunta("¿Las dimensiones del recinto son aptas?", "ALOJAMIENTO",
                                "Dimensiones óptimas", null, "Dimensiones aceptables", null,
                                "No permiten movimiento libre", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿El diseño del recinto permite que el animal pueda elegir dónde estar?",
                                "ALOJAMIENTO", "Sí, múltiples opciones", null, "Opciones limitadas", null,
                                "No permite elegir", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿El animal tiene acceso a medios de enriquecimiento ambiental?",
                                "ALOJAMIENTO", "Si, plan completo", null, "Parcialmente", null, "Sin enriquecimiento",
                                5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿El alojamiento presenta un refugio adecuado?", "ALOJAMIENTO",
                                "Protección total", null, "Protección parcial", null, "Sin refugio", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta(
                                "¿Permite el recinto minimizar las situaciones de estrés frente al público?",
                                "ALOJAMIENTO", "Minimiza totalmente", null, "Parcialmente", null, "No permite", 5, 4, 3,
                                2, 1));
                preguntas.add(createPregunta("¿El animal presenta un plan de entrenamiento?", "ALOJAMIENTO",
                                "Plan completo positivo", null, "Parcial / Incompleto", null,
                                "Sin plan / Métodos negativos", 5, 4, 3, 2, 1));
                // SALUD
                preguntas.add(createPregunta("¿El animal está libre de lesiones o heridas?", "SALUD", "Sí, no presenta",
                                null, "Lesiones poco profundas", null, "Lesiones profundas o graves", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿El animal está libre de crecimiento excesivo de pezuñas/dientes?",
                                "SALUD", "Libre de sobrecrecimiento", null, "Sobrecrecimiento leve", null,
                                "Sobrecrecimiento excesivo/doloroso", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿El animal tiene un programa de salud preventiva?", "SALUD", "Si", null,
                                "En desarrollo", null, "No", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿El animal se desplaza sin dificultad o dolor?", "SALUD",
                                "Sin dificultad ni dolor", null, "Cojera leve", null, "Cojera moderada a grave", 5, 4,
                                3, 2, 1));
                preguntas.add(createPregunta("¿Muestra el animal una actividad acorde con su especie?", "SALUD",
                                "Totalmente acorde", null, "Neutral", null, "No se presenta actividad acorde", 5, 4, 3,
                                2, 1));
                preguntas.add(createPregunta("¿El animal parece sano y sin signos de enfermedad?", "SALUD",
                                "Parece clínicamente sano", null, "Síntomas leves", null, "Síntomas moderados o graves",
                                5, 4, 3, 2, 1));
                // COMPORTAMIENTO
                preguntas.add(createPregunta("¿El animal muestra algún tipo de comportamiento anormal?",
                                "COMPORTAMIENTO", "No muestra", null, "Muestra signos leves", null,
                                "Muestra signos moderados graves", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿El animal interactúa con el enriquecimiento ambiental?",
                                "COMPORTAMIENTO", "Si, interactúa frecuentemente", null, "Muestra interés ocasional",
                                null, "No muestra interés", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿El animal realiza los comportamientos específicos de la especie?",
                                "COMPORTAMIENTO", "Sí, totalmente", null, "Solo algunos", null,
                                "No corresponde y causa estrés", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿Utiliza el animal todo el espacio disponible?", "COMPORTAMIENTO",
                                "Usa todo el espacio", null, "Usa siempre los mismos espacios", null,
                                "No utiliza gran parte", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿El animal es indiferente a la presencia del público?", "COMPORTAMIENTO",
                                "Indiferente o positivo", null, "Indiferencia tensa", null, "Miedo, agresividad", 5, 4,
                                3, 2, 1));
                preguntas.add(createPregunta("¿El animal explora el recinto?", "COMPORTAMIENTO",
                                "Se observa exploración activa", null, "Solo ante estímulos nuevos", null,
                                "No se observa exploración", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿Tiene el animal una relación positiva con sus cuidadores?",
                                "COMPORTAMIENTO", "Alerta/Relación Muy Positiva", null, "Indiferencia", null,
                                "Miedo, comportamiento agonístico", 5, 4, 3, 2, 1));
                // ESTADO MENTAL
                preguntas.add(createPregunta("¿El animal parece estar en un estado emocional positivo?",
                                "ESTADO MENTAL", "Totalmente de acuerdo (Relajado/Juguetón)", null, "Neutral", null,
                                "En desacuerdo (Apático/Ansioso)", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿Se observa al animal con comportamientos de anticipación positiva?",
                                "ESTADO MENTAL", "Si, frecuentemente", null, "A veces", null, "Nunca", 5, 4, 3, 2, 1));
                preguntas.add(createPregunta("¿El animal muestra comportamientos de frustración o aburrimiento?",
                                "ESTADO MENTAL", "Nunca", null, "Ocasionalmente", null, "Frecuentemente", 5, 4, 3, 2,
                                1));

                preguntaRepository.saveAll(preguntas);
        }

        private com.bienestaranimal.app.model.PreguntaEvaluacion createPregunta(String texto, String cat, String a,
                        String b, String c, String d, String e, int pa, int pb, int pc, int pd, int pe) {
                return com.bienestaranimal.app.model.PreguntaEvaluacion.builder()
                                .texto(texto).categoria(cat).opcionA(a).opcionB(b).opcionC(c).opcionD(d).opcionE(e)
                                .puntosA(pa).puntosB(pb).puntosC(pc).puntosD(pd).puntosE(pe).build();
        }
}

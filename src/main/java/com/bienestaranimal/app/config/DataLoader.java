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
                // 0. Limpieza de tablas obsoletas (Fix para error FK en eliminación)
                try {
                        entityManager.createNativeQuery("DROP TABLE IF EXISTS evaluacion_respuestas").executeUpdate();
                } catch (Exception e) {
                        System.out.println("DataLoader: Tabla evaluacion_respuestas no existe o ya fue eliminada.");
                }

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
                                "1. ¿El animal presenta buena condición corporal respecto a su especie, edad, sexo y estado fisiológico?",
                                "NUTRICIÓN",
                                "3", null, "2 o 4", null, "1 o 5",
                                5, 0, 3, 0, 1)); // Mapping A=5 (Best), B=3 (Mid), C=1 (Worst) based on user's pattern
                                                 // A>B>C generally?
                // Wait, user said "A: 3 B: 2 o 4 C: 1 o 5". This looks like Body Condition
                // Score (BCS). 3 is optimal.
                // If 3 is optimal, that should be max points (5).
                // 2 or 4 is sub-optimal (maybe 3 points).
                // 1 or 5 is bad (1 point).
                // This creates a challenge if standard is strict 1-5 points. I will map logical
                // "Good/Bad" to 5/1 points for calculation but keep text labels.

                preguntas.add(createPregunta(
                                "2. ¿La dieta es adecuada en nutrientes (según especie, edad, sexo, estado fisiológico y salud) y son seguros para ellos?",
                                "NUTRICIÓN",
                                "Si", null, null, null, "No, no son adecuados",
                                5, 0, 0, 0, 1));

                preguntas.add(createPregunta(
                                "3. ¿La comida que se ofrece al animal está en buenas condiciones?",
                                "NUTRICIÓN",
                                "Si, no tiene alteraciones",
                                "Un alimento o porción presenta una alteración",
                                "Uno o más alimentos o porción presentan más de una alteración",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "4. ¿La preparación de la comida es higiénica?",
                                "NUTRICIÓN",
                                "Si", null, "No", null, null,
                                5, 0, 1, 0, 0));

                preguntas.add(createPregunta(
                                "5. ¿La presentación de la comida corresponde con las necesidades de cada individuo?",
                                "NUTRICIÓN",
                                "Si",
                                "Corresponde con algunas necesidades pero no las completa",
                                "No cumple con las necesidades mínimas",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "6. ¿El agua que se ofrece al animal está en buenas condiciones macroscópicas? (color, olor, presencia de restos de comida u otras partículas, verdín)",
                                "NUTRICIÓN",
                                "Si",
                                "Solo una característica no es adecuada, no impide la ingestión de agua",
                                "Dos o más elementos a tener en cuenta no son adecuados o alguno obstaculiza la ingesta",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "7. ¿El agua proporcionada es suficiente y accesible en todo momento?",
                                "NUTRICIÓN",
                                "Si",
                                "Cumple con una de las características",
                                "No",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "8. ¿La presentación del agua respeta la forma en que se encuentra en la naturaleza?",
                                "NUTRICIÓN",
                                "Respeta la forma en la que la especie bebe en su ambiente",
                                "Respeta parcialmente la forma en la que la especie bebe en su ambiente natural",
                                "La presentación no respeta la forma en la que la especie bebe en su ambiente natural",
                                null, null,
                                5, 3, 1, 0, 0));

                // ALOJAMIENTO
                preguntas.add(createPregunta(
                                "9. ¿Es el ambiente seguro para el animal y permite que exprese sus comportamientos?",
                                "ALOJAMIENTO",
                                "Si",
                                "Parcialmente, cumple alguna característica",
                                "No cumple dos o más características",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "10. ¿Es el sustrato adecuado para que el animal descanse cómodamente y muestre comportamientos propios de su especie?",
                                "ALOJAMIENTO",
                                "Es adecuado",
                                "Impide la manifestación de algún comportamiento específico de la especie",
                                "Es inadecuado para que el animal descanse cómodamente y/o impide la manifestación de varios comportamientos específicos de la especie",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "11. ¿Las condiciones térmicas del recinto son adecuadas para el confort del animal? (Tª, humedad y ventilación)",
                                "ALOJAMIENTO",
                                "Permiten el confort térmico del animal",
                                "Uno de los aspectos es deficiente para mantener el confort térmico del animal sin poner en riesgo su vida",
                                "Dos o más aspectos del recinto son deficientes o uno de ellos presenta deficiencias que ponen en riesgo la vida del animal.",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "12. ¿Las dimensiones del recinto son aptas para que el animal se mueva libremente? ¿Cumple con los mínimos de espacio requeridos?",
                                "ALOJAMIENTO",
                                "Las dimensiones se ajustan a las recomendaciones existentes y son adecuadas para que el animal se mueva libremente",
                                "Permiten al animal moverse libremente pero dificultan la expresión de su cuerpo y son inferiores a las recomendaciones",
                                "No permiten al animal moverse libremente y/o impiden la expresión propia de sus especies y están debajo de las recomendadas.",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "13. ¿El diseño del recinto permite que el animal pueda elegir dónde estar o qué hacer durante todo el día?",
                                "ALOJAMIENTO",
                                "Sí",
                                "Permite al animal en varios aspectos durante al menos el periodo más activo del dia para la especie",
                                "No permite al animal elegir en pocos o ningún aspecto y/o las oportunidades de elección y control sólo están presentes durante el periodo del día de menor actividad",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "14. ¿El animal tiene acceso a medios de enriquecimiento ambiental?",
                                "ALOJAMIENTO",
                                "Si, presenta un plan de enriquecimiento ambiental",
                                "Parcialmente. No dispone de ningún plan de enriquecimiento ambiental.",
                                "No",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "15. ¿El alojamiento presenta un refugio adecuado para el animal que lo proteja de las inclemencias del tiempo?",
                                "ALOJAMIENTO",
                                "Protegen totalmente de las inclemencias del tiempo.",
                                "Protegen parcialmente",
                                "No protegen o no hay refugio",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "16. ¿Permite el recinto que el animal pueda minimizar las situaciones de estrés frente al público? (que el animal pueda ocultarse o ponerse en un lugar poco visible)",
                                "ALOJAMIENTO",
                                "Si permite que el animal minimice las situaciones de estrés frente al público",
                                "Parcialmente",
                                "No permite que el animal no se exponga a situaciones de estrés",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "17. ¿El animal presenta un plan de entrenamiento?",
                                "ALOJAMIENTO",
                                "Si presenta un plan de entrenamiento completo",
                                "El animal es entrenado pero solo en algunos aspectos como el entrenamiento veterinario y las maniobras de manejo",
                                "No se realiza, se realiza por personal inadecuado o por metodos y tecnicas negativas",
                                null, null,
                                5, 3, 1, 0, 0));

                // SALUD
                preguntas.add(createPregunta(
                                "18. ¿El animal está libre de lesiones o heridas?",
                                "SALUD",
                                "Sí, no presenta ni lesiones ni heridas",
                                "Lesiones o heridas poco profundas, pequeñas o poco numerosas. Sin infección supuración ni moscas, con efectos leves y a corto plazo para el animal.",
                                "Lesiones o heridas profundas, medianas o grandes, numerosas, con infección, supuración o moscas, con efectos moderados a graves o a largo plazo para el bienestar animal.",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "19. ¿El animal está libre de crecimiento excesivo o lesiones en pezuñas, uñas, garras, dientes?",
                                "SALUD",
                                "Libre de sobrecrecimiento y lesiones",
                                "Sin lesiones pero pezuñas, manos dientes con crecimiento excesivo leve o moderado",
                                "Presenta sobrecrecimiento excesivo o lesiones graves",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "20. ¿El animal tiene un programa de salud preventiva y de urgencia?",
                                "SALUD",
                                "Si", null,
                                "No",
                                null, null,
                                5, 0, 1, 0, 0));

                preguntas.add(createPregunta(
                                "21. ¿El animal se desplaza sin dificultad o dolor?",
                                "SALUD",
                                "El animal se mueve sin dificultad ni signos de dolor.",
                                "El animal presenta cojera leve",
                                "El animal presenta cojera de moderado a grave y/o hay signos de dolor evidentes al caminar",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "22. ¿Muestra el animal una actividad acorde con su especie?",
                                "SALUD",
                                "Se ajusta al ritmo circadiano (ciclo natural de cambios físicos, mentales y de comportamiento que experimenta el cuerpo en un ciclo de 24 h) de la especie en vida libre.",
                                null,
                                "No se presenta una actividad acorde al ritmo circadiano de su especie",
                                null, null,
                                5, 0, 1, 0, 0));

                preguntas.add(createPregunta(
                                "23. ¿El animal parece sano y sin signos de enfermedad?",
                                "SALUD",
                                "Parece clínicamente sano",
                                "Síntomas leves o recientes de enfermedad con un efecto mínimo en el bienestar animal o con buen pronóstico",
                                "Síntomas moderados o graves, síntomas de larga duración, con efectos negativos en el bienestar animal y/o pronóstico desfavorable",
                                null, null,
                                5, 3, 1, 0, 0));

                // COMPORTAMIENTO
                preguntas.add(createPregunta(
                                "24. ¿El animal muestra algún tipo de comportamiento anormal? (estereotipias, apatías, etc)",
                                "COMPORTAMIENTO",
                                "No muestra signos de comportamiento anormal",
                                "Muestra signos leves de comportamiento anormal",
                                "Muestra signos moderados graves de comportamiento anormal, o varios de ellos.",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "25. ¿El animal interactúa con el enriquecimiento ambiental?",
                                "COMPORTAMIENTO",
                                "Si, interactúa directamente o indirectamente",
                                "Muestra interés por el EA",
                                "No muestra interés no hace uso del EA",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "26. ¿El animal realiza los comportamientos específicos de la especie que corresponden con sus necesidades y dinámicas?",
                                "COMPORTAMIENTO",
                                "Sí, corresponde con los comportamientos naturales de su especie.",
                                "No corresponde pero no causa estrés en el animal",
                                "No corresponde y causa estrés en el animal",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "27. ¿Utiliza el animal todo el espacio disponible del recinto?",
                                "COMPORTAMIENTO",
                                "Usa gran parte o todo el espacio disponible.",
                                "Usa siempre los mismos espacios del recinto",
                                "No utiliza gran parte del espacio disponible, se limita a una zona mínima",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "28. ¿El animal es indiferente a la presencia del público, personal desconocido u observadores?",
                                "COMPORTAMIENTO",
                                "Indiferente o positivo", null,
                                "Miedo ocultamiento, agresividad, congelación.",
                                null, null,
                                5, 0, 1, 0, 0));

                preguntas.add(createPregunta(
                                "29. ¿El animal explora el recinto y sus alrededores y reacciona a estímulos relevantes?",
                                "COMPORTAMIENTO",
                                "Se observa exploración",
                                "Solo se observa exploración en respuesta a estímulos nuevos",
                                "No se observa exploración",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntas.add(createPregunta(
                                "30. ¿Tiene el animal una relación positiva con sus cuidadores?",
                                "COMPORTAMIENTO",
                                "Alerta",
                                "Indiferencia",
                                "Miedo, comportamiento agonístico.",
                                null, null,
                                5, 3, 1, 0, 0));

                preguntaRepository.saveAll(preguntas);
        }

        private com.bienestaranimal.app.model.PreguntaEvaluacion createPregunta(String texto, String cat, String a,
                        String b, String c, String d, String e, int pa, int pb, int pc, int pd, int pe) {
                return com.bienestaranimal.app.model.PreguntaEvaluacion.builder()
                                .texto(texto).categoria(cat).opcionA(a).opcionB(b).opcionC(c).opcionD(d).opcionE(e)
                                .puntosA(pa).puntosB(pb).puntosC(pc).puntosD(pd).puntosE(pe).build();
        }
}

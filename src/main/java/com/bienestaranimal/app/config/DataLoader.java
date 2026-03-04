package com.bienestaranimal.app.config;

import com.bienestaranimal.app.model.Animal;
import com.bienestaranimal.app.model.Role;
import com.bienestaranimal.app.model.Usuario;
import com.bienestaranimal.app.repository.AnimalRepository;

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
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

        private final UsuarioRepository usuarioRepository;
        private final AnimalRepository animalRepository;
        private final PreguntaRepository preguntaRepository;
        private final PasswordEncoder passwordEncoder;

        @PersistenceContext
        private EntityManager entityManager;

        private final Random random = new Random();

        @Override
        @Transactional
        public void run(String... args) throws Exception {
                // 1. Asegurar Usuarios
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

                // 2. Sembrar Preguntas (A-B-C scale)
                if (preguntaRepository.count() == 0) {
                        System.out.println("DataLoader: Sembrando preguntas con escala A-B-C...");
                        seedPreguntasABC();
                        seedMentalQuestionsOnly();
                }

                // 3. Reseteo y Sembrado de Animales (Limpieza Total de pruebas)
                // System.out.println("DataLoader: Limpiando evaluaciones y animales de
                // prueba...");
                // evaluacionRepository.deleteAll();
                // animalRepository.deleteAll();

                if (animalRepository.count() == 0) {
                        System.out.println("DataLoader: Poblando catálogo de especies del Zoo de Córdoba...");
                        seedZooCordobaEspecies(admin, cuidador);
                } else {
                        System.out.println("DataLoader: Actualizando guías de manejo para animales existentes...");
                        updateGuidesForExistingAnimals();
                }

                System.out.println("DataLoader: Proceso finalizado.");
        }

        private void updateGuidesForExistingAnimals() {
                List<Animal> animals = animalRepository.findAll();
                for (Animal a : animals) {
                        String guiaUrl = getGuideUrlForSpecies(a.getEspecie());
                        if (guiaUrl != null && (a.getGuiaManejoUrl() == null || a.getGuiaManejoUrl().isEmpty()
                                        || a.getGuiaManejoUrl().startsWith("/guides/")
                                        || a.getGuiaManejoUrl().contains("/api/files/download/guides/"))) {
                                String oldUrl = a.getGuiaManejoUrl();
                                a.setGuiaManejoUrl(guiaUrl);
                                animalRepository.save(a);
                                System.out.println("DataLoader: ACTUALIZADA guía para [" + a.getNombre() + "] de ["
                                                + oldUrl + "] a [" + guiaUrl + "]");
                        }
                }
        }

        private String getGuideUrlForSpecies(String esp) {
                if (esp.equalsIgnoreCase("Rinoceronte indio")) {
                        return "/api/guias/file/2015_Greater_one_horned_rhino_EAZA_Best_Practice_Guidelines_NV_4195f1d7d7.pdf";
                } else if (esp.equalsIgnoreCase("Nutria Europea") || esp.equalsIgnoreCase("Nutria asiática")) {
                        return "/api/guias/file/2016_European_otter_EAZA_Best_Practice_Guidelines_Approved_3af5e51a98.pdf";
                } else if (esp.equalsIgnoreCase("Cercopiteco de Brazza")) {
                        return "/api/guias/file/201807_BPG_De_Brazza_monkey_NV_30c832fa3f.pdf";
                } else if (esp.equalsIgnoreCase("Hipopótamo Pigmeo")) {
                        return "/api/guias/file/2020_EAZA_Best_Practice_Guidelines_Pygmy_hippo_approved2_fc7f75526d.pdf";
                } else if (esp.equalsIgnoreCase("Buitre Negro") || esp.equalsIgnoreCase("Buitre Leonado")
                                || esp.equalsIgnoreCase("Quebrantahuesos")) {
                        return "/api/guias/file/BPG_cinereous_vulture_2023_final_ddoi_67f352455e.pdf";
                } else if (esp.equalsIgnoreCase("Turaco Cariblanco")) {
                        return "/api/guias/file/Best_Practice_Guidelines_Turaco_approved_NV_5ee8b35cee.pdf";
                } else if (esp.equalsIgnoreCase("Mangabey de Coronilla Blanca")) {
                        return "/api/guias/file/EAZA_BPG_Mangabey_NV_d9bd24bf84.pdf";
                } else if (esp.equalsIgnoreCase("Tití Pigmeo") || esp.contains("Tití")) {
                        return "/api/guias/file/Guia_de_manejo_de_EAZA_para_Calitricidos_traducida_por_ALPZA_2_7f4f340b83.pdf";
                } else if (esp.equalsIgnoreCase("Drill") || esp.equalsIgnoreCase("Mandrill")) {
                        return "/api/guias/file/Mandrill_and_Drill_BPG_final_version_2_including_TAG_logo_c6bd06df6a.pdf";
                } else if (esp.equalsIgnoreCase("Avestruz")) {
                        return "/api/guias/file/North_ostrich_BPG_c731b4a332.pdf";
                } else if (esp.equalsIgnoreCase("Jirafa")) {
                        return "/api/guias/file/aza_giraffe_care_manual.pdf";
                } else if (esp.equalsIgnoreCase("Capibara")) {
                        return "/api/guias/file/capybara_care_manual_2021.pdf";
                } else if (esp.contains("Lémur")) {
                        return "/api/guias/file/eulemur_care_manual_spanish_alpza.pdf";
                } else if (esp.equalsIgnoreCase("Lobo Ibérico")) {
                        return "/api/guias/file/large_canids_care_manual_spanish_alpza.pdf";
                } else if (esp.contains("León") || esp.contains("Leopardo") || esp.contains("Tigre")
                                || esp.contains("Serval") || esp.contains("Lince")) {
                        if (esp.contains("Tigre"))
                                return "/api/guias/file/tiger_care_manual_spanish_alpza.pdf";
                        else
                                return "/api/guias/file/lion_care_manual_spanish_alpza.pdf";
                } else if (esp.equalsIgnoreCase("Suricata") || esp.contains("Mangosta")) {
                        return "/api/guias/file/mongoose_meerkat_and_fossa_acm_spanish_alpza.pdf";
                } else if (esp.equalsIgnoreCase("Visón Europeo") || esp.contains("Hurón") || esp.contains("Nutria")) {
                        return "/api/guias/file/mustelidcaremanual2010r.pdf";
                } else if (esp.equalsIgnoreCase("Nutria asiática") || esp.equalsIgnoreCase("Nutria Europea")) {
                        return "/api/guias/file/otter_care_manual2.pdf";
                } else if (esp.contains("Búho") || esp.contains("Lechuza") || esp.contains("Mochuelo")) {
                        return "/api/guias/file/owl_care_manual_2022.pdf";
                } else if (esp.contains("Tapir")) {
                        return "/api/guias/file/tapir_acm_spanish_alpza.pdf";
                }
                return null;
        }

        private void seedPreguntasABC() {
                List<com.bienestaranimal.app.model.PreguntaEvaluacion> preguntas = new ArrayList<>();

                // NUTRICIÓN
                preguntas.add(createABC(
                                "¿El animal presenta buena condición corporal respecto a su especie, edad, sexo y estado fisiológico?",
                                "NUTRICIÓN", "3", "2 o 4", "1 o 5"));
                preguntas.add(createABC(
                                "¿La dieta es adecuada en nutrientes (según especie, edad, sexo, estado fisiológico y salud) y son seguros para ellos?",
                                "NUTRICIÓN", "Sí", "N/A", "No, no son adecuados"));
                preguntas.add(createABC("¿La comida que se ofrece al animal está en buenas condiciones?", "NUTRICIÓN",
                                "Sí, no tiene alteraciones",
                                "Un alimento o porción presenta una alteración (magulladuras, moho, podredumbre, insectos…)",
                                "Uno o más alimentos o porción presentan más de una alteración"));
                preguntas.add(createABC("¿La preparación de la comida es higiénica?", "NUTRICIÓN", "Sí", "N/A", "No"));
                preguntas.add(createABC(
                                "¿La presentación de la comida corresponde con las necesidades de cada individuo?",
                                "NUTRICIÓN", "Sí", "Corresponde con algunas necesidades pero no las completa",
                                "No cumple con las necesidades mínimas"));
                preguntas.add(createABC(
                                "¿El agua que se ofrece al animal está en buenas condiciones macroscópicas? (color, olor, presencia de restos de comida u otras partículas, verdín)",
                                "NUTRICIÓN", "Sí",
                                "Solo una característica no es adecuada, no impide la ingestión de agua",
                                "Dos o más elementos a tener en cuenta no son adecuados o alguno obstaculiza la ingesta"));
                preguntas.add(createABC("¿El agua proporcionada es suficiente y accesible en todo momento?",
                                "NUTRICIÓN", "Sí", "Cumple con una de las características", "No"));
                preguntas.add(createABC(
                                "¿La presentación del agua respeta la forma en que se encuentra en la naturaleza?",
                                "NUTRICIÓN", "Respeta la forma en la que la especie bebe en su ambiente",
                                "Respeta parcialmente la forma en la que la especie bebe en su ambiente natural",
                                "La presentación no respeta la forma en la que la especie bebe en su ambiente natural"));

                // ALOJAMIENTO
                preguntas.add(createABC(
                                "¿Es el ambiente seguro para el animal y permite que exprese sus comportamientos?",
                                "ALOJAMIENTO", "Sí", "Parcialmente, cumple alguna característica",
                                "No cumple dos o más características"));
                preguntas.add(createABC(
                                "¿Es el sustrato adecuado para que el animal descanse cómodamente y muestre comportamientos propios de su especie?",
                                "ALOJAMIENTO", "Es adecuado",
                                "Impide la manifestación de algún comportamiento específico de la especie",
                                "Es inadecuado para que el animal descanse cómodamente y/o impide la manifestación de varios comportamientos específicos de la especie"));
                preguntas.add(createABC(
                                "¿Las condiciones térmicas del recinto son adecuadas para el confort del animal? (Tª, humedad y ventilación)",
                                "ALOJAMIENTO", "Permiten el confort térmico del animal",
                                "Uno de los aspectos es deficiente para mantener el confort térmico del animal sin poner en riesgo su vida",
                                "Dos o más aspectos del recinto son deficientes o uno de ellos presenta deficiencias que ponen en riesgo la vida del animal"));
                preguntas.add(createABC(
                                "¿Las dimensiones del recinto son aptas para que el animal se mueva libremente? ¿Cumple con los mínimos de espacio requeridos?",
                                "ALOJAMIENTO", "Las dimensiones se ajustan a las recomendaciones existentes",
                                "Permiten al animal moverse libremente pero dificultan la expresión de su cuerpo",
                                "No permiten al animal moverse libremente y/o impiden la expresión propia de sus especies"));
                preguntas.add(createABC(
                                "¿El diseño del recinto permite que el animal pueda elegir dónde estar o qué hacer durante todo el día?",
                                "ALOJAMIENTO", "Sí",
                                "Permite al animal en varios aspectos durante al menos el periodo más activo del día",
                                "No permite al animal elegir en pocos o ningún aspecto"));
                preguntas.add(createABC("¿El animal tiene acceso a medios de enriquecimiento ambiental?", "ALOJAMIENTO",
                                "Sí, presenta un plan de enriquecimiento ambiental",
                                "Parcialmente. No dispone de ningún plan de enriquecimiento ambiental.", "No"));
                preguntas.add(createABC(
                                "¿El alojamiento presenta un refugio adecuado para el animal que lo proteja de las inclemencias del tiempo?",
                                "ALOJAMIENTO", "Protegen totalmente de las inclemencias del tiempo.",
                                "Protegen parcialmente", "No protegen o no hay refugio"));
                preguntas.add(createABC(
                                "¿Permite el recinto que el animal pueda minimizar las situaciones de estrés frente al público?",
                                "ALOJAMIENTO",
                                "Sí permite que el animal minimice las situaciones de estrés frente al público",
                                "Parcialmente", "No permite que el animal no se exponga a situaciones de estrés"));
                preguntas.add(createABC("¿El animal presenta un plan de entrenamiento?", "ALOJAMIENTO",
                                "Sí presenta un plan de entrenamiento completo",
                                "El animal es entrenado pero solo en algunos aspectos",
                                "No se realiza o se realiza inadecuadamente"));

                // SALUD
                preguntas.add(createABC("¿El animal está libre de lesiones o heridas?", "SALUD",
                                "Sí, no presenta ni lesiones ni heridas",
                                "Lesiones o heridas poco profundas, pequeñas o poco numerosas",
                                "Lesiones o heridas profundas, medianas o grandes, numerosas, con infección"));
                preguntas.add(createABC(
                                "¿El animal está libre de crecimiento excesivo o lesiones en pezuñas, uñas, garras, dientes?",
                                "SALUD", "Libre de sobrecrecimiento y lesiones",
                                "Sin lesiones pero con crecimiento excesivo leve o moderado",
                                "Presenta sobrecrecimiento excesivo o lesiones graves"));
                preguntas.add(createABC("¿El animal tiene un programa de salud preventiva y de urgencia?", "SALUD",
                                "Sí", "N/A", "No"));
                preguntas.add(createABC("¿El animal se desplaza sin dificultad o dolor?", "SALUD",
                                "El animal se mueve sin dificultad ni signos de dolor.",
                                "El animal presenta cojera leve", "El animal presenta cojera de moderado a grave"));
                preguntas.add(createABC("¿Muestra el animal una actividad acorde con su especie?", "SALUD",
                                "Se ajusta al ritmo circadiano de la especie en vida libre.", "N/A",
                                "No se presenta una actividad acorde al ritmo circadiano de su especie"));
                preguntas.add(createABC("¿El animal parece sano y sin signos de enfermedad?", "SALUD",
                                "Parece clínicamente sano", "Síntomas leves o recientes de enfermedad",
                                "Síntomas moderados o graves, con efectos negativos"));

                // COMPORTAMIENTO
                preguntas.add(createABC(
                                "¿El animal muestra algún tipo de comportamiento anormal? (estereotipias, apatías, etc)",
                                "COMPORTAMIENTO", "No muestra signos de comportamiento anormal",
                                "Muestra signos leves de comportamiento anormal",
                                "Muestra signos moderados o graves de comportamiento anormal"));
                preguntas.add(createABC("¿El animal interactúa con el enriquecimiento ambiental?", "COMPORTAMIENTO",
                                "Sí, interactúa directamente o indirectamente", "Muestra interés por el EA",
                                "No muestra interés no hace uso del EA"));
                preguntas.add(createABC(
                                "¿El animal realiza los comportamientos específicos de la especie que corresponden con sus necesidades y dinámicas?",
                                "COMPORTAMIENTO", "Sí, corresponde con los comportamientos naturales de su especie.",
                                "No corresponde pero no causa estrés en el animal",
                                "No corresponde y causa estrés en el animal"));
                preguntas.add(createABC("¿Utiliza el animal todo el espacio disponible del recinto?", "COMPORTAMIENTO",
                                "Usa gran parte o todo el espacio disponible.",
                                "Usa siempre los mismos espacios del recinto",
                                "No utiliza gran parte del espacio disponible"));
                preguntas.add(createABC(
                                "¿El animal es indiferente a la presencia del público, personal desconocido u observadores?",
                                "COMPORTAMIENTO", "Indiferente o positivo", "N/A",
                                "Miedo, ocultamiento, agresividad, congelación."));
                preguntas.add(createABC(
                                "¿El animal explora el recinto y sus alrededores y reacciona a estímulos relevantes?",
                                "COMPORTAMIENTO", "Se observa exploración",
                                "Solo se observa exploración en respuesta a estímulos nuevos",
                                "No se observa exploración"));
                preguntas.add(createABC("¿Tiene el animal una relación positiva con sus cuidadores?", "COMPORTAMIENTO",
                                "Alerta / Positiva", "Indiferencia", "Miedo, comportamiento agonístico."));

                preguntaRepository.saveAll(preguntas);
        }

        private com.bienestaranimal.app.model.PreguntaEvaluacion createABC(String texto, String cat, String a, String b,
                        String c) {
                return com.bienestaranimal.app.model.PreguntaEvaluacion.builder()
                                .texto(texto)
                                .categoria(cat)
                                .opcionA(a)
                                .opcionB(b)
                                .opcionC(c)
                                .puntosA(100)
                                .puntosB(50)
                                .puntosC(0)
                                .build();
        }

        private void seedZooCordobaEspecies(Usuario admin, Usuario cuidador) {
                String[] especies = {
                                "Águila Calzada", "Águila Culebrera", "Águila Imperial Ibérica", "Ajolote",
                                "Amazona Farinosa", "Armadillo de seis bandas", "Arrui", "Avestruz",
                                "Blenio de Río", "Boa Arcoiris", "Boa cubana", "Búho Chico",
                                "Búho Real", "Buitre Leonado", "Buitre Negro", "Busardo ratonero",
                                "Cabra Montés", "Cacatua Cavadora", "Capibara", "Cebra de Burchell",
                                "Cerceta pardilla", "Cercopiteco de Brazza", "Cernícalo Primilla", "Cernícalo Vulgar",
                                "Cigüeña Blanca", "Cigüeña Negra", "Cisne Común", "Cisne negro",
                                "Cocodrilo Enano Africano", "Corzo Morisco", "Cuervo grande", "Dragón Barbudo",
                                "Drill", "Emú", "Erizo común", "Escinco indonesio de lengua azul",
                                "Espátula Común", "Falsa Tortuga Mapa", "Flamenco Común", "Galápago de cuello rojo",
                                "Galápago de Florida", "Galápago leproso", "Gamo", "Gecko leopardo",
                                "Gibón de mejillas blancas", "Grulla Coronada Cuelligrís", "Guacamayo azul y amarillo",
                                "Guacamayo de alas verdes", "Guacamayo militar", "Hipopótamo Común",
                                "Hipopótamo Pigmeo",
                                "Iguana de cola espinosa oaxaqueña", "Insecto Palo", "Jabalí", "Jirafa",
                                "Lagarto armadillo", "Lagarto de chaquira", "Lechuza Común", "Lémur de Cola Anillada",
                                "Lémur Pardo", "Lémur Rufo Blanco y Negro", "Leopardo de Sri Lanka", "Lince Boreal",
                                "Lince Ibérico", "Lobo Ibérico", "Loro timneh", "Macaco de Berbería",
                                "Mangabey de Coronilla Blanca", "Mara o Liebre de la Patagonia", "Milano negro",
                                "Milano real", "Mochuelo común", "Muflón", "Muntiaco de la India", "Ñandú",
                                "Nutria asiática", "Nutria Europea", "Oso Pardo Ibérico", "Pato colorado",
                                "Pecarí de collar", "Pitón Real", "Porrón europeo", "Porrón moñudo",
                                "Puercoespín Africano", "Quebrantahuesos", "Rana toro africana", "Rey de California",
                                "Rinoceronte indio", "Saimiri o mono ardilla común", "Serpiente del maíz",
                                "Serpiente Falsa Coral o de Sinaloa", "Serval", "Suricata", "Talapoín Norteño",
                                "Tapir Amazónico", "Tarro Canelo", "Tigre de bengala", "Tití Pigmeo",
                                "Tortuga carbonaria", "Tortuga china", "Tortuga de Blanding",
                                "Tortuga de caparazón blando de Florida", "Tortuga de espolones africana",
                                "Tortuga de pecho negro de Okinawa", "Tortuga leopardo", "Tortuga mapa de Ouachita",
                                "Tortuga Mapa del Mississippi", "Tortuga Mediterránea", "Tortuga mora",
                                "Tortuga moteada", "Tortuga radiata", "Tortuga rusa",
                                "Tortuga serpentina o mordedora", "Turaco Cariblanco", "Ualabí de Bennet",
                                "Varano azul", "Visón Europeo",
                                "León Africano", "Elefante Africano", "Tigre de Sumatra", "Guepardo",
                                "Chimpancé Común", "Gorila de Costa", "Pingüino de Humboldt", "Panda Rojo"
                };

                String[] urls = {
                                "https://zoo.cordoba.es/wp-content/uploads/2021/06/Portada-Aguila-Calzada-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-34-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-40-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2025/11/Foto-1-300x214.jpeg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/07/Farinosa-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/07/Foto-1-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/ARRUI-PRINCIPAL-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/AVESTRUZ-PRINCIPAL-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/09/Foto-blenio2-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/11/boa-arcoiris-1-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2022/01/boacubana_blanca-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2022/06/Foto-buho-chico-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-32-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-30-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-31-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/07/bus-3-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-42-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/07/1200px-Cacatua_pastinato_-Blackpool_Zoo-8a-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-1-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/Cebra-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2024/07/cerce-2-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/CERCOPITECO-PRINCIPAL-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-36-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-35-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-45-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-46-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-26-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/06/portada-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/COCODRILO-ENANO-PRINCIPAL-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-44-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/07/Foto-cuervo-2-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2025/11/Foto-2-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/DRILL-PRINCIPAL-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-20-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2024/02/foto-erizo-2-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2025/11/f0a206ec-edbc-4288-84e7-63ac260ca1de_source-aspect-ratio_1600w_0-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-27-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2024/02/Foto2-300x214.jpeg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-25-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/11/galapago-cuello-rojo-1-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-8-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/07/Galapago-leproso-2-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-23-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/11/gecko-lepardo-1-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-13-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/GRULLA-PRINCIPAL-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-10-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-9-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2025/01/ARA_MILITARIS_NOGALITO_292_21A-1-300x214.webp",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/Hipopotamo-comun-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/Hipopotamo-pigmeo-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2025/01/igu-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2025/11/Foto-2-1-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-24-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/Jirafa-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/07/Foto-2-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/11/lagarto-chaquira-1-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-33-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/LEMUR-PRINCIPAL-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/LEMUR-PARDO-PRINCIPAL-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/LEMUR-RUFO-PRINCIPAL-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-12-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-21-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-38-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-39-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/07/yaco-vinagre-1.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/MACACO-PRINCIPAL-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/MANGABEY-PRINCIPAL-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-2-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/07/milano-negro-2-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/07/MILANO-REAL-1-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/07/mochu-1-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-43-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/Portada-14-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-3-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-15-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-22-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-41-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2025/02/pato-macho-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-5-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/Portada-Pitonreal-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2025/01/PORRONES-2-1-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2025/01/MONUDO-1-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/PUERCOESPIN-PRINCIPAL-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-29-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/12/rana-toro-2-1-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/11/rey-california-1-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2024/01/rino-3-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-7-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2022/01/serpiente_maiz-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/11/falsa-coral-1-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/07/Serval_in_Tanzania-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/04/Suricata-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/Portada-Talapoin-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-28-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-11-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-6-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2024/09/1084px-Morrocoy_from_Venezuela_2-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/08/Tortuga-china-2-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/11/tortuga-blanding-1-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/08/Apalone-ferox-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/11/tortuga-espolones-africana-1-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/11/tortuga-pecho-negro-okinawa-1-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2024/07/Stigmochelys_pardalis_Usakos-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2024/02/Foto2-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2022/09/IMG-2553-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-48-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2023/08/tortuga-mora-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/11/tortuga-moteada-1-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/11/tortuga-radiata-1-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2022/01/tortuga-rusa-1-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2022/01/tort_mord_blanc-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2025/01/turaco-2-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-19-300x214.jpg",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/11/varano-azul-1-300x214.png",
                                "https://zoo.cordoba.es/wp-content/uploads/2021/05/portada-47-300x214.jpg",
                                "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=300",
                                "https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&q=80&w=300",
                                "https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&q=80&w=300",
                                "https://images.unsplash.com/photo-1534193540453-e8361b78280d?auto=format&fit=crop&q=80&w=300",
                                "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&q=80&w=300",
                                "https://images.unsplash.com/photo-1551737825-780c853af15c?auto=format&fit=crop&q=80&w=300",
                                "https://images.unsplash.com/photo-1591154706847-e8396cd84459?auto=format&fit=crop&q=80&w=300",
                                "https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=300"
                };

                int count = Math.min(especies.length, urls.length);
                for (int i = 0; i < count; i++) {
                        String esp = especies[i];
                        String fotoUrl = urls[i];

                        String guiaUrl = null;

                        // Asignación de guías específicas según especie
                        if (esp.equalsIgnoreCase("Rinoceronte indio")) {
                                guiaUrl = "/api/guias/file/2015_Greater_one_horned_rhino_EAZA_Best_Practice_Guidelines_NV_4195f1d7d7.pdf";
                        } else if (esp.equalsIgnoreCase("Nutria Europea") || esp.equalsIgnoreCase("Nutria asiática")) {
                                guiaUrl = "/api/guias/file/2016_European_otter_EAZA_Best_Practice_Guidelines_Approved_3af5e51a98.pdf";
                        } else if (esp.equalsIgnoreCase("Cercopiteco de Brazza")) {
                                guiaUrl = "/api/guias/file/201807_BPG_De_Brazza_monkey_NV_30c832fa3f.pdf";
                        } else if (esp.equalsIgnoreCase("Hipopótamo Pigmeo")) {
                                guiaUrl = "/api/guias/file/2020_EAZA_Best_Practice_Guidelines_Pygmy_hippo_approved2_fc7f75526d.pdf";
                        } else if (esp.equalsIgnoreCase("Buitre Negro") || esp.equalsIgnoreCase("Buitre Leonado")
                                        || esp.equalsIgnoreCase("Quebrantahuesos")) {
                                guiaUrl = "/api/guias/file/BPG_cinereous_vulture_2023_final_ddoi_67f352455e.pdf";
                        } else if (esp.equalsIgnoreCase("Turaco Cariblanco")) {
                                guiaUrl = "/api/guias/file/Best_Practice_Guidelines_Turaco_approved_NV_5ee8b35cee.pdf";
                        } else if (esp.equalsIgnoreCase("Mangabey de Coronilla Blanca")) {
                                guiaUrl = "/api/guias/file/EAZA_BPG_Mangabey_NV_d9bd24bf84.pdf";
                        } else if (esp.equalsIgnoreCase("Tití Pigmeo") || esp.contains("Tití")) {
                                guiaUrl = "/api/guias/file/Guia_de_manejo_de_EAZA_para_Calitricidos_traducida_por_ALPZA_2_7f4f340b83.pdf";
                        } else if (esp.equalsIgnoreCase("Drill") || esp.equalsIgnoreCase("Mandrill")) {
                                guiaUrl = "/api/guias/file/Mandrill_and_Drill_BPG_final_version_2_including_TAG_logo_c6bd06df6a.pdf";
                        } else if (esp.equalsIgnoreCase("Avestruz")) {
                                guiaUrl = "/api/guias/file/North_ostrich_BPG_c731b4a332.pdf";
                        } else if (esp.equalsIgnoreCase("Jirafa")) {
                                guiaUrl = "/api/guias/file/aza_giraffe_care_manual.pdf";
                        } else if (esp.equalsIgnoreCase("Capibara")) {
                                guiaUrl = "/api/guias/file/capybara_care_manual_2021.pdf";
                        } else if (esp.contains("Lémur")) {
                                guiaUrl = "/api/guias/file/eulemur_care_manual_spanish_alpza.pdf";
                        } else if (esp.equalsIgnoreCase("Lobo Ibérico")) {
                                guiaUrl = "/api/guias/file/large_canids_care_manual_spanish_alpza.pdf";
                        } else if (esp.contains("León") || esp.contains("Leopardo") || esp.contains("Tigre")
                                        || esp.contains("Serval") || esp.contains("Lince")) {
                                // Asignamos manual de grandes felinos/tigre/leon a felinos grandes
                                if (esp.contains("Tigre"))
                                        guiaUrl = "/api/guias/file/tiger_care_manual_spanish_alpza.pdf";
                                else
                                        guiaUrl = "/api/guias/file/lion_care_manual_spanish_alpza.pdf";
                        } else if (esp.equalsIgnoreCase("Suricata") || esp.contains("Mangosta")) {
                                guiaUrl = "/api/guias/file/mongoose_meerkat_and_fossa_acm_spanish_alpza.pdf";
                        } else if (esp.equalsIgnoreCase("Visón Europeo") || esp.contains("Hurón")
                                        || esp.contains("Nutria")) {
                                guiaUrl = "/api/guias/file/mustelidcaremanual2010r.pdf";
                        } else if (esp.equalsIgnoreCase("Nutria asiática") || esp.equalsIgnoreCase("Nutria Europea")) {
                                // Override if not caught above
                                guiaUrl = "/api/guias/file/otter_care_manual2.pdf";
                        } else if (esp.contains("Búho") || esp.contains("Lechuza") || esp.contains("Mochuelo")) {
                                guiaUrl = "/api/guias/file/owl_care_manual_2022.pdf";
                        } else if (esp.contains("Tapir")) {
                                guiaUrl = "/api/guias/file/tapir_acm_spanish_alpza.pdf";
                        }

                        // Fallback generic or keep null if no match?
                        // User asked to look for specific animals.
                        // Let's set a default WAZA guide only if no specific guide found, or just null.
                        // For now, let's keep the specific logic.

                        animalRepository.save(Animal.builder()
                                        .nombre(esp + " Individual")
                                        .especie(esp)
                                        .fechaNacimiento(LocalDate.now().minusYears(random.nextInt(10) + 1))
                                        .notas("Especie representativa de la colección del Zoo de Córdoba.")
                                        .fotoUrl(fotoUrl)
                                        .guiaManejoUrl(guiaUrl)
                                        .usuario(random.nextBoolean() ? admin : cuidador)
                                        .build());
                }
        }

        private void seedMentalQuestionsOnly() {
                List<com.bienestaranimal.app.model.PreguntaEvaluacion> preguntas = new ArrayList<>();

                preguntas.add(createABC(
                                "¿El animal muestra signos de experiencias positivas (juego, 'felicidad', confort)?",
                                "ESTADO MENTAL",
                                "Frecuentemente (Juego/Relax)",
                                "Ocasionalmente",
                                "Nunca observado"));

                preguntas.add(createABC(
                                "¿El animal parece curioso y motivado por su entorno?",
                                "ESTADO MENTAL",
                                "Muy curioso / Alerta positiva",
                                "Algo curioso",
                                "Desinteresado / Deprimido"));

                preguntas.add(createABC(
                                "¿Se observan signos de miedo, ansiedad o estrés crónico?",
                                "ESTADO MENTAL",
                                "No, relajado",
                                "Signos leves (alerta)",
                                "Sí, miedo evidente / Estrés"));

                preguntas.add(createABC(
                                "VALORACIÓN FINAL: ¿El balance de experiencias parece positivo?",
                                "ESTADO MENTAL",
                                "Claramente Positivo (Vida que vale la pena vivir)",
                                "Neutro / Aceptable",
                                "Negativo (Sufrimiento)"));

                preguntaRepository.saveAll(preguntas);
        }
}

# My Story AI: Progress Journal

PRD — MyStoryAI MVP (UI First, Datos Mock)

0. Contexto de esta iteración

Este PRD es para una primera iteración de UI, a construir en Lovable.

Reglas de esta iteración:

✅ Solo interfaz visual (React + Tailwind), completamente funcional a nivel de UI/UX.

✅ Datos mock (hardcodeados o en estado local de React) — nada de backend real.

❌ No configurar autenticación real (no Supabase Auth, no JWT, no sesiones reales).

❌ No configurar base de datos real (no tablas de Supabase, no queries reales).

El flujo de login será una simulación visual: el formulario valida y muestra loading, pero al "iniciar sesión" simplemente navega al dashboard con un usuario mock precargado.

Supabase se conectará en una iteración posterior, una vez validada la UI.

1. Resumen del producto

MyStoryAI convierte los registros diarios de hábitos y journaling en una narrativa de progreso personal generada por IA. El problema que resuelve: aunque haya gente que registra su vida en apps distintas (hábitos, diario, metas) nadie lo resume e interpreta esa información, así que pierde de vista su propio progreso o lo olvida y se desmotiva.

Público objetivo: jóvenes universitarios y profesionales (17-30 años) en Perú interesados en crecimiento personal.

2. Alcance del MVP (features críticas — resultado del test "¿si la quito, deja de resolver el problema?")

Solo estas 4 entran en esta iteración de UI:

Autenticación (UI mock) — pantalla de login/registro, sin lógica real.

CRUD de hábitos — crear, marcar cumplido/no cumplido, editar, eliminar (en estado local).

Journal diario — texto libre + 1 pregunta guía rotativa.

Resumen semanal generado por IA (mock) — vista que simula el resultado de análisis de IA sobre los datos de la semana.

Explícitamente fuera de esta iteración: resumen trimestral/anual, módulo de metas, emblemas/logros, racha/streak, dashboard histórico completo, personalización avanzada de preguntas, notificaciones, exportar a Notion, sugerencias de lugares, análisis de personalidad, ayuda psicológica, monetización.

3. Flujo de usuario

[Login/Registro] → [Hoy (Check-in diario)] ⇄ [Hábitos] 

                              ↓

                       [Resumen semanal]

Login/Registro (mock): el usuario ingresa email/password (o toca "Continuar como demo"). Validación de formulario + loading spinner de ~1s → redirige a "Hoy".

Hoy (pantalla principal / home):

Lista de hábitos del día con checkbox para marcar cumplido.

Campo de journal libre.

Pregunta guía del día (texto fijo o rotativo, ej. "¿Qué no quieres olvidar de hoy?").

Botón "Guardar registro de hoy" → loading state → confirmación visual (toast o check animado).

Hábitos: el usuario puede ver todos sus hábitos, crear uno nuevo, editar o eliminar. Cambios reflejados en la pantalla "Hoy".

Resumen semanal: el usuario entra y ve (o genera con botón "Generar resumen") un resumen simulado tipo: qué hábitos cumplió, patrón detectado en su journal, 1-2 aprendizajes clave. Incluye loading state que simula "la IA está pensando" antes de mostrar el resultado mock.

4. Estructura de rutas (React Router)

Ruta Pantalla Acceso /login Login / Registro (mock) Pública / o /hoy Check-in diario (home) Post-login /habitos Gestión de hábitos (CRUD) Post-login /resumen Resumen semanal IA Post-login

Navegación principal: barra inferior (mobile) / barra lateral o superior (desktop) con 3 ítems: Hoy · Hábitos · Resumen. Estado activo resaltado con --primary.

5. Especificación de pantallas

5.1 /login — Login / Registro (mock)

Componentes:

Logo/nombre "MyStoryAI" con text-gradient (gradient-cta).

Tabs o toggle: "Iniciar sesión" / "Crear cuenta".

Inputs: email, password (y nombre si es registro).

Botón primario "Entrar" (btn-primary, gradient-cta + glow).

Link secundario: "Continuar como demo" (salta directo al dashboard con usuario mock).

Validación:

Email: formato válido requerido.

Password: mínimo 6 caracteres.

Mostrar mensajes de error inline bajo cada campo (color --destructive).

Botón deshabilitado mientras el formulario es inválido.

Estados:

Idle → Validando (mientras el usuario escribe) → Loading (spinner en el botón, ~800-1200ms simulado) → Éxito (redirige a /hoy).

Fondo: halos ambientales del design system (radial-gradient violeta + azul sobre --background).

5.2 /hoy — Check-in diario (pantalla principal)

Layout: una sola columna en mobile, dos columnas en desktop (hábitos a la izquierda, journal a la derecha).

Sección Hábitos de hoy:

Lista de tarjetas (--card / .glass-card), una por hábito, con:

Checkbox/toggle circular para marcar cumplido (al marcarlo, glow dorado --accent + animación breve).

Nombre del hábito.

Ícono opcional (usar lucide-react).

Si no hay hábitos: estado vacío con CTA "Crea tu primer hábito" → lleva a /habitos.

Sección Journal:

Pregunta guía del día, destacada en tipografía Space Grotesk, ej.: "Si olvidas todo de hoy, ¿qué no quieres olvidar?"

Textarea de respuesta libre (autosize, placeholder invitador).

Contador de caracteres sutil (opcional).

Acción principal:

Botón "Guardar registro de hoy" (btn-primary).

Validación: debe haber al menos 1 hábito marcado o texto en el journal para poder guardar (no se permite guardar completamente vacío).

Loading state: spinner + texto "Guardando..." (~600-1000ms simulado).

Éxito: toast/confirmación con animación breve ("¡Registro guardado! 🎉") + el botón cambia a estado "Guardado hoy" (deshabilitado, con check).

Estado "ya registré hoy": si el usuario ya guardó su check-in (dato mock), la pantalla carga con los valores ya guardados y el botón muestra "Actualizar registro de hoy".

5.3 /habitos — Gestión de hábitos

Componentes:

Lista de hábitos existentes (tarjetas), cada una con: nombre, ícono, botones editar/eliminar.

Botón flotante o fijo "+ Nuevo hábito".

Modal o panel lateral para crear/editar hábito:

Input: nombre del hábito (requerido, máx. 50 caracteres).

Selector simple de ícono o categoría (opcional, mock).

Botones "Guardar" / "Cancelar".

Validación:

Nombre no puede estar vacío ni duplicado (validación en el estado local).

Loading state breve al guardar (simulado).

Eliminar hábito:

Confirmación (modal simple: "¿Eliminar este hábito?") antes de borrar — evita eliminación accidental.

Estado vacío: ilustración/mensaje si no hay hábitos aún, con CTA a crear el primero.

5.4 /resumen — Resumen semanal (IA mock)

Estado inicial (sin resumen generado esta semana):

Mensaje: "Aún no generas tu resumen de esta semana."

Botón "Generar resumen semanal" (btn-primary con shadow-glow).

Loading state (simulando análisis de IA):

Animación de "pensando" (ej. puntos pulsantes o ícono con animate-pulse-glow).

Mensajes rotativos tipo "Analizando tus hábitos...", "Buscando patrones en tu journal...", "Construyendo tu historia..." (dan sensación de proceso real de IA). Duración simulada ~2-3s.

Resultado (mock, generado localmente con datos hardcodeados):

Tarjeta principal (.glass-card) con:

Título: "Tu semana en resumen".

Texto narrativo corto (2-4 líneas) que menciona hábitos cumplidos y un patrón detectado en el journal (contenido mock, redactado en tono cercano y motivador).

Sección "Aprendizaje clave de la semana" destacado con acento dorado (--accent).

Métrica simple: % de hábitos cumplidos en la semana (barra o círculo de progreso con gradient-primary).

Botón secundario "Volver a generar" (por si quiere regenerar el mock).

6. Sistema de diseño (aplicar el design system adjunto)

Tipografía:

Headings: Space Grotesk (letter-spacing: -0.02em).

Body: Inter.

Código/datos técnicos (si aplica): JetBrains Mono.

Importar ambas vía Google Fonts en el index.html o config de Tailwind.

Colores (variables CSS en oklch, ya definidas en el design system):

Fondo app: --background (#0F0F1A), modo noche por defecto.

Texto principal: --foreground (#F5F5F7).

Tarjetas: --card / .glass-card (translúcida con blur).

Marca/enlaces: --primary (#A855F7).

Acento "hoy"/logro: --accent (#FBBF24) + clase .today-glow.

Botón CTA: gradient-cta + shadow-glow (reposo) → shadow-warm-glow (hover).

Error: --destructive (#EF4444).

Bordes: --border (blanco 8% opacidad).

Gradientes a reutilizar:

gradient-primary → íconos y elementos de marca.

gradient-warm → elementos de energía/logro (ej. % de hábitos cumplidos).

gradient-cta → botones principales y textos destacados (.text-gradient).

Radios: usar --radius: 0.875rem (14px) como base para tarjetas y botones; inputs con radius-sm (10px).

Fondo ambiental: aplicar los halos radiales violeta/azul del design system sobre --background en pantallas clave (login, resumen).

Responsive: mobile-first. En mobile, navegación inferior fija; en desktop (≥1024px), navegación superior o lateral y layouts de 2 columnas donde aplique (ej. /hoy).

7. Modelos de datos mock (estado local / JSON de ejemplo)

// Usuario (mock, sin auth real)

type User = {

  id: string;

  name: string;

  email: string;

};

// Hábito

type Habit = {

  id: string;

  name: string;

  icon?: string;

  createdAt: string;

};

// Registro diario

type DailyEntry = {

  id: string;

  date: string; // ISO date

  habitsCompleted: string[]; // ids de Habit

  journalText: string;

  guidedQuestion: string;

  guidedAnswer: string;

};

// Resumen semanal generado (mock)

type WeeklySummary = {

  id: string;

  weekStart: string;

  weekEnd: string;

  narrative: string;

  keyLearning: string;

  habitsCompletionRate: number; // 0-100

};

Estos datos viven en estado de React (Context o hooks locales) o en un archivo mockData.ts — no hay persistencia real en esta iteración.

8. Requisitos no funcionales de esta iteración

Componentes funcionales de React únicamente (sin clases).

Tailwind CSS para todos los estilos; usar las variables del design system como tokens de Tailwind (extendiendo tailwind.config).

Validación de formularios en login, registro, creación de hábito y check-in diario (ver reglas en cada sección).

Indicadores de carga en toda acción que simule proceso async (login, guardar check-in, generar resumen).

Diseño responsive verificado en mobile y desktop.

Sin llamadas reales a Supabase ni a ningún backend — todo el "async" es simulado con setTimeout o similar.

9. Criterios de aceptación (para esta iteración)

[ ] El usuario puede "loguearse" (mock) y llegar a /hoy.

[ ] El usuario puede crear, editar y eliminar hábitos, y estos se reflejan de inmediato en /hoy.

[ ] El usuario puede marcar hábitos cumplidos y escribir en su journal, y guardar el check-in del día con validación y loading.

[ ] El usuario puede generar (mock) un resumen semanal con estado de carga simulando análisis de IA, y ver el resultado con narrativa, aprendizaje clave y % de hábitos cumplidos.

[ ] La navegación entre /hoy, /habitos y /resumen funciona vía rutas reales (no solo tabs de estado).

[ ] El diseño visual usa consistentemente los colores, tipografías y gradientes del design system adjunto.

[ ] La app es usable tanto en mobile como en desktop.

10. Próxima iteración (fuera de este PRD)

Una vez validada esta UI: conectar Supabase (Auth real + tablas para habits, daily_entries, weekly_summaries), y conectar el motor de resumen a un LLM real (vía Edge Function o similar), reemplazando los datos mock por datos persistidos.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://my-story-unfold-26.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ca510db1-95c4-42bc-b69c-50550cd2c465).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

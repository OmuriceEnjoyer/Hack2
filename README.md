# TropelCare Control Room — Pizza Protocol

Frontend de la hackathon CS2031. Consola operativa para monitorear criaturas digitales (Tropeles), atender señales y explorar historias de sector.

## Integrantes

| Nombre | Código |
|---|---|
| Israel Carlos | 202110052 |
| Royer Ramos | 202510069 |
| Rafael Castillo | 202510044 |

## Deploy

https://hack2-ecru.vercel.app

## Credenciales de prueba

- **Team Code:** `TEAM-014`
- **Email:** `operator@tuckersoft.com`
- **Password:** `Pizza-TEAM-014`

## Instalación y comandos

```bash
pnpm install
pnpm dev        # servidor de desarrollo en http://localhost:5173
pnpm build      # build de producción
pnpm typecheck  # verificación de tipos sin emitir
```

## Variables de entorno requeridas

Crea un archivo `.env.local` en la raíz del proyecto:

```properties
VITE_API_BASE_URL=https://hackaton-20261-front-587720740455.us-east1.run.app
```

## Decisiones técnicas

### Autenticación
JWT almacenado en `localStorage`. Al montar la app se llama `/auth/me` para restaurar la sesión sin requerir login nuevamente. `PrivateRoute` redirige a `/login` si no hay token válido.

### Paginación de Tropeles (Checkpoint 2)
`useTropels` lee y escribe todos los filtros (`page`, `size`, `sort`, `species`, `vitalState`, `q`) directamente en `useSearchParams`, lo que sincroniza el estado con la URL. Un `AbortController` cancela la request anterior ante cualquier cambio de filtro, evitando que respuestas tardías sobreescriban resultados recientes.

### Infinite scroll de Señales (Checkpoint 3)
`useSignalsFeed` implementa paginación cursor-based con un `IntersectionObserver` sobre un elemento centinela al final de la lista. Un flag `inFlight` bloquea solicitudes simultáneas. Un `generationRef` descarta respuestas de requests obsoletas cuando los filtros cambian mid-flight. Se deduplica por ID con un `Set`. El feed acumulado se guarda en una variable de módulo para sobrevivir la navegación y restaurar la posición con `sessionStorage`.

### Detalle y PATCH de Señal (Checkpoint 4)
Al actualizar el estado de una señal, `queueSignalUpdate` propaga el cambio al cache del feed para que el estado sea coherente al volver sin recargar la lista.

### Sector Story Engine (Checkpoint 5)
Scrollytelling implementado con un layout de dos columnas: panel visual sticky (izquierda) y narrativa scrolleable (derecha). Un `IntersectionObserver` con `rootMargin: '-45% 0px -45% 0px'` resuelve la etapa activa y actualiza el visual en tiempo real.

- **CSS Scroll-driven Animations** activadas con `@supports (animation-timeline: view())`, con fallback visible para navegadores sin soporte.
- **View Transition API** referenciada con `viewTransitionName` en el título del sector.
- **`prefers-reduced-motion`** desactiva todas las animaciones pero conserva la funcionalidad completa.
- **Navegación por teclado** con `ArrowUp/Down`, `PageUp/Down`, `Home` y `End` sobre el contenedor del story.

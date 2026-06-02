# Diseño: último commit de efengine embebido en FeaturedWorks

- **Fecha:** 2026-06-02
- **Rama:** `feature/efengine-webhook`
- **Estado:** Aprobado para planificación de implementación

## Objetivo

Mostrar, de forma "viva", el último commit del repo público de efengine
(`https://github.com/elFonTii/efengine`) dentro de la sección **FeaturedWorks**
del portfolio:

- un **badge compacto** en la banda flagship de efengine (visible sin abrir el modal),
- un **bloque detallado** dentro del modal de efengine, junto al *Development Roadmap*.

## Decisiones tomadas durante el brainstorming

| Decisión | Elección | Motivo |
| --- | --- | --- |
| Mecanismo de obtención | Polling a la API pública de GitHub | Sin backend persistente ni secrets; suficiente para un portfolio |
| Ubicación | Card flagship **y** modal | Visibilidad rápida + detalle al expandir |
| Refresco | Una vez + caché con TTL | Evita gastar el límite de 60 req/h sin auth; simple |
| Repo / rama | `elFonTii/efengine`, rama por defecto `master` | Confirmado contra la API |
| Ante error | No renderizar nada | Nunca romper el layout |
| Fecha | Tiempo relativo (`date-fns`, localizado) | Más legible; `date-fns` ya es dependencia |

## Arquitectura

Solución **100% client-side**. No se agrega backend ni se manejan secrets.

El cliente consulta:

```
GET https://api.github.com/repos/elFonTii/efengine/commits?per_page=1
```

Esto devuelve el último commit de la rama por defecto (`master`). Campos usados:
`sha`, `commit.message`, `commit.author.name`, `commit.author.date`, `html_url`.

Se sigue el mismo patrón en capas que la feature de blog existente
(**tipo → servicio → hook → componentes UI**, con React Query), para mantener
consistencia con el código actual.

### Caché y refresco

- React Query ya está configurado globalmente con `staleTime: 5 min` y
  `refetchOnWindowFocus: false` (ver `src/Router.tsx`) → maneja el estado en sesión.
- Para sobrevivir **recargas de página**, el servicio agrega una capa de
  `localStorage` con TTL de **5 minutos** por repo. Dentro del TTL se devuelve la
  caché sin tocar la red.

Límite relevante: la API sin autenticación permite **60 req/h por IP**. La caché
de 5 min hace que un visitante normal nunca se acerque a ese límite.

## Archivos nuevos

### 1. `src/types/github.ts`

```ts
export interface LatestCommit {
  sha: string;        // sha completo
  shortSha: string;   // primeros 7 chars
  message: string;    // primera línea del mensaje del commit
  authorName: string;
  date: string;       // ISO 8601 (commit.author.date)
  htmlUrl: string;    // link al commit en GitHub
}
```

### 2. `src/services/github.ts`

`getLatestCommit(repo: string): Promise<LatestCommit>`

Comportamiento:

1. Lee `localStorage` con key `github:latest-commit:<repo>`.
2. Si existe y `Date.now() - fetchedAt < TTL (5 min)` → devuelve la entrada cacheada
   sin red.
3. Si no, hace `fetch` al endpoint de commits, toma el primer elemento, lo mapea a
   `LatestCommit` (incluyendo `shortSha = sha.slice(0, 7)` y `message` = primera línea).
4. Guarda `{ data, fetchedAt }` en `localStorage` y devuelve `data`.
5. Si el `fetch` falla (403 rate limit, red caída, etc.): si hay una entrada vieja en
   `localStorage` la devuelve (aunque esté fuera de TTL); si no hay nada, lanza el error.

El parseo de `localStorage` es defensivo (try/catch) para no romper ante datos corruptos.

### 3. `src/hooks/useLatestCommit.ts`

```ts
export function useLatestCommit(repo?: string) {
  return useQuery({
    queryKey: ['github', 'latest-commit', repo],
    queryFn: () => githubService.getLatestCommit(repo!),
    enabled: !!repo,
  });
}
```

Espeja el patrón de `src/hooks/useBlog.ts`.

### 4. `src/components/LatestCommit.tsx`

Un único componente con prop `variant: 'badge' | 'detail'` y `repo?: string`.

- Usa `useLatestCommit(repo)`.
- **Mientras carga sin datos previos** o **ante error sin caché** → retorna `null`
  (no renderiza nada; nunca rompe el layout).
- **`variant="badge"`** (card flagship): fila compacta inline — punto "live"
  pulsante + mensaje truncado + tiempo relativo; el conjunto es un link (`<a target="_blank" rel="noreferrer">`) al `htmlUrl`.
- **`variant="detail"`** (modal): bloque con borde al estilo del `DevelopmentRoadmap`
  — mensaje, `shortSha` en mono, autor, fecha relativa, y link "Ver en GitHub".
- Estilos siguen las clases Tailwind/tipografía ya usadas en la sección
  (`font-mono`, `text-[10px] tracking-[0.22em] uppercase`, `text-teal-700` para el
  acento personal, bordes `border-dark-900/10`, `rounded-2xl`).

### 5. `src/utils/dateLocale.ts` (helper de tiempo relativo)

Mapea el idioma i18n actual al locale de `date-fns` (`en-US`, `es`, `pt-BR`, `zh-CN`)
y expone una función para formatear tiempo relativo con `formatDistanceToNow`.
Se mantiene mínimo (sólo los 4 idiomas soportados; default a inglés).

## Cambios en archivos existentes

### `src/components/projectTypes.ts`

Agregar campo opcional a `Project`:

```ts
repo?: string; // "owner/repo" en GitHub; habilita el bloque de último commit
```

Genérico: cualquier proyecto futuro puede declarar `repo` y obtener el badge/detalle.

### `src/components/FeaturedWorks.tsx`

- En `projectData`, en la entrada `efengine`, agregar `repo: 'elFonTii/efengine'`.
  (El tipo local `ProjectStructural` ya hereda el campo vía `Project`.)
- En la banda flagship (artículo flagship, cerca del stack/fecha), renderizar
  `{featuredProject.repo && <LatestCommit repo={featuredProject.repo} variant="badge" />}`.

### `src/components/ProjectPreviewModal.tsx`

- Junto al render de `DevelopmentRoadmap`, renderizar
  `{project.repo && <LatestCommit repo={project.repo} variant="detail" />}`.

### i18n: `src/i18n/locales/{en,es,pt,zh}.json`

Agregar bajo `work.featured` (y consumidas también desde el modal):

```jsonc
"latestCommit": {
  "label": "Último commit",      // "Latest commit" / etc.
  "viewOnGithub": "Ver en GitHub",
  "by": "por {author}"            // interpolación del autor
}
```

Las 4 locales reciben sus traducciones correspondientes (en/es/pt/zh).

## Flujo de datos

```
<LatestCommit repo="elFonTii/efengine" variant=… />
  → useLatestCommit(repo)            (React Query, enabled si hay repo)
    → githubService.getLatestCommit(repo)
        → ¿caché fresca en localStorage (<5 min)?
            sí → devuelve cache (sin red)
            no → fetch a GitHub → mapea a LatestCommit → guarda en localStorage → devuelve
            (si el fetch falla → cae a cache vieja, o lanza error)
  → render badge / detail   (o null si loading-sin-datos / error-sin-cache)
```

## Manejo de errores

- **403 (rate limit) o red caída:** el servicio devuelve la caché vieja si existe.
  Si no hay caché, React Query queda en estado de error y el componente renderiza `null`.
- **Datos corruptos en localStorage:** parseo defensivo; se ignora la entrada y se
  hace fetch fresco.
- En ningún caso se muestra un estado roto ni un placeholder de error visible.

## Verificación

El repositorio **no tiene runner de tests** (no hay vitest/jest en `package.json`).
Agregar uno sería sumar una dependencia (fuera de alcance salvo pedido explícito).
La verificación será:

1. `npm run build` (corre `tsc -b` + `vite build`) sin errores de tipos.
2. `npm run lint` sin errores.
3. Prueba manual en el navegador:
   - caso real (commit visible en card y modal, link correcto),
   - caso de caché (recarga dentro del TTL no dispara request — verificable en Network),
   - caso de error (simular fallo de red / 403 → no se rompe el layout).

## Fuera de alcance (YAGNI)

- Webhook de GitHub y backend persistente (descartado a favor de polling).
- Polling por intervalo mientras la página está abierta.
- Mostrar más de un commit / historial.
- Runner de tests automatizados.
- Token de GitHub / autenticación de la API.

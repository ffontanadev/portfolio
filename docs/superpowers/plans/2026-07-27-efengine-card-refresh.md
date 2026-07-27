# EFENGINE Card Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the EFENGINE flagship card in line with the engine as of 2026-07-26 — rewritten copy, a 7-phase roadmap rebuilt from the gitlog, and a new engine-systems block in the detail modal.

**Architecture:** The card is assembled at runtime from two halves — structural data in `FeaturedWorks.tsx` and localized copy in four JSON locale files — merged by `id` in a `useMemo`. This plan rewrites the copy, adds one optional field (`systems`) to the `Project` type, and renders it with a new `EngineSystems` component that mirrors the existing `DevelopmentRoadmap`. No new dependencies, no new routes, no changes to any other card.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind 4, Vite 7, Vitest 3 (jsdom), custom JSON-based i18n.

**Spec:** [2026-07-27-efengine-card-refresh-design.md](../specs/2026-07-27-efengine-card-refresh-design.md)

## Global Constraints

- **Four locales, always in lockstep.** `src/i18n/config.ts:21` declares `satisfies Record<string, Messages>` with `Messages = typeof en`. Any key added to `en.json` must be added to `es.json`, `pt.json` and `zh.json` or `tsc -b` fails. Array *lengths* are not compiler-checked — Task 1's test covers that gap.
- **`en.json` is the source of truth for shape.** Add keys there first.
- **No new runtime or dev dependencies.** There is no `@testing-library/react` in this repo; do not add one. Component behavior is verified by `pnpm build` plus the visual pass in Task 5.
- **Locale copy is plain text, not markdown.** Nothing renders markdown in these fields — write `gl*`, `.efe`, `unique_ptr` without backticks.
- **Module names stay untranslated.** `efecom`, `renderer`, `scene`, `resources`, `serialization`, `sandbox` are repo identifiers; only the `role` sentence beside them is translated.
- **Phase labels follow each locale's existing convention:** `Fase 0`–`Fase 6` in `en`, `es` and `pt` (the English locale already ships the Spanish word — keep it); `阶段 0`–`阶段 6` in `zh`.
- **Indentation in locale JSON is 2 spaces**, matching the surrounding file. Files are UTF-8; do not let an editor rewrite the CJK or accented characters.
- **Commands:** `pnpm build` (runs `tsc -b` then `vite build`), `pnpm lint`, `pnpm test`.

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/test/localeCard.test.ts` | Create | Guards locale array-length parity across the whole message tree, and asserts the EFENGINE card is current (7 phases, 6 systems, no OpenGL 3.3, no empty strings). |
| `src/i18n/locales/en.json` | Modify | Canonical copy + shape. `work.featured.projects.efengine` rewritten; `work.modal.engineSystems` added. |
| `src/i18n/locales/es.json` | Modify | Same, translated. |
| `src/i18n/locales/pt.json` | Modify | Same, translated. |
| `src/i18n/locales/zh.json` | Modify | Same, translated. |
| `src/components/projectTypes.ts` | Modify | Adds the `ProjectSystem` interface and the optional `Project.systems` field. |
| `src/components/FeaturedWorks.tsx` | Modify | Structural data (tech-stack chips) and the locale→`Project` merge (`systems`, current-phase index). |
| `src/components/ProjectPreviewModal.tsx` | Modify | New `EngineSystems` component; composes it into the phase branch; lets `description` render paragraphs. |
| `src/content/projects.ts` | **Delete** | Unimported twin of every card, already contradicting the locales. |

---

### Task 1: Locale copy + parity test

**Files:**
- Create: `src/test/localeCard.test.ts`
- Modify: `src/i18n/locales/en.json:208-231` (efengine block), `src/i18n/locales/en.json:412` (modal keys)
- Modify: `src/i18n/locales/es.json:208-231`, `:412`
- Modify: `src/i18n/locales/pt.json:208-231`, `:412`
- Modify: `src/i18n/locales/zh.json:208-231`, `:412`

**Interfaces:**
- Consumes: `messages` and `SUPPORTED_LOCALES` from `src/i18n/config.ts` (both already exported).
- Produces: `work.featured.projects.efengine.systems` — an array of `{ label: string; role: string }`, 6 entries, which Task 2 reads as `fp.efengine.systems`. Also `work.modal.engineSystems` — a string heading, which Task 3 reads via `t('work.modal.engineSystems')`. Also `work.featured.projects.efengine.phases` grown from 3 to 7 entries of the unchanged `{ label, title, desc }` shape.

- [ ] **Step 1: Write the failing test**

Create `src/test/localeCard.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { messages, SUPPORTED_LOCALES, type Locale } from '@/i18n/config';

/**
 * `satisfies Record<string, Messages>` in config.ts makes tsc enforce key
 * parity across locales, but it cannot enforce array *length* — a locale can
 * ship 6 roadmap phases where `en` has 7 and still compile. These tests close
 * that gap and pin the EFENGINE card to the current state of the engine.
 */

/** Every array in the message tree, keyed by its dotted path. */
const arrayLengths = (node: unknown, path = '', out: Record<string, number> = {}) => {
  if (Array.isArray(node)) {
    out[path] = node.length;
    node.forEach((item, i) => arrayLengths(item, `${path}[${i}]`, out));
  } else if (node !== null && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      arrayLengths(value, path ? `${path}.${key}` : key, out);
    }
  }
  return out;
};

type EfengineCard = {
  title: string;
  desc: string;
  role: string;
  description: string;
  leadSub: string;
  phases: { label: string; title: string; desc: string }[];
  systems: { label: string; role: string }[];
};

const cardOf = (locale: Locale) =>
  (messages[locale] as unknown as {
    work: { featured: { projects: { efengine: EfengineCard } } };
  }).work.featured.projects.efengine;

const modalOf = (locale: Locale) =>
  (messages[locale] as unknown as {
    work: { modal: Record<string, string | undefined> };
  }).work.modal;

/** Every string reachable from `node`, depth-first. */
const strings = (node: unknown): string[] => {
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(strings);
  if (node !== null && typeof node === 'object') return Object.values(node).flatMap(strings);
  return [];
};

describe('locale array parity', () => {
  const reference = arrayLengths(messages.en);

  it.each(SUPPORTED_LOCALES)('%s has the same array lengths as en', (locale) => {
    expect(arrayLengths(messages[locale])).toEqual(reference);
  });
});

describe('EFENGINE card is current', () => {
  it.each(SUPPORTED_LOCALES)('%s lists the 7 roadmap phases', (locale) => {
    expect(cardOf(locale).phases).toHaveLength(7);
  });

  it.each(SUPPORTED_LOCALES)('%s lists the 6 engine systems', (locale) => {
    expect(cardOf(locale).systems).toHaveLength(6);
  });

  it.each(SUPPORTED_LOCALES)('%s no longer advertises the retired OpenGL 3.3 target', (locale) => {
    expect(JSON.stringify(cardOf(locale))).not.toContain('3.3');
  });

  it.each(SUPPORTED_LOCALES)('%s names OpenGL 4.5 in the card summary', (locale) => {
    expect(cardOf(locale).desc).toContain('4.5');
  });

  it.each(SUPPORTED_LOCALES)('%s has no blank strings in the card', (locale) => {
    for (const value of strings(cardOf(locale))) {
      expect(value.trim()).not.toBe('');
    }
  });

  it.each(SUPPORTED_LOCALES)('%s has a heading for the engine systems block', (locale) => {
    expect(modalOf(locale).engineSystems?.trim()).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test`
Expected: FAIL. `phases` has 3 entries not 7; `systems` is `undefined` so `toHaveLength` throws; `3.3` is present in every locale; `engineSystems` is undefined. The `locale array parity` block passes today (all four locales still agree at 3 phases) — that is fine, it is a regression guard.

- [ ] **Step 3: Rewrite the `en.json` EFENGINE block**

Replace `src/i18n/locales/en.json:208-231` (the whole `"efengine": { … },` object, keeping the trailing comma before `"bancoProvincia"`):

```json
        "efengine": {
          "title": "EFENGINE — C++ Game Engine",
          "desc": "A from-scratch 3D engine in C++17 on OpenGL 4.5 Core — PBR with split-sum IBL, shadow mapping, an HDR post chain, a versioned binary scene format and a docked ImGui editor, all under RAII rules with no exceptions.",
          "role": "Engine Author",
          "description": "EFENGINE is my most ambitious project: a 3D engine written from scratch in C++17 on OpenGL 4.5 Core. It renders PBR materials lit by point and directional lights with full image-based lighting — diffuse irradiance plus split-sum specular, both precomputed by compute shaders — over shadow mapping, a skybox and an HDR post chain of bloom, tonemap and FXAA. Scenes live in a node graph addressed by generational handles and persist to .efe, a chunked, versioned binary format of my own with a reader hostile to corrupt input. On top sits a docked ImGui editor: hierarchy, inspector, live material editing and scene save/load.\n\nWhat holds it together is a set of non-negotiable rules. Every gl* call is confined to efecom, the RHI layer — the renderer never sees OpenGL. No raw new/delete and no exceptions: ownership is a value or a unique_ptr, programmer errors trip an assert, recoverable failures come back as return values, and every subsystem is RAII — constructing it brings it up, destroying it tears it down.",
          "leadSub": "C++17 · OpenGL 4.5 Core",
          "phases": [
            {
              "label": "Fase 0",
              "title": "Foundations",
              "desc": "CMake with FetchContent, GLFW/GLAD/GLM, Log and Assert, Window and Application under end-to-end RAII, doctest on CTest. Closes with the first triangle on screen."
            },
            {
              "label": "Fase 1",
              "title": "Core rendering",
              "desc": "Shader, Texture via stb_image, Material, vertex layouts and Mesh; a camera with orbit, pan and zoom. Shaders move to being loaded from disk."
            },
            {
              "label": "Fase 2",
              "title": "Scene and lights",
              "desc": "Time, a ResourceManager cached by key, a Renderer with BeginScene/Submit, point lights, framebuffers and the first ImGui debug UI."
            },
            {
              "label": "Fase 3",
              "title": "HDR and post-processing",
              "desc": "Exposure on the camera, TonemapPass as the first IPostPass, and bloom and FXAA chained by ping-pong between two scratch framebuffers."
            },
            {
              "label": "Fase 4",
              "title": "OpenGL 4.5 and the RHI",
              "desc": "The jump to 4.5 Core with DSA and shaders at #version 450. efecom is born: no gl* call lives outside the RHI. Skybox and directional shadow mapping."
            },
            {
              "label": "Fase 5",
              "title": "Graph, .efe and editor",
              "desc": "SceneGraph by generational handles, per-node behaviors, and the .efe binary format — chunked, versioned, with a reader hostile to corrupt files. The sandbox becomes a docked editor."
            },
            {
              "label": "Fase 6",
              "title": "Full IBL",
              "desc": "Diffuse irradiance plus split-sum specular: GGX prefiltering at one dispatch per mip and a BRDF LUT, both by compute shader. Emission maps and normal strength land too."
            }
          ],
          "systems": [
            {
              "label": "efecom · RHI",
              "role": "The only surface that talks to the GPU. Opaque u32 handles, zero OpenGL types in the API, a replaceable GL 4.5 backend. It does not depend on efengine."
            },
            {
              "label": "renderer",
              "role": "PBR with point and directional lights, diffuse and specular IBL, the shadow pass, the skybox and the PostChain of bloom, tonemap and FXAA."
            },
            {
              "label": "scene",
              "role": "A node graph keyed by handle + generation: destroying a node invalidates its old handles. Hierarchical transforms that only recompute what is dirty, and per-node behaviors."
            },
            {
              "label": "resources",
              "role": "Owner of everything that arrives from disk by path: shaders, textures with an explicit color space, and FBX models via Assimp. Caches and hands back observer pointers."
            },
            {
              "label": "serialization",
              "role": "The .efe format: a versioned header and FourCC chunks. A single Serialize(Ar&) per type serves both reading and writing; unknown chunks are skipped by size."
            },
            {
              "label": "sandbox",
              "role": "A docked Unity-style ImGui editor: hierarchy, inspector, live materials, a render panel, frame stats and scene save/load."
            }
          ]
        },
```

Then in the same file, `src/i18n/locales/en.json:412`, add the modal heading after `developmentRoadmap`:

```json
      "developmentRoadmap": "Development Roadmap",
      "engineSystems": "Engine Systems",
      "keyImplementation": "Key Implementation"
```

- [ ] **Step 4: Rewrite the `es.json` EFENGINE block**

Replace `src/i18n/locales/es.json:208-231`:

```json
        "efengine": {
          "title": "EFENGINE — Motor de Juegos en C++",
          "desc": "Motor 3D hecho desde cero en C++17 sobre OpenGL 4.5 Core — PBR con IBL split-sum, shadow mapping, cadena de post-proceso HDR, formato binario propio de escenas y un editor ImGui dockeado, todo bajo reglas RAII y sin excepciones.",
          "role": "Autor del Motor",
          "description": "EFENGINE es mi proyecto más ambicioso: un motor 3D escrito desde cero en C++17 sobre OpenGL 4.5 Core. Renderiza materiales PBR iluminados por luces puntuales y direccional con iluminación basada en imagen completa —irradiancia difusa más especular por split-sum, ambas precalculadas por compute shaders— sobre shadow mapping, un skybox y una cadena de post-proceso HDR de bloom, tonemap y FXAA. Las escenas viven en un grafo de nodos direccionado por handles con generación y se persisten en .efe, un formato binario propio, chunkeado y versionado, con un reader hostil a la entrada corrupta. Encima corre un editor ImGui dockeado: jerarquía, inspector, edición de materiales en vivo y guardado/carga de escenas.\n\nLo que lo sostiene es un conjunto de reglas no negociables. Cada llamada gl* está confinada a efecom, la capa RHI — el renderer nunca ve OpenGL. Sin new/delete crudos y sin excepciones: la propiedad es un valor o un unique_ptr, los errores de programación disparan un assert, los fallos recuperables vuelven como valor de retorno, y todo subsistema es RAII — construirlo lo levanta, destruirlo lo baja.",
          "leadSub": "C++17 · OpenGL 4.5 Core",
          "phases": [
            {
              "label": "Fase 0",
              "title": "Cimientos",
              "desc": "CMake con FetchContent, GLFW/GLAD/GLM, Log y Assert, Window y Application con RAII de punta a punta, doctest sobre CTest. Cierra con el primer triángulo en pantalla."
            },
            {
              "label": "Fase 1",
              "title": "Render base",
              "desc": "Shader, Texture con stb_image, Material, layout de vértices y Mesh; cámara con órbita, pan y zoom. Los shaders pasan a cargarse desde disco."
            },
            {
              "label": "Fase 2",
              "title": "Escena y luces",
              "desc": "Time, ResourceManager con caché por clave, Renderer con BeginScene/Submit, luces puntuales, framebuffer y la primera UI de debug en ImGui."
            },
            {
              "label": "Fase 3",
              "title": "HDR y post-proceso",
              "desc": "Exposición en la cámara, TonemapPass como primer IPostPass, y bloom y FXAA encadenados por ping-pong entre dos framebuffers scratch."
            },
            {
              "label": "Fase 4",
              "title": "OpenGL 4.5 y el RHI",
              "desc": "Salto a 4.5 Core con DSA y shaders a #version 450. Nace efecom: ninguna llamada gl* vive fuera del RHI. Skybox y shadow mapping direccional."
            },
            {
              "label": "Fase 5",
              "title": "Grafo, .efe y editor",
              "desc": "SceneGraph por handles con generación, behaviors por nodo, y el formato binario .efe — chunkeado, versionado y con reader hostil a archivos corruptos. El sandbox se vuelve editor dockeado."
            },
            {
              "label": "Fase 6",
              "title": "IBL completo",
              "desc": "Irradiancia difusa más especular por split-sum: prefiltrado GGX con un dispatch por mip y BRDF LUT, ambos por compute shader. Se suman mapas de emisión y normal strength."
            }
          ],
          "systems": [
            {
              "label": "efecom · RHI",
              "role": "La única superficie que habla con la GPU. Handles u32 opacos, cero tipos de OpenGL en la API, backend GL 4.5 reemplazable. No depende de efengine."
            },
            {
              "label": "renderer",
              "role": "PBR con luces puntuales y direccional, IBL difuso y especular, shadow pass, skybox y la PostChain de bloom, tonemap y FXAA."
            },
            {
              "label": "scene",
              "role": "Grafo de nodos con handle + generación: destruir un nodo invalida sus handles viejos. Transforms jerárquicos que sólo recalculan lo dirty, y behaviors por nodo."
            },
            {
              "label": "resources",
              "role": "Dueño de todo lo que llega de disco por path: shaders, texturas con color space explícito y modelos FBX vía Assimp. Cachea y devuelve punteros observadores."
            },
            {
              "label": "serialization",
              "role": "El formato .efe: header versionado y chunks con FourCC. Un solo Serialize(Ar&) por tipo sirve para leer y escribir; los chunks desconocidos se saltean por tamaño."
            },
            {
              "label": "sandbox",
              "role": "Editor ImGui dockeado tipo Unity: jerarquía, inspector, materiales en vivo, panel de render, stats de frame y guardado/carga de escenas."
            }
          ]
        },
```

And at `src/i18n/locales/es.json:412`:

```json
      "developmentRoadmap": "Hoja de Ruta",
      "engineSystems": "Sistemas del Motor",
      "keyImplementation": "Implementación Clave"
```

- [ ] **Step 5: Rewrite the `pt.json` EFENGINE block**

Replace `src/i18n/locales/pt.json:208-231`:

```json
        "efengine": {
          "title": "EFENGINE — Motor de Jogos em C++",
          "desc": "Motor 3D feito do zero em C++17 sobre OpenGL 4.5 Core — PBR com IBL split-sum, shadow mapping, cadeia de pós-processamento HDR, formato binário próprio de cenas e um editor ImGui dockado, tudo sob regras RAII e sem exceções.",
          "role": "Autor do Motor",
          "description": "EFENGINE é meu projeto mais ambicioso: um motor 3D escrito do zero em C++17 sobre OpenGL 4.5 Core. Ele renderiza materiais PBR iluminados por luzes pontuais e direcional com iluminação baseada em imagem completa —irradiância difusa mais especular por split-sum, ambas pré-computadas por compute shaders— sobre shadow mapping, um skybox e uma cadeia de pós-processamento HDR de bloom, tonemap e FXAA. As cenas vivem em um grafo de nós endereçado por handles com geração e são persistidas em .efe, um formato binário próprio, em chunks e versionado, com um reader hostil a entradas corrompidas. Por cima roda um editor ImGui dockado: hierarquia, inspetor, edição de materiais ao vivo e salvar/carregar cenas.\n\nO que sustenta tudo é um conjunto de regras inegociáveis. Cada chamada gl* está confinada ao efecom, a camada RHI — o renderer nunca vê OpenGL. Sem new/delete crus e sem exceções: a propriedade é um valor ou um unique_ptr, erros de programação disparam um assert, falhas recuperáveis voltam como valor de retorno, e todo subsistema é RAII — construí-lo o levanta, destruí-lo o desliga.",
          "leadSub": "C++17 · OpenGL 4.5 Core",
          "phases": [
            {
              "label": "Fase 0",
              "title": "Fundações",
              "desc": "CMake com FetchContent, GLFW/GLAD/GLM, Log e Assert, Window e Application com RAII de ponta a ponta, doctest sobre CTest. Fecha com o primeiro triângulo na tela."
            },
            {
              "label": "Fase 1",
              "title": "Renderização base",
              "desc": "Shader, Texture com stb_image, Material, layout de vértices e Mesh; câmera com órbita, pan e zoom. Os shaders passam a ser carregados do disco."
            },
            {
              "label": "Fase 2",
              "title": "Cena e luzes",
              "desc": "Time, ResourceManager com cache por chave, Renderer com BeginScene/Submit, luzes pontuais, framebuffer e a primeira UI de debug em ImGui."
            },
            {
              "label": "Fase 3",
              "title": "HDR e pós-processamento",
              "desc": "Exposição na câmera, TonemapPass como primeiro IPostPass, e bloom e FXAA encadeados por ping-pong entre dois framebuffers scratch."
            },
            {
              "label": "Fase 4",
              "title": "OpenGL 4.5 e o RHI",
              "desc": "Salto para 4.5 Core com DSA e shaders em #version 450. Nasce o efecom: nenhuma chamada gl* vive fora do RHI. Skybox e shadow mapping direcional."
            },
            {
              "label": "Fase 5",
              "title": "Grafo, .efe e editor",
              "desc": "SceneGraph por handles com geração, behaviors por nó, e o formato binário .efe — em chunks, versionado e com reader hostil a arquivos corrompidos. O sandbox vira um editor dockado."
            },
            {
              "label": "Fase 6",
              "title": "IBL completo",
              "desc": "Irradiância difusa mais especular por split-sum: pré-filtragem GGX com um dispatch por mip e BRDF LUT, ambos por compute shader. Somam-se mapas de emissão e normal strength."
            }
          ],
          "systems": [
            {
              "label": "efecom · RHI",
              "role": "A única superfície que fala com a GPU. Handles u32 opacos, zero tipos de OpenGL na API, backend GL 4.5 substituível. Não depende da efengine."
            },
            {
              "label": "renderer",
              "role": "PBR com luzes pontuais e direcional, IBL difuso e especular, shadow pass, skybox e a PostChain de bloom, tonemap e FXAA."
            },
            {
              "label": "scene",
              "role": "Grafo de nós com handle + geração: destruir um nó invalida seus handles antigos. Transforms hierárquicos que só recalculam o que está dirty, e behaviors por nó."
            },
            {
              "label": "resources",
              "role": "Dono de tudo o que chega do disco por path: shaders, texturas com color space explícito e modelos FBX via Assimp. Faz cache e devolve ponteiros observadores."
            },
            {
              "label": "serialization",
              "role": "O formato .efe: header versionado e chunks com FourCC. Um único Serialize(Ar&) por tipo serve para ler e escrever; chunks desconhecidos são pulados por tamanho."
            },
            {
              "label": "sandbox",
              "role": "Editor ImGui dockado estilo Unity: hierarquia, inspetor, materiais ao vivo, painel de render, stats de frame e salvar/carregar cenas."
            }
          ]
        },
```

And at `src/i18n/locales/pt.json:412`:

```json
      "developmentRoadmap": "Roteiro de Desenvolvimento",
      "engineSystems": "Sistemas do Motor",
      "keyImplementation": "Implementação Principal"
```

- [ ] **Step 6: Rewrite the `zh.json` EFENGINE block**

Replace `src/i18n/locales/zh.json:208-231`. Note the phase labels use `阶段 N`, matching this file's existing convention:

```json
        "efengine": {
          "title": "EFENGINE — C++ 游戏引擎",
          "desc": "用 C++17 从零打造、基于 OpenGL 4.5 Core 的 3D 引擎——PBR 与 split-sum IBL、阴影映射、HDR 后处理链、自研的带版本二进制场景格式，以及一个停靠式 ImGui 编辑器，全部遵循 RAII 规则且不使用异常。",
          "role": "引擎作者",
          "description": "EFENGINE 是我最有野心的项目：一个用 C++17 从零编写、基于 OpenGL 4.5 Core 的 3D 引擎。它渲染由点光源与平行光照亮的 PBR 材质，配合完整的基于图像的光照——漫反射辐照度加 split-sum 镜面反射，两者均由 compute shader 预计算——之上还有阴影映射、天空盒，以及由 bloom、tonemap 和 FXAA 组成的 HDR 后处理链。场景存放在以带世代句柄寻址的节点图中，并持久化为 .efe：我自己设计的分块、带版本号的二进制格式，其读取器对损坏输入极为苛刻。最上层是一个停靠式 ImGui 编辑器：层级、检视器、材质实时编辑与场景的保存/加载。\n\n把这一切串起来的是一组不可妥协的规则。每一次 gl* 调用都被限制在 RHI 层 efecom 之内——渲染器永远看不到 OpenGL。没有裸 new/delete，也没有异常：所有权是值或 unique_ptr，编程错误触发断言，可恢复的失败以返回值传出，每个子系统都遵循 RAII——构造即启动，析构即关闭。",
          "leadSub": "C++17 · OpenGL 4.5 Core",
          "phases": [
            {
              "label": "阶段 0",
              "title": "奠基",
              "desc": "CMake 配合 FetchContent、GLFW/GLAD/GLM、Log 与 Assert、全程 RAII 的 Window 与 Application，以及跑在 CTest 上的 doctest。以屏幕上的第一个三角形收尾。"
            },
            {
              "label": "阶段 1",
              "title": "渲染基础",
              "desc": "Shader、基于 stb_image 的 Texture、Material、顶点布局与 Mesh；支持环绕、平移与缩放的相机。着色器改为从磁盘加载。"
            },
            {
              "label": "阶段 2",
              "title": "场景与光照",
              "desc": "Time、按键缓存的 ResourceManager、带 BeginScene/Submit 的 Renderer、点光源、帧缓冲，以及第一版 ImGui 调试界面。"
            },
            {
              "label": "阶段 3",
              "title": "HDR 与后处理",
              "desc": "相机上的曝光、作为首个 IPostPass 的 TonemapPass，以及在两个临时帧缓冲之间乒乓串联的 bloom 与 FXAA。"
            },
            {
              "label": "阶段 4",
              "title": "OpenGL 4.5 与 RHI",
              "desc": "升级到 4.5 Core 并启用 DSA，着色器改为 #version 450。efecom 诞生：任何 gl* 调用都不得存在于 RHI 之外。天空盒与平行光阴影映射。"
            },
            {
              "label": "阶段 5",
              "title": "场景图、.efe 与编辑器",
              "desc": "带世代句柄的 SceneGraph、按节点的 behaviors，以及 .efe 二进制格式——分块、带版本号，读取器对损坏文件极为苛刻。sandbox 演进为停靠式编辑器。"
            },
            {
              "label": "阶段 6",
              "title": "完整 IBL",
              "desc": "漫反射辐照度加 split-sum 镜面反射：每个 mip 一次 dispatch 的 GGX 预过滤与 BRDF LUT，均由 compute shader 完成。同时加入自发光贴图与 normal strength。"
            }
          ],
          "systems": [
            {
              "label": "efecom · RHI",
              "role": "唯一与 GPU 对话的表面。不透明的 u32 句柄，API 中不出现任何 OpenGL 类型，GL 4.5 后端可替换。它不依赖 efengine。"
            },
            {
              "label": "renderer",
              "role": "点光源与平行光下的 PBR、漫反射与镜面 IBL、阴影 pass、天空盒，以及由 bloom、tonemap 和 FXAA 组成的 PostChain。"
            },
            {
              "label": "scene",
              "role": "以句柄 + 世代寻址的节点图：销毁节点会使其旧句柄失效。只重算 dirty 部分的层级变换，以及按节点的 behaviors。"
            },
            {
              "label": "resources",
              "role": "凡是按路径从磁盘加载的资源都归它所有：着色器、带显式色彩空间的贴图，以及经 Assimp 导入的 FBX 模型。缓存并返回观察者指针。"
            },
            {
              "label": "serialization",
              "role": ".efe 格式：带版本号的文件头与 FourCC 分块。每个类型只需一个 Serialize(Ar&) 即可读写；未知分块按大小跳过。"
            },
            {
              "label": "sandbox",
              "role": "Unity 风格的停靠式 ImGui 编辑器：层级、检视器、材质实时编辑、渲染面板、帧统计与场景的保存/加载。"
            }
          ]
        },
```

And at `src/i18n/locales/zh.json:412`:

```json
      "developmentRoadmap": "开发路线图",
      "engineSystems": "引擎系统",
      "keyImplementation": "关键实现"
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `pnpm test`
Expected: PASS, all 24 cases (6 assertions × 4 locales) plus the 4 parity cases.

If `%s no longer advertises the retired OpenGL 3.3 target` fails, search the block for a stray `3.3` — it should appear nowhere, including inside `description`.

- [ ] **Step 8: Verify the build still typechecks**

Run: `pnpm build`
Expected: PASS. Nothing reads `systems` yet, so this only confirms the four locales still satisfy the `en` shape and the JSON parses.

- [ ] **Step 9: Commit**

```bash
git add src/test/localeCard.test.ts src/i18n/locales/en.json src/i18n/locales/es.json src/i18n/locales/pt.json src/i18n/locales/zh.json
git commit -m "feat(work): rewrite EFENGINE card copy for the current engine

The card froze at "Hello Triangle" while the engine shipped 380 commits
over two months. Rewrites title, summary and description around what the
engine does today, grows the roadmap from 3 to 7 phases rebuilt from the
gitlog, and adds a 6-row engine-systems block. Adds a locale test that
pins array lengths across the four locales, which the satisfies check in
config.ts cannot enforce on its own."
```

---

### Task 2: `ProjectSystem` type and the data merge

**Files:**
- Modify: `src/components/projectTypes.ts:15-20` (insert after `ProjectPhase`), `:55-77` (the `Project` interface)
- Modify: `src/components/FeaturedWorks.tsx:25` (tech-stack chips), `:528-536` (the EFENGINE merge)

**Interfaces:**
- Consumes: `work.featured.projects.efengine.systems` from Task 1, reached as `fp.efengine.systems` where `fp = messages.work.featured.projects`.
- Produces: `ProjectSystem { label: string; role: string }` exported from `projectTypes.ts`, and `Project.systems?: ProjectSystem[]` — both read by Task 3's `EngineSystems` component.

- [ ] **Step 1: Add the `ProjectSystem` interface**

In `src/components/projectTypes.ts`, directly after the `ProjectPhase` interface (which ends at line 20):

```ts
export interface ProjectSystem {
    /** Module name as it appears in the repo, e.g. "efecom · RHI". */
    label: string;
    role: string;
}
```

- [ ] **Step 2: Add the optional field to `Project`**

In the same file, inside `export interface Project`, immediately after the `phases?: ProjectPhase[];` line:

```ts
    /** Architecture breakdown — one row per engine subsystem. */
    systems?: ProjectSystem[];
```

- [ ] **Step 3: Update the tech-stack chips**

In `src/components/FeaturedWorks.tsx`, replace line 25:

```ts
    techStack: ["C++17", "OpenGL 3.3 Core", "GLFW", "GLAD", "GLM", "Doctest", "CMake"],
```

with:

```ts
    techStack: ["C++17", "OpenGL 4.5 Core", "PBR + IBL", "Dear ImGui", "Assimp", "GLFW", "GLM", "doctest", "CMake"],
```

EFENGINE is the flagship and flagships are filtered out of the grid (`FeaturedWorks.tsx:605`), so all nine chips render — the 3-chip truncation at line 819 never applies to this card.

- [ ] **Step 4: Wire `systems` and fix the current-phase index**

In `src/components/FeaturedWorks.tsx`, replace line 535:

```ts
        phases: fp.efengine.phases.map((ph, i) => ({ ...ph, current: i === 2 })),
```

with:

```ts
        phases: fp.efengine.phases.map((ph, i, arr) => ({ ...ph, current: i === arr.length - 1 })),
        systems: fp.efengine.systems,
```

The fixed index would have highlighted Fase 2 out of seven. Deriving it from the array length matches what `bancoProvincia` already does at line 547 and keeps the marker correct on the next update.

- [ ] **Step 5: Verify the build typechecks**

Run: `pnpm build`
Expected: PASS. If `Property 'systems' does not exist` appears, Task 1's `en.json` edit did not land — `Messages` is `typeof en`, so the field only exists once it is in the English locale.

- [ ] **Step 6: Run lint and tests**

Run: `pnpm lint && pnpm test`
Expected: PASS, no new warnings.

- [ ] **Step 7: Commit**

```bash
git add src/components/projectTypes.ts src/components/FeaturedWorks.tsx
git commit -m "feat(work): carry engine systems into the EFENGINE project data

Adds ProjectSystem and the optional Project.systems field, refreshes the
tech-stack chips to OpenGL 4.5 and the dependencies the engine actually
uses, and derives the current roadmap phase from the array length instead
of a hardcoded index 2 that would have marked the wrong phase."
```

---

### Task 3: `EngineSystems` block in the modal

**Files:**
- Modify: `src/components/ProjectPreviewModal.tsx:414` (insert the new component after `DevelopmentRoadmap`), `:530` (the description paragraph), `:575-581` (the phase branch)

**Interfaces:**
- Consumes: `Project.systems` and `ProjectSystem` from Task 2; `work.modal.engineSystems` from Task 1.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the `EngineSystems` component**

In `src/components/ProjectPreviewModal.tsx`, immediately after the closing `};` of `DevelopmentRoadmap` (line 414):

```tsx
// Sibling of DevelopmentRoadmap: same container, two columns instead of
// three, no phase state. The roadmap says when things happened; this says
// how the engine is put together.
const EngineSystems = ({ project }: { project: Project }) => {
    const { t } = useTranslation();
    if (!project.systems?.length) return null;
    return (
        <div>
            <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-dark-900/55 mb-4">
                {t('work.modal.engineSystems')}
            </h3>
            <div className="rounded-2xl border border-dark-900/10 divide-y divide-dark-900/[0.07] overflow-hidden bg-cream-50/40">
                {project.systems.map((system, i) => (
                    <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 px-5 py-4"
                    >
                        <span className="font-mono text-[11px] tracking-[0.12em] text-teal-700 shrink-0 sm:w-32">
                            {system.label}
                        </span>
                        <p className="min-w-0 text-sm text-dark-900/60 leading-relaxed">
                            {system.role}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

`sm:w-32` (128px) holds the longest label, `serialization`, at 11px mono. Below the `sm` breakpoint the label stacks above its sentence. `text-teal-700` is the accent already used for the current phase and the flagship tag, tying the block to personal projects.

- [ ] **Step 2: Compose it into the phase branch**

Replace the phase branch at `src/components/ProjectPreviewModal.tsx:575-581`:

```tsx
                                    ) : project.phases?.length ? (
                                        <div className="space-y-8">
                                            <DevelopmentRoadmap project={project} />
                                            {project.repo && (
                                                <LatestCommit repo={project.repo} variant="detail" />
                                            )}
                                        </div>
```

with:

```tsx
                                    ) : project.phases?.length ? (
                                        <div className="space-y-8">
                                            <DevelopmentRoadmap project={project} />
                                            <EngineSystems project={project} />
                                            {project.repo && (
                                                <LatestCommit repo={project.repo} variant="detail" />
                                            )}
                                        </div>
```

`EngineSystems` returns `null` when `systems` is absent, so other phase-bearing cards are untouched.

- [ ] **Step 3: Let the description render its two paragraphs**

Replace `src/components/ProjectPreviewModal.tsx:530`:

```tsx
                                            <p className="text-lg text-gray-600 leading-relaxed">
```

with:

```tsx
                                            <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
```

Every other project description is a single paragraph with no newlines, so this changes nothing for them.

- [ ] **Step 4: Verify the build typechecks**

Run: `pnpm build`
Expected: PASS.

- [ ] **Step 5: Run lint and tests**

Run: `pnpm lint && pnpm test`
Expected: PASS. `EngineSystems` must be referenced by Step 2 — an unused component would trip `no-unused-vars`.

- [ ] **Step 6: Commit**

```bash
git add src/components/ProjectPreviewModal.tsx
git commit -m "feat(work): render the engine-systems block in the project modal

Adds EngineSystems below the roadmap in the phase branch, and lets the
description paragraph honour newlines so the EFENGINE copy can separate
what the engine does from the rules it is built under."
```

---

### Task 4: Delete the unimported card twin

**Files:**
- Delete: `src/content/projects.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Confirm it is still unimported**

Search `src/` for `content/projects|featuredProjects` — with the Grep tool, or `grep -rn "content/projects\|featuredProjects" src/`.

Expected: exactly one hit — `src/content/projects.ts:4:export const featuredProjects: Project[] = [`, its own declaration. If anything else appears, **stop** and report it; the deletion is not safe.

- [ ] **Step 2: Delete the file**

```bash
git rm src/content/projects.ts
```

Leave `src/components/projectTypes.ts` alone — that one is imported by `FeaturedWorks.tsx` and `ProjectPreviewModal.tsx`.

- [ ] **Step 3: Check whether `src/content/` is now empty**

Run: `ls src/content`
If the directory is empty, `git rm` has already removed it from the index; nothing further to do. If other files remain, leave them.

- [ ] **Step 4: Verify the build**

Run: `pnpm build && pnpm lint && pnpm test`
Expected: PASS. A failure here means the file was reachable after all — restore it with `git checkout HEAD -- src/content/projects.ts` and report.

- [ ] **Step 5: Commit**

```bash
git commit -m "chore(work): drop the unimported projects.ts card twin

Zero imports, and its hardcoded English already contradicted the locales
for several cards. FeaturedWorks.tsx plus the locale files are the only
source of card data; projectTypes.ts, which is imported, stays."
```

---

### Task 5: Full verification and visual pass

**Files:** none modified.

**Interfaces:**
- Consumes: everything from Tasks 1–4.
- Produces: nothing.

- [ ] **Step 1: Run the full check**

```bash
pnpm build && pnpm lint && pnpm test
```
Expected: all three PASS. Record the actual output; do not claim success without it.

- [ ] **Step 2: Start the dev server**

Run: `pnpm dev`
Expected: Vite serves on `http://localhost:5173`.

- [ ] **Step 3: Inspect the flagship band in English**

Open `http://localhost:5173`, scroll to the "Selected Work" section.

Confirm:
- Title reads **EFENGINE — C++ Game Engine**
- The summary mentions OpenGL 4.5 Core, and **not** 3.3
- Nine tech-stack chips render, wrapping cleanly
- The Latest Commit badge still loads

- [ ] **Step 4: Inspect the modal**

Click the flagship card.

Confirm:
- The description shows as **two paragraphs** with a visible gap
- **Development Roadmap** lists 7 rows, and **Fase 6 · Full IBL** is the one in teal
- **Engine Systems** appears below it with 6 rows, labels aligned in a column
- The Latest Commit detail sits below both
- The right column scrolls without clipping or horizontal overflow

- [ ] **Step 5: Repeat in Spanish**

Switch the language to Español and reopen the modal. Confirm the title reads **EFENGINE — Motor de Juegos en C++**, the roadmap heading reads **Hoja de Ruta**, and the systems heading reads **Sistemas del Motor**, still 7 and 6 rows.

- [ ] **Step 6: Narrow viewport check**

Resize the browser to ~375px wide. Confirm the systems rows stack (label above sentence) and nothing overflows horizontally.

- [ ] **Step 7: Spot-check `pt` and `zh`**

Switch to Português and 中文. Confirm the modal renders 7 roadmap rows and 6 system rows in each, with the `zh` phase labels reading `阶段 0`–`阶段 6`. Task 1's test already guarantees the counts; this confirms nothing renders as a raw key such as `work.modal.engineSystems`.

- [ ] **Step 8: Report**

Summarize what passed and what did not, quoting the actual command output. If any visual issue turned up, describe it rather than silently fixing it outside the plan.

---

## Notes for the reviewer

- **Do not** add `@testing-library/react` to make Task 3 testable. The spec forbids new dependencies; the visual pass in Task 5 is the agreed verification for rendering.
- **Do not** translate the module labels in `systems` — `efecom`, `renderer`, `scene`, `resources`, `serialization`, `sandbox` are repo identifiers.
- The phase list remains a manual snapshot. Fixing the hardcoded `current` index removes the worst failure mode, but the card will still need a human pass as the engine moves. That is known and out of scope here.

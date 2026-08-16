# Briefing dos vídeos de fundo — IndiqueLeads

Ferramenta: **Google Flow (Veo 3)**.
Componente que consome estes arquivos: `src/components/landing/VideoBackdrop.tsx`.

---

## 1. Como o vídeo é usado (isso define o enquadramento)

O vídeo é **fundo**, com `object-cover` e um gradiente escuro por cima. Duas
consequências práticas:

1. **O texto NÃO vai no vídeo.** O wordmark "IndiqueLeads", o subtítulo e os
   botões já são HTML por cima — nítidos em qualquer tela, selecionáveis,
   lidos pelo Google e por leitor de tela. Texto embutido no vídeo fica
   borrado pela compressão, não escala e não é acessível.
   → **Prompt sempre com "no text, no letters, no logos".**

2. **`object-cover` corta.** Num celular 390×844, um vídeo 16:9 perde as
   laterais e sobra só a faixa central. Por isso:
   - ou a ação acontece na **faixa central** (funciona nos dois formatos),
   - ou geramos **duas versões**: 16:9 e 9:16. É o ideal, e o componente já
     suporta via a prop `mobile`.

---

## 2. Arquivos esperados

Colocar em `public/videos/`:

| Arquivo | Seção | Prop no componente |
|---|---|---|
| `hero.mp4` + `hero_poster.jpg` | Hero (topo) | `<VideoBackdrop name="hero" mobile="hero-9x16" />` |
| `hero-9x16.mp4` + `hero-9x16_poster.jpg` | Hero no celular | idem |
| `fluxo.mp4` + `fluxo_poster.jpg` | Como Funciona (3 passos) | `<VideoBackdrop name="fluxo" />` |
| `cta.mp4` + `cta_poster.jpg` | Chamada final | `<VideoBackdrop name="cta" />` |

Os posters eu gero a partir do vídeo — não precisa exportar à parte.

### Specs técnicas

- **1920×1080** (16:9) e **1080×1920** (9:16)
- H.264, sem áudio (o Veo 3 gera som; a faixa é removida na otimização)
- 10–16s de duração final, em **loop**
- Alvo: **< 3 MB** desktop, **< 2 MB** mobile

---

## 3. Estratégia no Flow (clipes de 8s)

O Veo 3 entrega ~8s por clipe. Para o hero com vários produtos, o caminho é:

- **Gere 3 clipes de 8s** (2 produtos por clipe, ver prompts abaixo).
- Em cada clipe, use **"Frames to Video"** com o **mesmo frame no início e no
  fim** quando quiser loop perfeito; para os clipes do meio, deixe o último
  frame de um ser o primeiro do próximo (o Flow aceita isso e a emenda some).
- **Me manda os 3 clipes brutos** que eu junto com crossfade, faço o loop
  fechar, removo o áudio, comprimo e gero os posters. Já tenho ffmpeg aqui.

Alternativa mais simples: **um único clipe de 8s** com 2–3 produtos, em loop.
Fica menos rico, mas resolve.

---

## 4. Prompts

### 4.1 HERO — "Materialização" (16:9)

Conceito: os produtos surgem de partículas de luz verde num vazio escuro e se
desfazem, um após o outro. Elegante, caro, sem apelo. O terço superior fica
vazio de propósito — é onde entra o wordmark em HTML.

```
Cinematic slow dolly-forward through an infinite dark void. Near-black charcoal
background. Volumetric haze and floating dust particles catching light.

Luxury products materialize one after another from swirling emerald-green light
particles, hold for a moment, then dissolve back into particles: first a modern
architectural house with warm lit windows, then a sleek dark sports car.

Each object reads as an elegant dark silhouette traced by thin emerald-green and
deep petrol-blue rim light along its edges. Objects occupy the lower two-thirds
of the frame and drift slowly toward camera. The upper third stays empty dark
negative space.

Extremely slow, calm, weightless motion. Shallow depth of field, subtle lens
bloom, fine film grain. Premium automotive-commercial aesthetic. Moody, dark,
high-end.

No text, no letters, no logos, no people, no faces.
```

**Clipe 2** — trocar os produtos por: `a premium motorcycle, then a luxury yacht
on black water with reflections`.

**Clipe 3** — trocar por: `a jetski throwing a slow arc of spray, then a field of
solar panels under a dark sky`.

Manter todo o resto do texto idêntico nos três — é isso que dá unidade visual.

**Negative prompt** (se o Flow pedir):
```
text, letters, words, watermark, logo, subtitles, people, faces, hands,
bright daylight, blown highlights, oversaturated colors, fast cuts,
camera shake, cluttered background, cartoon, low quality
```

### 4.2 HERO — versão celular (9:16)

Mesma direção de arte, composição recomposta para vertical:

```
[mesmo texto do 4.1, trocando o parágrafo de composição por:]

The objects rise slowly through the vertical center of the frame, stacked in
depth one behind the other, filling the lower half. The top half stays empty
dark negative space. Vertical composition, centered.
```

### 4.3 SEÇÃO "COMO FUNCIONA" — "O link que viaja" (16:9)

Conceito: visualiza literalmente o produto — o link sai do celular do
indicador, atravessa a cidade e acende a porta da loja.

```
Macro cinematic shot on a near-black background with volumetric fog and deep
petrol-blue ambient light.

A pulse of emerald-green light is born as a ripple on the dark glass of a
smartphone, then travels as a single thin luminous line across an abstract dark
topographic city map made of faint glowing contour lines, and finally arrives at
a storefront doorway, where it blooms into a soft green glow.

Ultra slow motion, elegant, minimal, generous negative space, shallow depth of
field, fine film grain.

No text, no letters, no logos, no people, no faces.
```

### 4.4 CTA FINAL — "Chave e horizonte" (16:9)

```
Cinematic ultra-slow aerial drift over calm dark water at blue hour, moving
toward a distant coastline where a few warm lights glow. Emerald-green
bioluminescent particles drift across the surface, catching the light.

Near-black water, deep petrol-blue sky, minimal, vast, aspirational. Shallow
depth of field, fine film grain, subtle lens bloom.

No text, no letters, no logos, no people, no boats in the foreground.
```

---

## 5. Regras de arte que valem para todos

Medi isso no site que serviu de referência (midiaeco.com) e bate com o que
falhou na minha primeira tentativa:

- **Vídeo escuro é obrigatório.** O overlay lá vai de 40% a 85% de preto. Minha
  primeira versão usou foto de dia claro e o texto ficou ilegível.
- **Movimento lento.** Corte rápido atrás de um título parado cansa em 3s.
- **Sem gente e sem rosto** — desvia o olho do texto na hora.
- **Verde `#48A848` e azul `#0C486C`** são as cores da marca; peça a luz nessas
  cores para o vídeo conversar com a interface.
- **Nada de texto no vídeo.**

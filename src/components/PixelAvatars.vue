<script setup lang="ts">
import { computed } from 'vue'

export type Expression =
  | 'idle'
  | 'question'
  | 'sad'
  | 'happy'
  | 'rose'
  | 'jump'
  // Legacy aliases
  | 'neutral'
  | 'thinking'
  | 'shocked'

const props = withDefaults(
  defineProps<{
    himMood?: Expression
    herMood?: Expression
    height?: number
  }>(),
  {
    himMood: 'idle',
    herMood: 'idle',
    height: 130,
  },
)

// Normalizes legacy aliases to canonical expressions
function normalizeMood(mood: Expression): 'idle' | 'question' | 'sad' | 'happy' | 'rose' | 'jump' {
  if (mood === 'neutral') return 'idle'
  if (mood === 'thinking') return 'question'
  if (mood === 'shocked') return 'sad'
  return mood
}

// Map canonical expression → actual filename for each character
const HIM_FILE_MAP: Record<string, string> = {
  idle: 'idle',
  question: 'question',
  sad: 'crying',
  happy: 'happy',
  rose: 'rose',
  jump: 'jumping',
}

const HER_FILE_MAP: Record<string, string> = {
  idle: 'idle',
  question: 'waiting',
  sad: 'no',
  happy: 'happy',
  rose: 'blow-kiss',
  jump: 'happy',
}

// Scan subdirectory spritesheets
const himModules = import.meta.glob<{ default: string }>(
  '../assets/avatars/him/*.{webp,png,jpg,jpeg}',
  { eager: true },
)
const herModules = import.meta.glob<{ default: string }>(
  '../assets/avatars/her/*.{webp,png,jpg,jpeg}',
  { eager: true },
)

function getSpriteUrl(character: 'him' | 'her', fileName: string): string | null {
  const modules = character === 'him' ? himModules : herModules
  const extensions = ['png', 'webp', 'jpg', 'jpeg']
  for (const ext of extensions) {
    const key = `../assets/avatars/${character}/${fileName}.${ext}`
    if (modules[key]) return modules[key].default
  }
  return null
}

const himNormalized = computed(() => normalizeMood(props.himMood))
const herNormalized = computed(() => normalizeMood(props.herMood))

const himFileName = computed(() => HIM_FILE_MAP[himNormalized.value] ?? himNormalized.value)
const herFileName = computed(() => HER_FILE_MAP[herNormalized.value] ?? herNormalized.value)

const himSpriteUrl = computed(() => getSpriteUrl('him', himFileName.value))
const herSpriteUrl = computed(() => getSpriteUrl('her', herFileName.value))

// him>jumping has 4 frames (800×210), everything else has 3 frames (600×210)
// her is always 3 frames
const himFrameCount = computed(() => (himNormalized.value === 'jump' ? 4 : 3))
const herFrameCount = computed(() => 3)
</script>

<template>
  <div class="pixel-avatars-wrapper" :style="{ '--avatar-height': `${props.height}px` }">
    <!-- "Him" Character Avatar -->
    <div class="avatar-slot">
      <div
        v-if="himSpriteUrl"
        :key="`him-${himNormalized}`"
        :class="['sprite-avatar', 'avatar-him', `frames-${himFrameCount}`, `anim-${himNormalized}`]"
        :style="{ backgroundImage: `url(${himSpriteUrl})` }"
        :aria-label="`Him (${himNormalized})`"
      ></div>
      <!-- Fallback if him sprite is missing -->
      <svg v-else viewBox="0 0 16 16" class="pixel-svg" shape-rendering="crispEdges">
        <rect x="3" y="3" width="10" height="10" fill="#fcd34d" />
        <rect x="3" y="1" width="10" height="3" fill="#1e293b" />
        <rect x="2" y="2" width="2" height="4" fill="#1e293b" />
        <rect x="12" y="2" width="2" height="4" fill="#1e293b" />
        <rect x="5" y="6" width="2" height="2" fill="#0f172a" />
        <rect x="9" y="6" width="2" height="2" fill="#0f172a" />
        <rect x="6" y="10" width="4" height="1" fill="#0f172a" />
      </svg>
    </div>

    <!-- "Her" Character Avatar -->
    <div class="avatar-slot">
      <div
        v-if="herSpriteUrl"
        :key="`her-${herNormalized}`"
        :class="['sprite-avatar', 'avatar-her', `frames-${herFrameCount}`, `anim-${herNormalized}`]"
        :style="{ backgroundImage: `url(${herSpriteUrl})` }"
        :aria-label="`Her (${herNormalized})`"
      ></div>
      <!-- Default SVG Fallback until her spritesheets are added -->
      <svg v-else viewBox="0 0 16 16" class="pixel-svg" shape-rendering="crispEdges">
        <rect x="3" y="3" width="10" height="10" fill="#fed7aa" />
        <rect x="3" y="1" width="10" height="3" fill="#78350f" />
        <rect x="2" y="2" width="2" height="8" fill="#78350f" />
        <rect x="12" y="2" width="2" height="8" fill="#78350f" />
        <rect x="12" y="2" width="2" height="2" fill="#e63946" />
        <rect x="5" y="6" width="2" height="2" fill="#0f172a" />
        <rect x="9" y="6" width="2" height="2" fill="#0f172a" />
        <rect x="6" y="10" width="4" height="1" fill="#e11d48" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.pixel-avatars-wrapper {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  /* gap: var(--spacing-lg, 1.5rem); */
  margin-bottom: var(--spacing-xs, 0.25rem);
  user-select: none;
}

.avatar-slot {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: transparent;
  flex-shrink: 0;
}

.sprite-avatar {
  display: block;
  background-repeat: no-repeat;
  background-position: 0% 0;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

/* Per-character frame gap (spacing between frames in the spritesheet) */
.sprite-avatar.avatar-him {
  --frame-gap: 5px;
}
.sprite-avatar.avatar-her {
  --frame-gap: 3px;
}

/*
  Sprites are horizontal strips of 200×210px frames.
  3-frame strip: 600×210 → display one 200×210 frame
  4-frame strip: 800×210 → display one 200×210 frame (him>jumping only)
*/
.sprite-avatar.frames-3 {
  width: var(--avatar-height, 130px);
  aspect-ratio: 200 / 210;
  background-size: 300% 100%;
}

.sprite-avatar.frames-4 {
  width: var(--avatar-height, 130px);
  aspect-ratio: 200 / 210;
  background-size: 400% 100%;
}

/* --- Looping Animations --- */
.sprite-avatar.anim-idle {
  animation: play-3-loop 0.85s steps(1) infinite;
}

/* Him happy: play once (3 frames, stay on last) */
.sprite-avatar.avatar-him.anim-happy {
  animation: play-3-once 1s steps(1) forwards;
}

/* Her happy & her jump: loop last 2 frames (2 ↔ 3) */
.sprite-avatar.avatar-her.anim-happy,
.sprite-avatar.avatar-her.anim-jump {
  animation: play-her-happy 1s steps(1) infinite;
}

/* --- Sad: Frame 1 → 2 → 3 intro, then continuous 1 ↔ 2 loop --- */
.sprite-avatar.anim-sad {
  animation: play-sad 2.2s steps(1) infinite;
}

/* --- Play ONCE (question, rose) --- */
.sprite-avatar.anim-question {
  animation: play-3-once 1.4s steps(1) forwards;
}

.sprite-avatar.anim-rose {
  animation: play-3-once 1.5s steps(1) forwards;
}

/* Him jump: 4 frames, continuous loop */
.sprite-avatar.avatar-him.anim-jump {
  animation: play-4-loop 0.9s steps(1) infinite;
}

.pixel-svg {
  display: block;
  width: var(--avatar-height, 130px);
  aspect-ratio: 1;
  background: transparent;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

/*
  All background-position values use pixel offsets (calc with --avatar-height).
  Each frame step = --avatar-height + --frame-gap (per-character gap between frames).
*/

/* 3-Frame Continuous Loop: F1 → F2 → F3 → F1 */
@keyframes play-3-loop {
  0% {
    background-position: 0 0;
  }
  33.333% {
    background-position: calc(-1 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  }
  66.666% {
    background-position: calc(-2 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  }
  100% {
    background-position: 0 0;
  }
}

/* Her happy: F1 intro → loop F2 ↔ F3 */
@keyframes play-her-happy {
  0% {
    background-position: 0 0;
  } /* F1 */
  20% {
    background-position: calc(-1 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  } /* F2 */
  40% {
    background-position: calc(-2 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  } /* F3 */
  60% {
    background-position: calc(-1 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  } /* F2 */
  80% {
    background-position: calc(-2 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  } /* F3 */
  100% {
    background-position: calc(-1 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  } /* F2 */
}

/* 4-Frame Continuous Loop: F1 → F2 → F3 → F4 → F1 (him jump) */
@keyframes play-4-loop {
  0% {
    background-position: 0 0;
  } /* F1 */
  25% {
    background-position: calc(-1 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  } /* F2 */
  50% {
    background-position: calc(-2 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  } /* F3 */
  75% {
    background-position: calc(-3 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  } /* F4 */
  100% {
    background-position: 0 0;
  } /* F1 */
}

/* Sad: intro all 3, then oscillate F1 ↔ F2 */
@keyframes play-sad {
  0% {
    background-position: 0 0;
  } /* F1 */
  18% {
    background-position: calc(-1 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  } /* F2 */
  36% {
    background-position: calc(-2 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  } /* F3 */
  54% {
    background-position: 0 0;
  } /* F1 */
  77% {
    background-position: calc(-1 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  } /* F2 */
  100% {
    background-position: 0 0;
  } /* F1 */
}

/* 3-Frame Single Play (stays on last frame) */
@keyframes play-3-once {
  0% {
    background-position: 0 0;
  } /* F1 */
  33.333% {
    background-position: calc(-1 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  } /* F2 */
  66.666%,
  100% {
    background-position: calc(-2 * (var(--avatar-height, 130px) + var(--frame-gap, 5px))) 0;
  } /* F3 */
}
</style>

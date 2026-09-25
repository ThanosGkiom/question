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
  }
)

// Normalizes aliases
function normalizeMood(mood: Expression): 'idle' | 'question' | 'sad' | 'happy' | 'rose' | 'jump' {
  if (mood === 'neutral') return 'idle'
  if (mood === 'thinking') return 'question'
  if (mood === 'shocked') return 'sad'
  return mood
}

// Automatically detect spritesheets in src/assets/avatars/
const avatarModules = import.meta.glob<{ default: string }>(
  '../assets/avatars/*.(webp|png|jpg|jpeg|gif|svg)',
  { eager: true }
)

function getSpriteUrl(character: 'him' | 'her', mood: Expression): string | null {
  const norm = normalizeMood(mood)
  const patterns = [
    `../assets/avatars/${character}_${norm}.png`,
    `../assets/avatars/${character}_${norm}.webp`,
    `../assets/avatars/${character}-${norm}.png`,
    `../assets/avatars/${character}-${norm}.webp`,
    `../assets/avatars/${character}-${norm}.jpg`,
  ]

  for (const p of patterns) {
    if (avatarModules[p]) {
      return avatarModules[p].default
    }
  }
  return null
}

const himNormalized = computed(() => normalizeMood(props.himMood))
const herNormalized = computed(() => normalizeMood(props.herMood))

const himSpriteUrl = computed(() => getSpriteUrl('him', props.himMood))
const herSpriteUrl = computed(() => getSpriteUrl('her', props.herMood))

const himFrameCount = computed(() => (himNormalized.value === 'jump' ? 5 : 3))
const herFrameCount = computed(() => (herNormalized.value === 'jump' ? 5 : 3))
</script>

<template>
  <div class="pixel-avatars-wrapper" :style="{ '--avatar-height': `${props.height}px` }">
    <!-- "Him" Character Avatar -->
    <div class="avatar-slot">
      <div
        v-if="himSpriteUrl"
        :key="`him-${himNormalized}`"
        :class="['sprite-avatar', `frames-${himFrameCount}`, `anim-${himNormalized}`]"
        :style="{ backgroundImage: `url(${himSpriteUrl})` }"
        :aria-label="`Him (${himNormalized})`"
      ></div>
      <!-- Fallback if him sprite is missing -->
      <svg
        v-else
        viewBox="0 0 16 16"
        class="pixel-svg"
        shape-rendering="crispEdges"
      >
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
        :class="['sprite-avatar', `frames-${herFrameCount}`, `anim-${herNormalized}`]"
        :style="{ backgroundImage: `url(${herSpriteUrl})` }"
        :aria-label="`Her (${herNormalized})`"
      ></div>
      <!-- Default SVG Fallback until her spritesheets are added -->
      <svg
        v-else
        viewBox="0 0 16 16"
        class="pixel-svg"
        shape-rendering="crispEdges"
      >
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
  gap: var(--spacing-lg, 1.5rem);
  margin-bottom: var(--spacing-xs, 0.25rem);
  user-select: none;
}

.avatar-slot {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: transparent;
  width: calc(var(--avatar-height, 130px) * (480 / 450));
  height: var(--avatar-height, 130px);
  flex-shrink: 0;
}

.sprite-avatar {
  display: block;
  height: 100%;
  background-repeat: no-repeat;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

/* Aspect ratios */
.sprite-avatar.frames-3 {
  aspect-ratio: 480 / 450;
  background-size: 300% 100%;
}

.sprite-avatar.frames-5 {
  aspect-ratio: 288 / 490;
  background-size: 500% 100%;
}

/* --- Looping Animations --- */
.sprite-avatar.anim-idle,
.sprite-avatar.anim-happy {
  animation: play-3-loop 0.85s steps(1) infinite;
}

/* --- Sad: Frame 1 -> 2 -> 3 intro, then continuous 1 <-> 2 loop --- */
.sprite-avatar.anim-sad {
  animation: play-sad 2.2s steps(1) infinite;
}

/* --- Play ONCE & Slowly (rose, question) --- */
.sprite-avatar.anim-question {
  animation: play-3-once 1.4s steps(1) forwards;
}

.sprite-avatar.anim-rose {
  animation: play-3-once 1.5s steps(1) forwards;
}

/* --- Jump: Step through the 5 sprite frames without artificial transform jump --- */
.sprite-avatar.anim-jump {
  animation: play-5-once 1.3s steps(1) forwards;
}

.pixel-svg {
  display: block;
  width: 100%;
  height: 100%;
  background: transparent;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

/* 3-Frame Continuous Loop */
@keyframes play-3-loop {
  0% {
    background-position: 0% 0;
  }
  33.333% {
    background-position: 50% 0;
  }
  66.666% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0% 0;
  }
}

/* Sad Animation:
   Plays Frame 1 (0%), Frame 2 (50%), Frame 3 (100%),
   then oscillates between Frame 1 and Frame 2.
*/
@keyframes play-sad {
  0% {
    background-position: 0% 0; /* Frame 1 */
  }
  18% {
    background-position: 50% 0; /* Frame 2 */
  }
  36% {
    background-position: 100% 0; /* Frame 3 (last frame reached) */
  }
  54% {
    background-position: 0% 0; /* Frame 1 */
  }
  77% {
    background-position: 50% 0; /* Frame 2 */
  }
  100% {
    background-position: 0% 0; /* Frame 1 */
  }
}

/* 3-Frame Single Play (stays on final frame) */
@keyframes play-3-once {
  0% {
    background-position: 0% 0;
  }
  33.333% {
    background-position: 50% 0;
  }
  66.666%,
  100% {
    background-position: 100% 0;
  }
}

/* 5-Frame Single Play (stays on final frame) */
@keyframes play-5-once {
  0% {
    background-position: 0% 0;
  }
  20% {
    background-position: 25% 0;
  }
  40% {
    background-position: 50% 0;
  }
  60% {
    background-position: 75% 0;
  }
  80%,
  100% {
    background-position: 100% 0;
  }
}
</style>

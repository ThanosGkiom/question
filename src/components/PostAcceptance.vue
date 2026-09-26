<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import confetti from 'canvas-confetti'
import { postAcceptanceConfig as cfg } from '../data/post-acceptance'

// ─── Confetti celebration ────────────────────────────────────────────────────
function launchConfetti() {
  const duration = 3000
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#E63946', '#F4D35E', '#457B9D', '#ff99aa', '#ffffff'],
    })
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#E63946', '#F4D35E', '#457B9D', '#ff99aa', '#ffffff'],
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }

  frame()
}

// ─── Visibility-change tab title ─────────────────────────────────────────────
function handleVisibilityChange() {
  document.title = document.hidden ? cfg.tabTitleHidden : cfg.tabTitleActive
}

onMounted(() => {
  document.title = cfg.tabTitleActive
  document.addEventListener('visibilitychange', handleVisibilityChange)
  launchConfetti()
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div class="pa">
    <!-- Status badge -->
    <p class="pa__badge" aria-label="Relationship status">{{ cfg.statusBadge }}</p>

    <!-- Heading -->
    <h2 id="success-title" class="pa__heading">{{ cfg.heading }}</h2>

    <!-- Terms & perks -->
    <div class="pa__terms">
      <p class="pa__terms-intro">{{ cfg.termsIntro }}</p>
      <ul class="pa__perks" aria-label="Unlocked perks">
        <li v-for="perk in cfg.perks" :key="perk.text" class="pa__perk">
          <span aria-hidden="true">{{ perk.icon }}</span>
          {{ perk.text }}
        </li>
      </ul>
      <p class="pa__clause">{{ cfg.clause }}</p>
    </div>

    <!-- Behind-the-scenes stats -->
    <div class="pa__stats-box" aria-label="Behind the scenes stats">
      <p class="pa__stats-label">{{ cfg.statsLabel }}</p>
      <dl class="pa__stats">
        <div v-for="stat in cfg.stats" :key="stat.label" class="pa__stat">
          <dt class="pa__stat-label">{{ stat.label }}</dt>
          <dd class="pa__stat-value">{{ stat.value }}</dd>
        </div>
      </dl>
    </div>

    <!-- Romantic note -->
    <blockquote class="pa__note" v-html="cfg.romanticNote" />

    <!-- WhatsApp CTA -->
    <a
      :href="cfg.whatsappUrl"
      class="btn pa__whatsapp-btn"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="cfg.whatsappLabel"
    >
      {{ cfg.whatsappLabel }}
    </a>
  </div>
</template>

<style scoped>
/* ── Wrapper ──────────────────────────────────────────────────────────────── */
.pa {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md, 1rem);
  text-align: center;
  animation: pa-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes pa-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ── Status badge ─────────────────────────────────────────────────────────── */
.pa__badge {
  display: inline-block;
  padding: 0.2em 0.85em;
  border-radius: var(--radius-full, 9999px);
  background: color-mix(in srgb, var(--color-primary) 12%, var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  color: var(--color-primary);
  font-size: var(--font-size-xs, 0.75rem);
  font-weight: var(--font-weight-bold, 700);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ── Heading ──────────────────────────────────────────────────────────────── */
.pa__heading {
  font-size: var(--font-size-xl, 1.5rem);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text);
  margin: 0;
}

/* ── Terms & perks ────────────────────────────────────────────────────────── */
.pa__terms {
  width: 100%;
  background: color-mix(in srgb, var(--color-accent) 8%, var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
  border-radius: var(--radius-md, 8px);
  padding: var(--spacing-md, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 0.5rem);
  text-align: left;
}

.pa__terms-intro {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-muted);
  margin: 0;
}

.pa__perks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.pa__perk {
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pa__clause {
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted);
  margin: 0;
  padding-top: var(--spacing-xs, 0.25rem);
  border-top: 1px dashed var(--color-border);
}

/* ── Stats box ────────────────────────────────────────────────────────────── */
.pa__stats-box {
  width: 100%;
  background: color-mix(in srgb, var(--color-secondary) 8%, var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);
  border-radius: var(--radius-md, 8px);
  padding: var(--spacing-md, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 0.5rem);
  text-align: left;
}

.pa__stats-label {
  font-size: var(--font-size-xs, 0.75rem);
  font-weight: var(--font-weight-bold, 700);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-secondary);
  margin: 0;
}

.pa__stats {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
}

.pa__stat {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--spacing-sm, 0.5rem);
}

.pa__stat-label {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-muted);
}

.pa__stat-value {
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text);
  white-space: nowrap;
}

/* ── Romantic note ────────────────────────────────────────────────────────── */
.pa__note {
  margin: 0;
  padding: var(--spacing-md, 1rem);
  border-left: 3px solid var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface));
  border-radius: 0 var(--radius-md, 8px) var(--radius-md, 8px) 0;
  font-style: italic;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text);
  line-height: 1.7;
  text-align: left;
  width: 100%;
}

/* ── WhatsApp button ──────────────────────────────────────────────────────── */
.pa__whatsapp-btn {
  width: 100%;
  background: #25d366;
  color: #ffffff;
  font-weight: var(--font-weight-semibold, 600);
  border-radius: var(--radius-md, 8px);
  padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
  transition: background-color var(--transition-fast, 150ms ease);
  word-break: break-word;
}

.pa__whatsapp-btn:hover {
  background: #1ebe59;
  color: #ffffff;
}
</style>

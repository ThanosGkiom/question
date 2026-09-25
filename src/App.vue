<script setup lang="ts">
import { ref, computed } from 'vue'
import { questions } from './data/questions'
import { seriousQuestion } from './data/serious-question'
import { calendarConfig } from './data/calendar'
import { APP_PASSWORD, IS_DEBUG_MODE } from './data/password'
import PixelAvatars, { type Expression } from './components/PixelAvatars.vue'

// Local Timezone Date Formatter (YYYY-MM-DD)
function getLocalDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// App State
const isUnlocked = ref(IS_DEBUG_MODE)
const password = ref('')
const passwordError = ref('')

// Questionnaire State
const currentQuestionIndex = ref(0)
const selectedAnswer = ref<number | null>(null)
const isLoadingSuspense = ref(false)

const currentQuestion = computed(() => {
  return questions[currentQuestionIndex.value] ?? null
})

// Serious Question State
const isSeriousQuestion = computed(
  () => currentQuestionIndex.value >= questions.length && !isLoadingSuspense.value
)
const isAccepted = ref(false)
const yesScale = ref(1)
const noButtonPosition = ref({ x: 0, y: 0 })
const noDodgeCount = ref(0)

// Optional Manual Animation Preview Override for Dev
const devMoodOverride = ref<Expression | null>(null)

// Dynamic Pixel Avatar Moods
const avatarHimMood = computed<Expression>(() => {
  if (devMoodOverride.value) return devMoodOverride.value
  if (isAccepted.value) return 'jump'
  if (isLoadingSuspense.value) return 'question'
  if (isSeriousQuestion.value) {
    return noDodgeCount.value > 0 ? 'sad' : 'rose'
  }
  return 'idle'
})

const avatarHerMood = computed<Expression>(() => {
  if (devMoodOverride.value) return devMoodOverride.value
  if (isAccepted.value) return 'jump'
  if (isLoadingSuspense.value) return 'question'
  if (isSeriousQuestion.value) {
    return noDodgeCount.value > 0 ? 'happy' : 'idle'
  }
  return 'idle'
})

// Fixed, Non-editable Local Anniversary Date
const anniversaryDate = ref(getLocalDateString())

// Toast System (Top-Center Notification)
interface Toast {
  text: string
  type: 'success' | 'error'
}
const currentToast = ref<Toast | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function triggerToast(text: string, type: 'success' | 'error' = 'success', duration = 1800) {
  if (toastTimer) clearTimeout(toastTimer)
  currentToast.value = { text, type }
  toastTimer = setTimeout(() => {
    currentToast.value = null
  }, duration)
}

function handlePasswordSubmit() {
  if (!password.value) return
  if (password.value === APP_PASSWORD) {
    isUnlocked.value = true
    passwordError.value = ''
    triggerToast('Unlocked! Welcome', 'success')
  } else {
    passwordError.value = 'Incorrect password'
    triggerToast('Incorrect password!', 'error')
  }
}

function handleSelectOption(index: number) {
  selectedAnswer.value = index
  const currentQ = currentQuestion.value
  if (!currentQ) return

  if (index === currentQ.correctAnswerIndex) {
    triggerToast('Correct!', 'success', 1500)

    const isLastQuestion = currentQuestionIndex.value === questions.length - 1

    setTimeout(() => {
      selectedAnswer.value = null

      if (isLastQuestion) {
        // Dramatic suspense before the Serious Question
        isLoadingSuspense.value = true
        setTimeout(() => {
          isLoadingSuspense.value = false
          currentQuestionIndex.value++
        }, 3200)
      } else {
        currentQuestionIndex.value++
      }
    }, 500)
  } else {
    triggerToast('Incorrect, try again.', 'error', 1500)
    setTimeout(() => {
      selectedAnswer.value = null
    }, 600)
  }
}

function handleNoDodge() {
  noDodgeCount.value++

  // Grow YES button without an upper limit
  yesScale.value += 0.15

  // Move NO button away randomly within range
  const randomX = (Math.random() - 0.5) * 240
  const randomY = (Math.random() - 0.5) * 180

  noButtonPosition.value = {
    x: Math.round(randomX),
    y: Math.round(randomY),
  }
}

function handleYesClick() {
  isAccepted.value = true
  triggerToast('Accepted!', 'success', 3000)
}

// -------------------------------------------------------------
// Google Calendar Integration (Configured in src/data/calendar.ts)
// -------------------------------------------------------------
function handleAddToGoogleCalendar() {
  const rawDate = anniversaryDate.value || getLocalDateString()
  const [yearStr, monthStr, dayStr] = rawDate.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)

  const startFormatted = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`

  // Next calendar day in local time for all-day Google events
  const nextDate = new Date(year, month - 1, day + 1)
  const nextYear = nextDate.getFullYear()
  const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0')
  const nextDay = String(nextDate.getDate()).padStart(2, '0')
  const endFormatted = `${nextYear}${nextMonth}${nextDay}`

  const title = encodeURIComponent(calendarConfig.title)
  const details = encodeURIComponent(calendarConfig.details)
  const recur = encodeURIComponent(calendarConfig.recurrence)
  const location = calendarConfig.location
    ? `&location=${encodeURIComponent(calendarConfig.location)}`
    : ''
  const inviteParam = calendarConfig.inviteEmail
    ? `&add=${encodeURIComponent(calendarConfig.inviteEmail)}`
    : ''
  // In Google Calendar URL API, crm=BUSY and trp=false enforce Busy availability
  const busyParam = calendarConfig.showAsBusy ? '&crm=BUSY&trp=false' : '&crm=AVAILABLE&trp=true'

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startFormatted}/${endFormatted}&recur=${recur}&details=${details}${location}${inviteParam}${busyParam}`

  window.open(googleUrl, '_blank', 'noopener,noreferrer')
  triggerToast('Opening Google Calendar...', 'success', 2000)
}

// -------------------------------------------------------------
// Debugger Skip Navigation (Visible when lock is disabled)
// -------------------------------------------------------------
function jumpTo(step: 'lock' | 'q0' | 'q1' | 'q2' | 'suspense' | 'serious' | 'success') {
  selectedAnswer.value = null
  devMoodOverride.value = null // Reset any manual override when jumping stages

  switch (step) {
    case 'lock':
      isUnlocked.value = false
      isLoadingSuspense.value = false
      isAccepted.value = false
      break
    case 'q0':
      isUnlocked.value = true
      currentQuestionIndex.value = 0
      isLoadingSuspense.value = false
      isAccepted.value = false
      break
    case 'q1':
      isUnlocked.value = true
      currentQuestionIndex.value = 1
      isLoadingSuspense.value = false
      isAccepted.value = false
      break
    case 'q2':
      isUnlocked.value = true
      currentQuestionIndex.value = 2
      isLoadingSuspense.value = false
      isAccepted.value = false
      break
    case 'suspense':
      isUnlocked.value = true
      currentQuestionIndex.value = questions.length - 1
      isLoadingSuspense.value = true
      isAccepted.value = false
      break
    case 'serious':
      isUnlocked.value = true
      currentQuestionIndex.value = questions.length
      isLoadingSuspense.value = false
      isAccepted.value = false
      yesScale.value = 1
      noButtonPosition.value = { x: 0, y: 0 }
      noDodgeCount.value = 0
      break
    case 'success':
      isUnlocked.value = true
      currentQuestionIndex.value = questions.length
      isLoadingSuspense.value = false
      isAccepted.value = true
      break
  }
}

function setAnimationPreview(mood: Expression | null) {
  devMoodOverride.value = mood
}
</script>

<template>
  <!-- Top Center Toaster -->
  <aside class="toast-container" aria-live="polite" aria-atomic="true">
    <Transition name="toast-slide">
      <div
        v-if="currentToast"
        :class="['toast', currentToast.type === 'success' ? 'toast--success' : 'toast--error']"
        role="status"
      >
        <span>{{ currentToast.text }}</span>
      </div>
    </Transition>
  </aside>

  <!-- Debugger Skip Toolbar (Active when IS_DEBUG_MODE is true) -->
  <nav v-if="IS_DEBUG_MODE" class="dev-toolbar" aria-label="Developer Debugger Navigation">
    <span class="dev-toolbar-title">Stage:</span>
    <button
      type="button"
      :class="['dev-toolbar-btn', !isUnlocked ? 'is-active' : '']"
      @click="jumpTo('lock')"
    >
      Lock
    </button>
    <button
      type="button"
      :class="['dev-toolbar-btn', isUnlocked && !isLoadingSuspense && !isAccepted && currentQuestionIndex === 0 ? 'is-active' : '']"
      @click="jumpTo('q0')"
    >
      Q1
    </button>
    <button
      type="button"
      :class="['dev-toolbar-btn', isUnlocked && !isLoadingSuspense && !isAccepted && currentQuestionIndex === 1 ? 'is-active' : '']"
      @click="jumpTo('q1')"
    >
      Q2
    </button>
    <button
      type="button"
      :class="['dev-toolbar-btn', isUnlocked && !isLoadingSuspense && !isAccepted && currentQuestionIndex === 2 ? 'is-active' : '']"
      @click="jumpTo('q2')"
    >
      Q3
    </button>
    <button
      type="button"
      :class="['dev-toolbar-btn', isUnlocked && isLoadingSuspense ? 'is-active' : '']"
      @click="jumpTo('suspense')"
    >
      Suspense
    </button>
    <button
      type="button"
      :class="['dev-toolbar-btn', isUnlocked && !isLoadingSuspense && !isAccepted && isSeriousQuestion ? 'is-active' : '']"
      @click="jumpTo('serious')"
    >
      Serious Q
    </button>
    <button
      type="button"
      :class="['dev-toolbar-btn', isUnlocked && isAccepted ? 'is-active' : '']"
      @click="jumpTo('success')"
    >
      Success
    </button>

    <span class="dev-toolbar-title" style="margin-left: 8px;">Anim:</span>
    <button
      type="button"
      :class="['dev-toolbar-btn', devMoodOverride === 'idle' ? 'is-active' : '']"
      @click="setAnimationPreview('idle')"
    >
      idle
    </button>
    <button
      type="button"
      :class="['dev-toolbar-btn', devMoodOverride === 'question' ? 'is-active' : '']"
      @click="setAnimationPreview('question')"
    >
      question
    </button>
    <button
      type="button"
      :class="['dev-toolbar-btn', devMoodOverride === 'rose' ? 'is-active' : '']"
      @click="setAnimationPreview('rose')"
    >
      rose
    </button>
    <button
      type="button"
      :class="['dev-toolbar-btn', devMoodOverride === 'sad' ? 'is-active' : '']"
      @click="setAnimationPreview('sad')"
    >
      sad
    </button>
    <button
      type="button"
      :class="['dev-toolbar-btn', devMoodOverride === 'happy' ? 'is-active' : '']"
      @click="setAnimationPreview('happy')"
    >
      happy
    </button>
    <button
      type="button"
      :class="['dev-toolbar-btn', devMoodOverride === 'jump' ? 'is-active' : '']"
      @click="setAnimationPreview('jump')"
    >
      jump
    </button>
    <button
      v-if="devMoodOverride !== null"
      type="button"
      class="dev-toolbar-btn"
      style="opacity: 0.7;"
      @click="setAnimationPreview(null)"
    >
      ✕ auto
    </button>
  </nav>

  <main class="layout-center" role="main">
    <div class="card-wrapper">
      <!-- Pixel Avatars sitting outside, directly above the card (shown after unlocking) -->
      <PixelAvatars
        v-if="isUnlocked || devMoodOverride !== null"
        :him-mood="avatarHimMood"
        :her-mood="avatarHerMood"
      />

      <!-- 1. Password Step (Shown only if locked) -->
      <section
        v-if="!isUnlocked"
        class="card auth-card"
        role="region"
        aria-labelledby="password-title"
      >
        <div>
          <h2 id="password-title">Enter Password</h2>
          <p id="password-instructions">Please enter the password to proceed</p>
        </div>

        <form
          class="auth-form"
          role="form"
          aria-label="Password entry"
          @submit.prevent="handlePasswordSubmit"
        >
          <label for="password-input" class="visually-hidden">Password</label>
          <input
            id="password-input"
            v-model="password"
            type="password"
            class="input"
            placeholder="Enter password"
            autocomplete="off"
            required
            aria-required="true"
            aria-describedby="password-instructions"
          />

          <p
            v-if="passwordError"
            style="color: var(--color-primary); font-size: var(--font-size-sm);"
            role="alert"
          >
            {{ passwordError }}
          </p>

          <button type="submit" class="btn" aria-label="Unlock application">
            Unlock
          </button>
        </form>
      </section>

      <!-- 2. Serious Question Accepted / Google Calendar Anniversary Screen -->
      <section
        v-else-if="isAccepted"
        class="card auth-card"
        role="region"
        aria-labelledby="success-title"
      >
        <div>
          <h1 id="success-title">{{ seriousQuestion.successTitle }}</h1>
          <p>{{ seriousQuestion.successMessage }}</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--spacing-sm, 0.5rem); margin-block-start: var(--spacing-sm, 0.5rem);">
          <label
            for="anniversary-date"
            style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text-muted);"
          >
            {{ calendarConfig.dateLabel }}
          </label>

          <!-- Disabled, non-editable date input with accurate local date -->
          <input
            id="anniversary-date"
            type="date"
            class="input"
            :value="anniversaryDate"
            disabled
            readonly
          />

          <!-- Connect directly to Google Calendar -->
          <button
            type="button"
            class="btn btn--google"
            style="margin-top: 0.5rem;"
            @click="handleAddToGoogleCalendar"
          >
            {{ calendarConfig.buttonText }}
          </button>
        </div>
      </section>

      <!-- 3. Suspense Loading Stage (Before Serious Question) -->
      <section
        v-else-if="isLoadingSuspense"
        class="card auth-card"
        role="region"
        aria-labelledby="suspense-title"
      >
        <div class="suspense-loader">
          <h2 id="suspense-title">Loading...</h2>
          <p>Preparing the final question</p>
          <div class="suspense-dots" aria-hidden="true">
            <div class="suspense-dot"></div>
            <div class="suspense-dot"></div>
            <div class="suspense-dot"></div>
          </div>
        </div>
      </section>

      <!-- 4. Final Step: Serious Question (Yes / Moving No) -->
      <section
        v-else-if="isSeriousQuestion"
        class="card auth-card"
        role="region"
        aria-labelledby="serious-title"
      >
        <div>
          <span class="question-progress">Final Question</span>
          <h2 id="serious-title" style="margin-top: 0.25rem;">
            {{ seriousQuestion.title }}
          </h2>
          <p style="font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); margin-top: 0.5rem;">
            {{ seriousQuestion.question }}
          </p>
        </div>

        <div class="serious-actions">
          <!-- Growing Yes Button with High-Contrast White Border -->
          <button
            type="button"
            class="btn btn-yes"
            :style="{ transform: `scale(${yesScale})` }"
            @click="handleYesClick"
          >
            {{ seriousQuestion.yesText }}
          </button>

          <!-- Dodging No Button (Always on top) -->
          <button
            type="button"
            class="btn btn--outline btn-no"
            :style="{
              transform: `translate(${noButtonPosition.x}px, ${noButtonPosition.y}px)`,
            }"
            @mouseenter="handleNoDodge"
            @touchstart.passive="handleNoDodge"
            @focus="handleNoDodge"
          >
            {{ seriousQuestion.noText }}
          </button>
        </div>
      </section>

      <!-- 5. Questionnaire Steps (Questions 1 to 3) -->
      <section
        v-else-if="currentQuestion"
        class="card auth-card"
        role="region"
        :aria-labelledby="`question-${currentQuestionIndex + 1}-title`"
      >
        <div>
          <span class="question-progress">
            Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
          </span>
          <h2 :id="`question-${currentQuestionIndex + 1}-title`" style="margin-top: 0.25rem;">
            {{ currentQuestion.question }}
          </h2>
        </div>

        <div class="question-options" role="group" aria-label="Answer options">
          <button
            v-for="(option, idx) in currentQuestion.options"
            :key="idx"
            type="button"
            class="question-option-btn"
            :class="{
              'is-correct': selectedAnswer === idx && idx === currentQuestion.correctAnswerIndex,
              'is-wrong': selectedAnswer === idx && idx !== currentQuestion.correctAnswerIndex,
            }"
            :disabled="selectedAnswer !== null"
            @click="handleSelectOption(idx)"
          >
            {{ option }}
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
/* Toast Animation Transitions */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { questions as rawQuestions } from './data/questions'
import { seriousQuestion } from './data/serious-question'
import { calendarConfig } from './data/calendar'
import { APP_PASSWORD, IS_DEBUG_MODE } from './data/password'
import PixelAvatars, { type Expression } from './components/PixelAvatars.vue'
import PostAcceptance from './components/PostAcceptance.vue'

// Local Timezone Date Formatter (YYYY-MM-DD)
function getLocalDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Shuffle an array in-place (Fisher-Yates) and return it
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Shuffle question order (except last) and each question's options — runs once on load
function prepareQuestions(raw: typeof rawQuestions) {
  // Shuffle options for every question except the last (serious) one
  const prepared = raw.map((q, idx) => {
    if (idx === raw.length - 1) return q
    const correctOption = q.options[q.correctAnswerIndex]
    const shuffledOptions = shuffle([...q.options])
    return {
      ...q,
      options: shuffledOptions,
      correctAnswerIndex: shuffledOptions.indexOf(correctOption),
    }
  })
  // Shuffle question order, keeping the last one at the end
  const last = prepared[prepared.length - 1]
  const rest = shuffle(prepared.slice(0, -1))
  return [...rest, last]
}

const questions = prepareQuestions(rawQuestions)

// App State
const isUnlocked = ref(IS_DEBUG_MODE)
const password = ref('')


// Questionnaire State
const currentQuestionIndex = ref(0)
const selectedAnswer = ref<number | null>(null)
const isLoadingSuspense = ref(false)

const currentQuestion = computed(() => {
  return questions[currentQuestionIndex.value] ?? null
})

// Serious Question State
const isSeriousQuestion = computed(
  () => currentQuestionIndex.value >= questions.length && !isLoadingSuspense.value,
)
const isAccepted = ref(false)
const isNoScreen = ref(false)
const yesScale = ref(1)
const noButtonPosition = ref({ x: 0, y: 0 })
const noDodgeCount = ref(0)

// Optional Manual Animation Preview Override for Dev
const devMoodOverride = ref<Expression | null>(null)

// Transient flash when a correct answer is selected
const isCorrectFlash = ref(false)
// Transient flash when a wrong answer is selected
const isWrongFlash = ref(false)

// Sequenced animation after YES is pressed:
// pause → him-rose (him holds rose, her waits) → her-kiss (her blows kiss)
type AcceptedStep = 'pause' | 'him-rose' | 'her-kiss'
const acceptedStep = ref<AcceptedStep>('pause')
let acceptedTimers: ReturnType<typeof setTimeout>[] = []

function startAcceptedSequence() {
  acceptedTimers.forEach(clearTimeout)
  acceptedTimers = []
  acceptedStep.value = 'pause'

  const t1 = setTimeout(() => {
    acceptedStep.value = 'him-rose' // him gives rose; her switches to waiting
    const t2 = setTimeout(() => {
      acceptedStep.value = 'her-kiss' // her blows a kiss
    }, 1500) // matches play-3-once 1.5s duration
    acceptedTimers.push(t2)
  }, 800)
  acceptedTimers.push(t1)
}

// Dynamic Pixel Avatar Moods
const avatarHimMood = computed<Expression>(() => {
  if (devMoodOverride.value) return devMoodOverride.value
  if (isCorrectFlash.value) return 'happy' // him celebrates correct with happy
  if (isWrongFlash.value) return 'question'
  if (isAccepted.value) {
    // pause: both jump; him-rose: him holds rose (frozen on last frame); her-kiss: him stays
    return acceptedStep.value === 'pause' ? 'jump' : 'rose'
  }
  if (isNoScreen.value) return 'sad'
  if (isLoadingSuspense.value) return 'question'
  if (isSeriousQuestion.value) {
    return noDodgeCount.value > 0 ? 'sad' : 'idle'
  }
  return 'idle'
})

const avatarHerMood = computed<Expression>(() => {
  if (devMoodOverride.value) return devMoodOverride.value
  if (isCorrectFlash.value) return 'jump'
  if (isWrongFlash.value) return 'question'
  if (isAccepted.value) {
    if (acceptedStep.value === 'pause') return 'jump' // brief jump
    if (acceptedStep.value === 'him-rose') return 'question' // waiting while him gives rose
    return 'rose' // blow-kiss
  }
  if (isNoScreen.value) return 'sad' // no
  if (isLoadingSuspense.value) return 'question'
  if (isSeriousQuestion.value) {
    return noDodgeCount.value > 0 ? 'sad' : 'idle'
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
    triggerToast('Unlocked! Welcome', 'success')
  } else {
    triggerToast('Incorrect password!', 'error')
  }
}

function handleSelectOption(index: number) {
  selectedAnswer.value = index
  const currentQ = currentQuestion.value
  if (!currentQ) return

  if (index === currentQ.correctAnswerIndex) {
    triggerToast('Correct!', 'success', 1500)
    isCorrectFlash.value = true

    const isLastQuestion = currentQuestionIndex.value === questions.length - 1

    setTimeout(() => {
      selectedAnswer.value = null
      isCorrectFlash.value = false

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
    }, 900) // longer delay so the jump animation is visible
  } else {
    triggerToast('Incorrect, try again.', 'error', 1500)
    isWrongFlash.value = true
    setTimeout(() => {
      selectedAnswer.value = null
      isWrongFlash.value = false
    }, 800)
  }
}

function handleNoDodge() {
  noDodgeCount.value++

  if (noDodgeCount.value >= 20) {
    isNoScreen.value = true
    return
  }

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
  startAcceptedSequence()
}

function handleNoScreenYes() {
  isNoScreen.value = false
  handleYesClick()
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
      isNoScreen.value = false
      yesScale.value = 1
      noButtonPosition.value = { x: 0, y: 0 }
      noDodgeCount.value = 0
      break
    case 'success':
      isUnlocked.value = true
      currentQuestionIndex.value = questions.length
      isLoadingSuspense.value = false
      isAccepted.value = true
      startAcceptedSequence()
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
      :class="[
        'dev-toolbar-btn',
        isUnlocked && !isLoadingSuspense && !isAccepted && currentQuestionIndex === 0
          ? 'is-active'
          : '',
      ]"
      @click="jumpTo('q0')"
    >
      Q1
    </button>
    <button
      type="button"
      :class="[
        'dev-toolbar-btn',
        isUnlocked && !isLoadingSuspense && !isAccepted && currentQuestionIndex === 1
          ? 'is-active'
          : '',
      ]"
      @click="jumpTo('q1')"
    >
      Q2
    </button>
    <button
      type="button"
      :class="[
        'dev-toolbar-btn',
        isUnlocked && !isLoadingSuspense && !isAccepted && currentQuestionIndex === 2
          ? 'is-active'
          : '',
      ]"
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
      :class="[
        'dev-toolbar-btn',
        isUnlocked && !isLoadingSuspense && !isAccepted && isSeriousQuestion ? 'is-active' : '',
      ]"
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

    <span class="dev-toolbar-title" style="margin-left: 8px">Anim:</span>
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
      style="opacity: 0.7"
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


          <button type="submit" class="btn" aria-label="Unlock application">Unlock</button>
        </form>
      </section>

      <!-- 2. No Screen (Shown after 20 dodge attempts) -->
      <section
        v-else-if="isNoScreen"
        class="card auth-card no-screen"
        role="region"
        aria-labelledby="no-screen-title"
      >
        <div>
          <h2 id="no-screen-title">{{ seriousQuestion.noScreenTitle }}</h2>
          <div v-html="seriousQuestion.noScreenMessage" class="no-screen-body"></div>
        </div>

        <button
          type="button"
          class="btn btn-yes"
          style="margin-top: 1rem"
          @click="handleNoScreenYes"
        >
          Wait... actually YES!
        </button>
      </section>

      <!-- 3. Serious Question Accepted / Post-Acceptance Screen -->
      <section
        v-else-if="isAccepted"
        class="card auth-card"
        role="region"
        aria-labelledby="success-title"
      >
        <!-- Full post-acceptance content (badge, perks, stats, note, WhatsApp CTA) -->
        <PostAcceptance />

        <!-- Google Calendar anniversary block -->
        <div class="calendar-block">
          <label
            for="anniversary-date"
            style="
              font-size: var(--font-size-sm);
              font-weight: var(--font-weight-medium);
              color: var(--color-text-muted);
            "
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
          <button type="button" class="btn btn--google" @click="handleAddToGoogleCalendar">
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
          <h2 id="serious-title" class="visually-hidden">Final Question</h2>
          <p
            style="
              font-size: var(--font-size-lg);
              font-weight: var(--font-weight-semibold);
              margin-top: 0.5rem;
            "
          >
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
          <h3 :id="`question-${currentQuestionIndex + 1}-title`" style="margin-top: 0.25rem">
            {{ currentQuestion.question }}
          </h3>
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
/* Calendar block below PostAcceptance */
.calendar-block {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 0.5rem);
  padding-top: var(--spacing-md, 1rem);
  border-top: 1px solid var(--color-border);
  width: 100%;
  text-align: center;
}

/* No Screen */
.no-screen {
  animation: no-screen-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.no-screen-body {
  margin-top: 0.75rem;
  line-height: 1.7;
  opacity: 0.85;
}

.no-screen-body p + p {
  margin-top: 0.5rem;
}

@keyframes no-screen-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

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

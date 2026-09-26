export interface PostAcceptancePerk {
  icon: string
  text: string
}

export interface PostAcceptanceStat {
  label: string
  value: string
}

export interface PostAcceptanceConfig {
  /** Pill badge above the heading */
  statusBadge: string
  /** Main heading */
  heading: string
  /** Terms intro line */
  termsIntro: string
  /** Funny / flirty perks list */
  perks: PostAcceptancePerk[]
  /** Fine-print clause */
  clause: string
  /** Behind-the-scenes stats */
  stats: PostAcceptanceStat[]
  /** Label for the stats box */
  statsLabel: string
  /** Serious romantic note (supports HTML) */
  romanticNote: string
  /** WhatsApp CTA button label */
  whatsappLabel: string
  /** Pre-filled WhatsApp URL */
  whatsappUrl: string
  /** Tab title shown when the tab is active (post-acceptance) */
  tabTitleActive: string
  /** Tab title shown when the tab is hidden (she switched away) */
  tabTitleHidden: string
}

export const postAcceptanceConfig: PostAcceptanceConfig = {
  statusBadge: 'OFFICIALLY TAKEN',
  heading: 'Confirmation Receipt',
  termsIntro: 'No returns or refunds accepted. The following perks are now permanently unlocked:',

  perks: [
    { icon: '-', text: 'Best compliments' },
    { icon: '-', text: 'Hoodie theft privileges (unlimited)' },
    { icon: '-', text: 'Late-night food run co-pilot' },
    { icon: '-', text: 'Unlimited forehead kisses, on demand' },
  ],

  clause: "Clause — You always talk to me about what's on your mind.",

  statsLabel: 'Behind The Scenes',
  stats: [
    { label: 'Heartbeats / min while waiting', value: '180 bpm' },
    { label: "Probability I'm smiling right now", value: '100%' },
  ],

  romanticNote:
    "I've wanted to call you mine for longer than I've admitted. You make everything better — the boring parts, the hard parts, all of it. I'm so genuinely excited to get to do this with you. <span aria-hidden=\"true\">❤️</span>",

  whatsappLabel: 'Send a selfie here',
  whatsappUrl: 'https://wa.me/306907747554?text=I%20am%20finally%20your%20girlfriend',

  tabTitleActive: "You're stuck with me now ❤️",
  tabTitleHidden: 'Hey, come back! 👀',
}

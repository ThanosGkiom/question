export interface SeriousQuestionConfig {
  question: string
  yesText: string
  noText: string
  successTitle: string
  successMessage: string
  noScreenTitle: string
  noScreenMessage: string
}

export const seriousQuestion: SeriousQuestionConfig = {
  question: 'Will you be my girlfriend?',
  yesText: 'Yurr',
  noText: 'no.',
  successTitle: "You're my everything!",
  successMessage:
    '<p>I’ve been wanting to call you my girlfriend since <br> <b>"It takes two"</b>. <3 </p>',
  noScreenTitle: "Wait... let's rethink this.",
  noScreenMessage:
    '<p>But just so you know... the YES button was always right there 🥺</p><p>If you ever change your mind, you know where to find me.</p>',
}

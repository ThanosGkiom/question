export interface SeriousQuestionConfig {
  title: string
  question: string
  yesText: string
  noText: string
  successTitle: string
  successMessage: string
}

export const seriousQuestion: SeriousQuestionConfig = {
  title: 'SERIOUS QUESTION',
  question: 'Will you be my Valentine?',
  yesText: 'Yes!',
  noText: 'No',
  successTitle: 'Success!',
  successMessage: 'You made the right choice.',
}

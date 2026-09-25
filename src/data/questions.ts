export interface Question {
  id: number
  question: string
  options: string[]
  /**
   * 0-based index of the correct option in the `options` array
   */
  correctAnswerIndex: number
}

export const questions: Question[] = [
  {
    id: 1,
    question: 'Question 1 goes here?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswerIndex: 0,
  },
  {
    id: 2,
    question: 'Question 2 goes here?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswerIndex: 1,
  },
  {
    id: 3,
    question: 'Question 3 goes here?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswerIndex: 2,
  },
]

export interface Question {
  question: string
  options: string[]
  /**
   * 0-based index of the correct option in the `options` array
   */
  correctAnswerIndex: number
}

export const questions: Question[] = [
  // --- Zainab's Questions ---
  {
    question: "What are the names of Zainab's cats?",
    options: ['Bella & Oliver', 'Luna & Milo', 'Cleo & Simi', 'Angel & Soni'],
    correctAnswerIndex: 3,
  },
  {
    question: 'Which dream car would Zainab never say no to?',
    options: ['Mercedes-AMG GT', 'BMW M4 Competition', 'Porsche 911 GT3 RS', 'Audi R8 V10'],
    correctAnswerIndex: 2,
  },
  {
    question: "What is Zainab's absolute favorite color?",
    options: ['Blue', 'Orange', 'Purple', 'Red'],
    correctAnswerIndex: 3,
  },
  {
    question: "Which artist tops Zainab's playlist?",
    options: ['Doja Cat', 'Beyoncé', 'SZA', 'Rihanna'],
    correctAnswerIndex: 3,
  },
  {
    question: 'How does Zainab like her coffee prepared?',
    options: [
      'Black Americano with two sugars',
      'Iced matcha latte with almond milk',
      'Caramel macchiato with extra whipped cream',
      'Espresso shot with oat milk and French Vanilla syrup',
    ],
    correctAnswerIndex: 3,
  },
  {
    question: "What is Zainab's signature perfume scent?",
    options: [
      'Dior Hypnotic Poison',
      'Kayali Utopia / Oudgasm',
      'Maison Margiela Replica Jazz Club',
      'YSL Black Opium',
    ],
    correctAnswerIndex: 1,
  },
  {
    question: "Which city is high on Zainab's travel list?",
    options: ['Budapest', 'Amsterdam', 'Vienna', 'Prague'],
    correctAnswerIndex: 3,
  },
  {
    question: "Who is Zainab's favorite football player and team?",
    options: [
      'Luka Modrić & Real Madrid',
      'Martin Ødegaard & Arsenal',
      'Bruno Fernandes & Manchester United',
      'Kevin De Bruyne & Manchester City',
    ],
    correctAnswerIndex: 2,
  },
  {
    question: "What is Zainab's all-time favorite TV universe to watch?",
    options: [
      'Stranger Things',
      'Breaking Bad / Better Call Saul',
      'Game of Thrones',
      'Peaky Blinders',
    ],
    correctAnswerIndex: 1,
  },
  {
    question: 'What is the non-negotiable rule before anyone can date Zainab?',
    options: [
      'Must beat her in a 1v1 on Valorant',
      'Needs approval from her friend',
      'Must guess her exact coffee order first try',
      'Has to pass her music playlist test',
    ],
    correctAnswerIndex: 1,
  },

  // --- Questions About You ---
  {
    question: 'What does Thanos do for a living?',
    options: [
      'Full-stack software developer',
      'Graphic designer',
      'Mechanical engineer',
      'Cybersecurity analyst',
    ],
    correctAnswerIndex: 0,
  },
  {
    question: 'Which sport/racing championship is Thanos obsessed with following?',
    options: ['MotoGP', 'Formula 1', 'WRC Rally', 'NASCAR'],
    correctAnswerIndex: 1,
  },
  {
    question: 'Which artists are you most likely to hear playing through my speakers?',
    options: [
      'Brent Faiyaz & PartyNextDoor',
      'The Weeknd & Post Malone',
      'Travis Scott & Playboi Carti',
      'Bruno Mars & Harry Styles',
    ],
    correctAnswerIndex: 0,
  },
  {
    question: 'What anime would Thanos recommend in a heartbeat?',
    options: ['Death Note', 'One Piece', 'My Hero Academia', 'Demon Slayer'],
    correctAnswerIndex: 0,
  },
  {
    question: "When is Thanos's birthday?",
    options: ['October 31st (Halloween)', 'December 25th', 'July 14th', 'April 1st'],
    correctAnswerIndex: 0,
  },
]

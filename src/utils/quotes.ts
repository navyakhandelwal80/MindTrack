import type { DailyQuote } from '../types';

export const MOTIVATIONAL_QUOTES: DailyQuote[] = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "Your exam score does not define your worth as a human. Keep breathing, keep trying, and do your best.",
    author: "MindTrack Wellness"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "Don't wish it were easier. Wish you were better. Build the habits, take the breaks, trust the process.",
    author: "Jim Rohn"
  },
  {
    text: "You don't have to see the whole staircase, just take the first step.",
    author: "Martin Luther King Jr."
  },
  {
    text: "Focus on progress, not perfection. A 1% improvement every day leads to massive results over time.",
    author: "James Clear"
  },
  {
    text: "Rest is not laziness. Your brain needs downtime to consolidate what you have studied. Take that break guilt-free.",
    author: "Cognitive Science"
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela"
  },
  {
    text: "Anxiety is the space between the present moment and the imagined future. Bring yourself back to now.",
    author: "Mindfulness Reminder"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    text: "Consistency is key. 4 focused study hours are infinitely better than 10 distracted, sleep-deprived hours.",
    author: "Study Skills Guide"
  },
  {
    text: "You are capable of doing hard things. Break them down, solve one line at a time.",
    author: "Student Support"
  }
];

export function getRandomQuote(): DailyQuote {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[randomIndex] ?? { text: 'Keep going. You are doing great.', author: 'MindTrack' };
}

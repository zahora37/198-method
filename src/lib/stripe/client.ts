import Stripe from 'stripe'

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-05-27.dahlia',
  })
}

export const PLANS = {
  pro: {
    name: 'Pro',
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      '168-Hour Calculator',
      'Weekly Planner',
      'Daily Planner',
      'Goals Tracker',
      'Habit Tracker',
      'Weekly Review',
      '100 Ask 168 questions per month',
    ],
  },
  premium: {
    name: 'Premium',
    price: 19,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    features: [
      'Everything in Pro',
      'AI Weekly Planning',
      'AI Goal-Setting Prompts',
      'AI Reflection Prompts',
      '300 Ask 168 questions per month',
    ],
  },
} as const

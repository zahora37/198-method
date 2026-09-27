import Stripe from 'stripe'

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-05-27.dahlia',
  })
}

export const PLANS = {
  pro: {
    name: 'Pro',
    price: 2.5,
    interval: 'week',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      '168-Hour Calculator',
      'Weekly Planner',
      'Daily Planner',
      'Goals Tracker',
      'Habit Tracker',
      'Weekly Review',
      '300 Ask 168 questions per month',
    ],
  },
} as const

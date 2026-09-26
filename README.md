This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### Ask 168

Apply `supabase/migrations/003_ask_168_quota.sql` in the Supabase SQL editor after the earlier migrations. This gives Pro 100 and Premium 300 questions per UTC calendar month. A request counts when Ask 168 begins processing it, including requests that fail after the allowance is claimed.

Set `ANTHROPIC_API_KEY` in the server environment before deploying. `ANTHROPIC_MODEL` is optional. Ask 168 is available to signed-in Pro and Premium accounts. It reads each user's Track items, time categories, and the next seven days of My 168 to answer questions. It does not change any saved data.

In Stripe, create active monthly USD prices of $9 for Pro and $19 for Premium. Set their Price IDs in `STRIPE_PRO_PRICE_ID` and `STRIPE_PREMIUM_PRICE_ID`. Checkout checks these prices before charging. The Stripe webhook sets each account's tier after purchase. Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` on the server as shown in `.env.local.example`.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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

Apply `supabase/migrations/003_ask_168_quota.sql`, then `supabase/migrations/004_free_ask_quota.sql`, in the Supabase SQL editor after the earlier migrations. Free accounts receive 10 Ask 168 questions and Pro accounts receive 300 questions per UTC calendar month. A question counts after Ask 168 returns a valid answer.

Set `ANTHROPIC_API_KEY` in the server environment before deploying. `ANTHROPIC_MODEL` is optional. Ask 168 is available to signed-in Free and Pro accounts. It reads each user's Track items and the next seven days of My 168. Reviewed PDF or image schedule suggestions can be added to My 168 from the Ask screen. `.ics` calendar exports are read directly in the browser, without an AI request; repeating events import the first occurrence for review.

In Stripe, create an active recurring USD price of $2.50 per week for Pro. Set its Price ID in `STRIPE_PRO_PRICE_ID`. Checkout checks this price before charging. Add a webhook endpoint at `/api/stripe/webhook` for `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`. Enable the customer portal for plan changes and cancellation. Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` on the server as shown in `.env.local.example`.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

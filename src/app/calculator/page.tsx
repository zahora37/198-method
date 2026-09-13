import CalculatorClient from './CalculatorClient'

// Checks Supabase auth on the client to load/save categories, so this
// route can no longer be statically prerendered at build time.
export const dynamic = 'force-dynamic'

export default function CalculatorPage() {
  return <CalculatorClient />
}

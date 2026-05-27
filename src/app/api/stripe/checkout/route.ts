import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe, hasStripe, STRIPE_PRICE_ID } from '@/lib/stripe'
import { getSiteUrl } from '@/lib/utils'

export const runtime = 'nodejs'

export async function POST() {
  if (!hasStripe()) {
    return NextResponse.json({ error: 'Paiement temporairement indisponible.' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id, subscription_status')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.subscription_status === 'active') {
    return NextResponse.json({ error: 'Tu es déjà abonné(e).' }, { status: 400 })
  }

  const stripe = getStripe()

  // Client Stripe (réutilisé s'il existe déjà)
  let customerId = profile?.stripe_customer_id ?? undefined
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    })
    customerId = customer.id
    await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const base = getSiteUrl()
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${base}/compte?sub=success`,
    cancel_url: `${base}/abonnement?sub=cancel`,
    allow_promotion_codes: true,
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } },
  })

  return NextResponse.json({ url: session.url })
}

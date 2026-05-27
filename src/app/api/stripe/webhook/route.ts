import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!process.env.STRIPE_SECRET_KEY || !secret) {
    // Stripe non configuré → on accuse réception sans rien faire.
    return NextResponse.json({ received: true })
  }

  const stripe = getStripe()
  const sig = req.headers.get('stripe-signature') ?? ''
  const raw = await req.text() // corps BRUT requis pour la vérif de signature

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret)
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const admin = createAdminClient()
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session
        const userId = s.metadata?.user_id
        const customerId = typeof s.customer === 'string' ? s.customer : s.customer?.id ?? null
        const subId = typeof s.subscription === 'string' ? s.subscription : s.subscription?.id ?? null
        if (userId) {
          await admin.from('profiles').update({
            subscription_status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subId,
          }).eq('id', userId)
        } else if (customerId) {
          await admin.from('profiles').update({
            subscription_status: 'active',
            stripe_subscription_id: subId,
          }).eq('stripe_customer_id', customerId)
        }
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const active = sub.status === 'active' || sub.status === 'trialing'
        await admin.from('profiles').update({
          subscription_status: active ? 'active' : 'free',
          stripe_subscription_id: sub.id,
        }).eq('stripe_customer_id', sub.customer as string)
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await admin.from('profiles').update({
          subscription_status: 'free',
        }).eq('stripe_customer_id', sub.customer as string)
        break
      }
    }
  } catch (e) {
    console.error('[stripe/webhook]', e)
    return NextResponse.json({ error: 'Erreur de traitement' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

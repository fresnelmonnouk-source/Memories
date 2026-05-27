import Stripe from 'stripe'

let _stripe: Stripe | null = null

/** Client Stripe paresseux (instancié au 1er usage, pas au chargement du module). */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY missing in env')
  }
  if (!_stripe) {
    // apiVersion omise → version par défaut épinglée par le SDK / le compte.
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return _stripe
}

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID

/** Le paiement n'est proposé que si la clé ET le prix sont configurés. */
export function hasStripe(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_ID
}

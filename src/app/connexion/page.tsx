import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Connexion — Memories°',
  robots: { index: false },
}

export default function ConnexionPage() {
  // LoginForm lit ?next= via useSearchParams → Suspense requis.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

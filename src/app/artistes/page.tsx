import { redirect } from 'next/navigation'

// La page Artistes a été fusionnée dans « L'atelier » (/a-propos#artistes).
export default function ArtistesRedirect() {
  redirect('/a-propos#artistes')
}

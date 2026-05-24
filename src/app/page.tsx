import { Hero } from '@/components/home/Hero'
import { Manifesto } from '@/components/home/Manifesto'
import { TryonTeaser } from '@/components/home/TryonTeaser'
import { Process } from '@/components/home/Process'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <TryonTeaser />
      <Process />
    </>
  )
}

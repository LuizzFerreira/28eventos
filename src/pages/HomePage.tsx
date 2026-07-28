import { HeroSection } from '@/components/home/HeroSection'
import { AboutSection } from '@/components/home/AboutSection'
import { ServicesSection } from '@/components/home/ServicesSection'
import { GallerySection, TestimonialsSection } from '@/components/home/TestimonialsSection'
import { FAQSection, ContactSection } from '@/components/home/FAQSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <GallerySection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
    </>
  )
}

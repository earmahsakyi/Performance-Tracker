import React from 'react';
import { DashboardPreview } from '../layout/DashboardPreview';
import Header from '../layout/Header';
import { FeaturesSection } from '../layout/FeaturedSection';
import { Footer } from '../layout/Footer';
import { HeroSection } from '../layout/HeroSection';
import { TestimonialsSection } from '../layout/TestimonialSection';

const LandingPage = () => {
  return (
   <div className="min-h-screen bg-background font-inter">
      <main>
        <Header />
        <HeroSection />
        <FeaturesSection />
        <DashboardPreview />
        <TestimonialsSection />  
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage

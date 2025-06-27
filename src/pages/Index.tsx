
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Gallery from '@/components/Gallery';
import OrderForm from '@/components/OrderForm';
import Contact from '@/components/Contact';
import WhatsAppButton from '@/components/WhatsAppButton';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <Gallery />
      <OrderForm />
      <Contact />
      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default Index;

'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function RoomsPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/rooms`);
        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  return (
    <main className="bg-brand-white text-brand-blue overflow-x-hidden">
      {/* Hero Section with Pattern */}
      <section className="relative px-6 pt-16 pb-12 overflow-hidden">
        {/* Subtle pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23011478' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="mx-auto max-w-5xl text-center relative">
          <h1 
            className={`text-4xl font-script text-brand-blue md:text-5xl lg:text-6xl transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Our Rooms & Spaces
          </h1>
          <p 
            className={`mx-auto mt-6 max-w-2xl text-base leading-8 text-brand-blue/70 sm:text-lg transition-all duration-700 delay-150 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            A hotel-inspired vacation rental in Amadeo, Cavite — thoughtfully designed spaces where every detail is curated for comfort, style, and a truly restful escape.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-2">
          <GoldRoomCard delay={0} room={rooms.find(r => r.id === 1)} />
          <BlueRoomCard delay={100} room={rooms.find(r => r.id === 2)} />
        </div>

        <div className="mx-auto mt-10 max-w-7xl grid gap-8 lg:grid-cols-2">
          <RooftopCard delay={200} room={rooms.find(r => r.id === 3)} />
          <ReceptionCard delay={300} />
        </div>

        {/* CTA Section with Animation */}
        <div 
          className={`mx-auto mt-16 rounded-[32px] bg-gradient-to-br from-[#f3f6fb] to-[#e8eef8] px-8 py-12 text-center shadow-lg shadow-brand-blue/5 md:px-12 relative overflow-hidden transition-all duration-700 ease-out hover:shadow-xl hover:shadow-brand-blue/10 hover:-translate-y-1 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-brand-blue/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <h2 className="text-4xl font-script text-brand-blue md:text-5xl">
              Need Help Choosing?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-brand-blue/70 sm:text-lg">
              Our team is here to help you find the perfect accommodation for your stay. Contact us for personalized recommendations.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="tel:+639278584938"
                className="group inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-300 px-6 py-3 text-sm font-semibold text-brand-blue transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:-translate-y-0.5 active:scale-95"
              >
                <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us
              </a>
              <a
                href="/faqs"
                className="group inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-brand-white transition-all duration-300 hover:bg-[#001a72] hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              >
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View FAQs
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function GoldRoomCard({ delay = 0, room }: { delay?: number; room?: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const totalImages = 15;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const price = room?.price || 4800;

  return (
    <article 
      className="group overflow-hidden rounded-[32px] border border-brand-blue/10 bg-brand-white shadow-md shadow-brand-blue/5 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-brand-blue/10 hover:-translate-y-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div 
        className="relative h-80 overflow-hidden bg-slate-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          key={currentIndex}
          src={`/img/gold-room/gold${currentIndex + 1}.jpg`}
          alt="Gold Room"
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={currentIndex === 0}
          loading={currentIndex === 0 ? 'eager' : 'lazy'}
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-accent to-accent-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-blue shadow-lg">
          Gold Room
        </span>
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-brand-blue/80 hover:bg-brand-blue p-3 text-brand-white transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
          aria-label="Previous image"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-brand-blue/80 hover:bg-brand-blue p-3 text-brand-white transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
          aria-label="Next image"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-brand-white bg-brand-blue/70 backdrop-blur-sm px-4 py-1.5 rounded-full">
          {currentIndex + 1} / {totalImages}
        </div>
      </div>
      <div className="space-y-6 p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-blue/60">Starts at ₱{price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/night</p>
        </div>
        <div className="grid gap-2 text-sm text-brand-blue/70 sm:grid-cols-2">
          <div className="space-y-2">
            <p>50 SQM with balcony</p>
            <p>Ideal for 2 guests</p>
            <p>1 King size bed</p>
            <p>1 Bathroom</p>
            <p>4-Seater Dining Table</p>
            <p>Kitchen cabinet with sink</p>
            <p>Personal Ref</p>
          </div>
          <div className="space-y-2">
            <p>Air conditioning and WiFi</p>
            <p>55&quot; Smart TV with Bluetooth Speaker</p>
            <p>Toiletries, towels, and bathrobe</p>
            <p>Contemporary artwork</p>
            <p>Parking space</p>
            <p>Board Games</p>
            <p>Free Breakfast for Two (2)</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-brand-blue/10">
          <a
            href="/book-now?roomId=1"
            className="group/btn inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-brand-white transition-all duration-300 hover:bg-[#001a72] hover:shadow-lg hover:shadow-brand-blue/20 hover:-translate-y-0.5 active:scale-95"
          >
            Book Now
            <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

function BlueRoomCard({ delay = 0, room }: { delay?: number; room?: any }) {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [isHovered, setIsHovered] = useState(false);
  const totalImages = 13;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const price = room?.price || 5300;

  return (
    <article 
      className="group overflow-hidden rounded-[32px] border border-brand-blue/10 bg-brand-white shadow-md shadow-brand-blue/5 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-brand-blue/10 hover:-translate-y-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div 
        className="relative h-80 overflow-hidden bg-slate-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          key={currentIndex}
          src={`/img/blue-room/blue${currentIndex + 1}.jpg`}
          alt="Blue Room"
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={currentIndex === 0}
          loading={currentIndex === 0 ? 'eager' : 'lazy'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-accent to-accent-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-blue shadow-lg">
          Blue Room
        </span>
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-brand-blue/80 hover:bg-brand-blue p-3 text-brand-white transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
          aria-label="Previous image"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-brand-blue/80 hover:bg-brand-blue p-3 text-brand-white transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
          aria-label="Next image"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-brand-white bg-brand-blue/70 backdrop-blur-sm px-4 py-1.5 rounded-full">
          {currentIndex + 1} / {totalImages}
        </div>
      </div>
      <div className="space-y-6 p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-blue/60">Starts at ₱{price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/night</p>
        </div>
        <div className="grid gap-2 text-sm text-brand-blue/70 sm:grid-cols-2">
          <div className="space-y-2">
            <p>50 SQM with balcony</p>
            <p>Ideal for 4 guests</p>
            <p>2 Queen size beds</p>
            <p>1 Bathroom</p>
            <p>6-Seater Dining Table</p>
            <p>Kitchen cabinet with sink</p>
            <p>Personal Ref</p>
          </div>
          <div className="space-y-2">
            <p>Air conditioning and WiFi</p>
            <p>55&quot; Smart TV with Bluetooth speaker</p>
            <p>Toiletries, towels, and bathrobe</p>
            <p>Contemporary artwork</p>
            <p>Parking space</p>
            <p>Board Games</p>
            <p>Free Breakfast for Two (2)</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-brand-blue/10">
          <a
            href="/book-now?roomId=2"
            className="group/btn inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-brand-white transition-all duration-300 hover:bg-[#001a72] hover:shadow-lg hover:shadow-brand-blue/20 hover:-translate-y-0.5 active:scale-95"
          >
            Book Now
            <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

function RooftopCard({ delay = 0, room }: { delay?: number; room?: any }) {
  const [currentIndex, setCurrentIndex] = useState(4);
  const [isHovered, setIsHovered] = useState(false);
  const totalImages = 13;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const price = room?.price || 8000;
  const weekendPrice = room?.weekend_price || 10000;
  const price6hr = room?.price_6hr || 4000;
  const weekendPrice6hr = room?.weekend_price_6hr || 5000;

  return (
    <article 
      className="group overflow-hidden rounded-[32px] border border-brand-blue/10 bg-brand-white shadow-md shadow-brand-blue/5 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-brand-blue/10 hover:-translate-y-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div 
        className="relative h-80 overflow-hidden bg-slate-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          key={currentIndex}
          src={`/img/rooftop/rooftop${currentIndex + 1}.jpg`}
          alt="Rooftop Lounge"
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={currentIndex === 0}
          loading={currentIndex === 0 ? 'eager' : 'lazy'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-accent to-accent-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-blue shadow-lg">
          Event Space
        </span>
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-brand-blue/80 hover:bg-brand-blue p-3 text-brand-white transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
          aria-label="Previous image"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-brand-blue/80 hover:bg-brand-blue p-3 text-brand-white transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
          aria-label="Next image"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-brand-white bg-brand-blue/70 backdrop-blur-sm px-4 py-1.5 rounded-full">
          {currentIndex + 1} / {totalImages}
        </div>
      </div>
      <div className="space-y-6 p-8">
        <div>
          <h2 className="text-3xl font-semibold text-brand-blue">Rooftop Lounge</h2>
          <div className="mt-3 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue/50">Pricing</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span className="text-brand-blue">Starts at <span className="font-bold">₱{price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> / 12 hrs</span>
            </div>
          </div>
        </div>
        <p className="text-brand-blue/70">
          This 150SQM exclusive space is ideal for 15-20 guests, perfect for general hangouts or slow mornings with the cool Amadeo-Tagaytay breeze.
        </p>
        <div className="grid gap-2 text-sm text-brand-blue/70 sm:grid-cols-2">
          <div className="space-y-2">
            <p>150 SQM</p>
            <p>Outdoor and indoor seating</p>
            <p>Bar counter</p>
            <p>Dining table setup</p>
          </div>
          <div className="space-y-2">
            <p>Air conditioning and WiFi</p>
            <p>65&quot; Smart TV with Bluetooth speaker</p>
            <p>Microphone for Karaoke - available upon request</p>
            <p>Contemporary artwork</p>
            <p>Hot and Cold Water Dispenser</p>
            <p>Microwave</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-brand-blue/10">
          <a
            href="/book-now?roomId=3"
            className="group/btn inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-brand-white transition-all duration-300 hover:bg-[#001a72] hover:shadow-lg hover:shadow-brand-blue/20 hover:-translate-y-0.5 active:scale-95"
          >
            Book Now
            <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

function ReceptionCard({ delay = 0 }: { delay?: number }) {
  return (
    <article 
      className="group overflow-hidden rounded-[32px] border border-brand-blue/10 bg-brand-white shadow-md shadow-brand-blue/5 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-brand-blue/10 hover:-translate-y-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative h-80 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center transition-transform duration-500 group-hover:scale-105">
          <svg className="w-12 h-12 mx-auto text-brand-blue/30 mb-3 transition-colors duration-300 group-hover:text-brand-blue/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-brand-blue/50 font-medium text-sm">Images coming soon</span>
        </div>
        <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-accent to-accent-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-blue shadow-lg">
          Common Area
        </span>
      </div>
      <div className="space-y-6 p-8">
        <div>
          <h2 className="text-3xl font-semibold text-brand-blue">Reception Area</h2>
        </div>
        <p className="text-brand-blue/70">
          Information and pictures of our reception area will be added here soon.
        </p>
      </div>
    </article>
  );
}

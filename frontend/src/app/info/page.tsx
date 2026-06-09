'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function InfoPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="bg-brand-white text-brand-blue overflow-x-hidden">
      <section className="relative px-6 pt-16 pb-16 overflow-hidden">
        {/* Subtle pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23011478' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="mx-auto max-w-5xl text-center relative">
          <p 
            className={`text-4xl font-script text-brand-blue md:text-5xl lg:text-6xl transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Hotel at Home
          </p>
          <p 
            className={`mx-auto mt-6 max-w-2xl text-base leading-8 text-brand-blue/70 sm:text-lg transition-all duration-700 delay-150 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            A Mediterranean-inspired boutique stay in the heart of Amadeo, Cavite
          </p>
        </div>

        <div 
          className={`mx-auto mt-12 max-w-6xl overflow-hidden rounded-[40px] border border-brand-blue/10 bg-brand-white shadow-lg shadow-brand-blue/5 transition-all duration-700 delay-300 ease-out hover:shadow-xl hover:shadow-brand-blue/10 group ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="overflow-hidden relative h-[420px] sm:h-[520px]">
            <Image
              src="/img/blue-room/blue7.jpg"
              alt="Mediterranean boutique stay"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>
        </div>
      </section>

      <section className="bg-brand-white px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-brand-blue/60">Our Story</p>
            <h2 className="mt-4 text-3xl font-semibold text-brand-blue md:text-4xl">A warm retreat shaped by local hospitality and Mediterranean charm</h2>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-[32px] border border-brand-blue/10 bg-brand-white p-8 shadow-sm">
              <p className="text-base leading-8 text-brand-blue/70">
                Nestled in the charming town of Amadeo, Cavite, Hotel at Home was born from a dream to create a space where travelers could experience the warmth of Filipino hospitality combined with the elegance of Mediterranean design.
              </p>
              <p className="mt-6 text-base leading-8 text-brand-blue/70">
                Our boutique hotel features carefully curated rooms that blend comfort with style. Each space is designed to provide a peaceful retreat while keeping you connected to the vibrant culture and natural beauty of the region.
              </p>
            </div>

            <div className="rounded-[32px] border border-brand-blue/10 bg-brand-white p-8 shadow-sm">
              <p className="text-base leading-8 text-brand-blue/70">
                Located in Cavite’s coffee capital, we’re perfectly positioned for guests looking to explore the cooler climate and stunning views of nearby Tagaytay, while enjoying the authentic charm of a smaller town.
              </p>
              <p className="mt-6 text-base leading-8 text-brand-blue/70">
                Whether you’re here for a romantic getaway, a family vacation, or a peaceful solo retreat, Hotel at Home offers an experience that feels both luxurious and intimately personal.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-white px-6 pb-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-3xl font-script text-brand-blue md:text-4xl">What We Stand For</p>
        </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="group rounded-[28px] border border-brand-blue/10 bg-brand-white p-8 shadow-sm text-center transition-all duration-500 ease-out hover:shadow-lg hover:shadow-brand-blue/5 hover:-translate-y-2 cursor-default">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-300 text-brand-blue transition-transform duration-500 ease-out group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/30">
              <span className="text-2xl transition-transform duration-300 group-hover:rotate-12">♡</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-brand-blue">Hospitality</h3>
            <p className="mt-4 text-sm leading-7 text-brand-blue/70 transition-colors duration-300 group-hover:text-brand-blue/80">
              We treat every guest like family, ensuring a warm and welcoming experience.
            </p>
          </div>

          <div className="group rounded-[28px] border border-brand-blue/10 bg-brand-white p-8 shadow-sm text-center transition-all duration-500 ease-out hover:shadow-lg hover:shadow-brand-blue/5 hover:-translate-y-2 cursor-default">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-300 text-brand-blue transition-transform duration-500 ease-out group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/30">
              <span className="text-2xl transition-transform duration-300 group-hover:rotate-12">★</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-brand-blue">Excellence</h3>
            <p className="mt-4 text-sm leading-7 text-brand-blue/70 transition-colors duration-300 group-hover:text-brand-blue/80">
              Premium quality in every detail, from our rooms to our service.
            </p>
          </div>

          <div className="group rounded-[28px] border border-brand-blue/10 bg-brand-white p-8 shadow-sm text-center transition-all duration-500 ease-out hover:shadow-lg hover:shadow-brand-blue/5 hover:-translate-y-2 cursor-default">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-300 text-brand-blue transition-transform duration-500 ease-out group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/30">
              <span className="text-2xl transition-transform duration-300 group-hover:rotate-12">☺</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-brand-blue">Community</h3>
            <p className="mt-4 text-sm leading-7 text-brand-blue/70 transition-colors duration-300 group-hover:text-brand-blue/80">
              Supporting local artisans and showcasing the best of Cavite culture.
            </p>
          </div>

          <div className="group rounded-[28px] border border-brand-blue/10 bg-brand-white p-8 shadow-sm text-center transition-all duration-500 ease-out hover:shadow-lg hover:shadow-brand-blue/5 hover:-translate-y-2 cursor-default">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-300 text-brand-blue transition-transform duration-500 ease-out group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/30">
              <span className="text-2xl transition-transform duration-300 group-hover:rotate-12">📍</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-brand-blue">Location</h3>
            <p className="mt-4 text-sm leading-7 text-brand-blue/70 transition-colors duration-300 group-hover:text-brand-blue/80">
              Perfectly positioned for exploring Amadeo and nearby Tagaytay attractions.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-white px-6 pb-20">
        <div className="mx-auto max-w-6xl rounded-[40px] border border-brand-blue/10 bg-brand-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-brand-blue/60">House Rules</p>
              <h2 className="mt-4 text-3xl font-semibold text-brand-blue md:text-4xl">A calm, comfortable stay for every guest</h2>
            </div>
            <a
              href="/rules/rules.pdf"
              download="Hotel_at_Home_Rules.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-300 px-6 text-sm font-semibold text-brand-blue transition-all duration-300 hover:shadow-[0_0_15px_rgba(249,205,42,0.3)] hover:-translate-y-0.5 active:scale-95"
            >
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Rules
            </a>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="group rounded-[28px] border border-brand-blue/10 bg-brand-white p-6 transition-all duration-500 ease-out hover:shadow-lg hover:shadow-brand-blue/5 hover:-translate-y-1">
              <h3 className="text-base font-semibold text-brand-blue flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check-in & Check-out
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-brand-blue/70">
                <li className="transition-colors duration-300 group-hover:text-brand-blue/80">Check-in: 2:00 PM (Gold and Blue Rooms only)</li>
                <li className="transition-colors duration-300 group-hover:text-brand-blue/80">Check-out: 12:00 PM (Gold and Blue Rooms only)</li>
                <li className="transition-colors duration-300 group-hover:text-brand-blue/80">Rooftop Lounge: 12-hour booking stay depending on the available and chosen time.</li>
                <li className="transition-colors duration-300 group-hover:text-brand-blue/80">Late check-out subject to availability.</li>
              </ul>
            </div>

            <div className="group rounded-[28px] border border-brand-blue/10 bg-brand-white p-6 transition-all duration-500 ease-out hover:shadow-lg hover:shadow-brand-blue/5 hover:-translate-y-1">
              <h3 className="text-base font-semibold text-brand-blue flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                General Rules
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-brand-blue/70">
                <li className="transition-colors duration-300 group-hover:text-brand-blue/80">No smoking inside the rooms.</li>
                <li className="transition-colors duration-300 group-hover:text-brand-blue/80">No pets allowed.</li>
                <li className="transition-colors duration-300 group-hover:text-brand-blue/80">Respect quiet hours (10 PM – 7 AM).</li>
              </ul>
            </div>

            <div className="group rounded-[28px] border border-brand-blue/10 bg-brand-white p-6 transition-all duration-500 ease-out hover:shadow-lg hover:shadow-brand-blue/5 hover:-translate-y-1">
              <h3 className="text-base font-semibold text-brand-blue flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                </svg>
                Cancellation Policy
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-brand-blue/70">
                <li className="transition-colors duration-300 group-hover:text-brand-blue/80">Full refund if canceled up to 4 days before check-in.</li>
                <li className="transition-colors duration-300 group-hover:text-brand-blue/80">50% refund if canceled 3 days or less before check-in.</li>
              </ul>
            </div>

            <div className="group rounded-[28px] border border-brand-blue/10 bg-brand-white p-6 transition-all duration-500 ease-out hover:shadow-lg hover:shadow-brand-blue/5 hover:-translate-y-1">
              <h3 className="text-base font-semibold text-brand-blue flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Damages & Liability
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-brand-blue/70">
                <li className="transition-colors duration-300 group-hover:text-brand-blue/80">Guests are responsible for any damages.</li>
                <li className="transition-colors duration-300 group-hover:text-brand-blue/80">Report any issues immediately to staff.</li>
                <li className="transition-colors duration-300 group-hover:text-brand-blue/80">Security deposit of ₱3,000 per room is required upon check-in.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

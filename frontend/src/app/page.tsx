'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function Home() {
  const { showToast } = useToast();
  const addDays = (date: string | Date, days: number) => {
    const value = new Date(date);
    value.setDate(value.getDate() + days);
    return value.toISOString().slice(0, 10);
  };

  const today = new Date().toISOString().slice(0, 10);
  const minCheckInDate = addDays(today, 3);

  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState('1');
  const router = useRouter();

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckIn = e.target.value;
    setCheckInDate(newCheckIn);

    if (newCheckIn && (!checkOutDate || new Date(checkOutDate) <= new Date(newCheckIn))) {
      setCheckOutDate(addDays(newCheckIn, 1));
    }
  };

  const minCheckOutDate = checkInDate ? addDays(checkInDate, 1) : addDays(minCheckInDate, 1);

  const handleCheckAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkInDate || !checkOutDate) {
      showToast('Please select both check-in and check-out dates', 'error');
      return;
    }
    
    const query = new URLSearchParams();
    query.append('checkIn', checkInDate);
    query.append('checkOut', checkOutDate);
    if (guests) query.append('guests', guests);
    
    router.push(`/book-now?${query.toString()}`);
  };

  return (
    <main className="bg-brand-white text-brand-blue">
      {/* Full-width video hero section */}
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full min-h-screen flex items-center justify-center bg-black">
          {/* Video element */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/walkthrough.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Content overlay */}
          <div className="relative z-10 flex items-center justify-center px-6">
            <div className="text-center max-w-2xl">
              <h1 className="text-5xl md:text-6xl text-brand-yellow font-script">
                Hotel at Home
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-light/80">
                Your Mediterranean escape in Amadeo, Cavite.
              </p>
              <div className="mt-10 flex justify-center">
                <Link
                  href="/rooms"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-brand-blue transition-all duration-200 ease-smooth hover:bg-accent-500 hover:shadow-glow hover:-translate-y-0.5"
                >
                  Explore Our Rooms
                  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating check availability form */}
      <section className="relative -mt-10 px-6 pb-20 z-10">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[40px] bg-brand-white px-8 py-10 shadow-soft backdrop-blur-sm">
              <div className="mb-8 text-center">
                <h2 className="text-4xl font-script text-brand-blue">Check Availability</h2>
              </div>
              <form onSubmit={handleCheckAvailability} className="grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))_220px]">
              <label className="grid gap-3 rounded-3xl bg-white p-4 text-sm text-brand-blue shadow-sm">
                <span className="flex items-center gap-2 text-brand-blue">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path fillRule="evenodd" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Check-In
                </span>
                <input
                  type="date"
                  min={minCheckInDate}
                  value={checkInDate}
                  onChange={handleCheckInChange}
                  className={`w-full rounded-3xl border px-4 py-3 text-brand-blue outline-none transition-all duration-200 ease-smooth ${
                    checkInDate
                      ? 'border-accent-300 bg-accent-50 shadow-soft'
                      : 'border-primary-200 bg-white focus:border-accent focus:shadow-soft'
                  }`}
                />
              </label>

              <label className="grid gap-3 rounded-3xl bg-white p-4 text-sm text-brand-blue shadow-sm">
                <span className="flex items-center gap-2 text-brand-blue">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path fillRule="evenodd" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Check-Out
                </span>
                <input
                  type="date"
                  min={minCheckOutDate}
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className={`w-full rounded-3xl border px-4 py-3 text-brand-blue outline-none transition-all duration-200 ease-smooth ${
                    checkOutDate
                      ? 'border-accent-300 bg-accent-50 shadow-soft'
                      : 'border-primary-200 bg-white focus:border-accent focus:shadow-soft'
                  }`}
                />
              </label>

              <label className="grid gap-3 rounded-3xl bg-white p-4 text-sm text-brand-blue shadow-sm">
                <span className="flex items-center gap-2 text-brand-blue">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path fillRule="evenodd" d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm-7 9c0-2.8 4.5-4.3 7-4.3s7 1.5 7 4.3V22H5v-1z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Guests
                </span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  onKeyDown={(e) => {
                    if (!['ArrowUp', 'ArrowDown', 'Tab'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full rounded-3xl border border-primary-200 bg-white px-4 py-3 text-brand-blue outline-none transition-all duration-200 ease-smooth focus:border-accent focus:shadow-soft"
                />
              </label>

              <div className="flex items-end pb-4">
                <button 
                  type="submit" 
                  disabled={!checkInDate || !checkOutDate}
                  className="w-full rounded-3xl border border-transparent bg-brand-blue px-4 py-3 text-sm font-semibold text-brand-white shadow-md transition-all duration-200 ease-smooth hover:bg-primary-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-blue disabled:hover:shadow-md disabled:hover:translate-y-0"
                >
                  Check Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Functional elements below availability container */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center">
            <p className="text-5xl font-script text-primary-900">Our Rooms</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <article className="overflow-hidden rounded-[32px] border border-primary-100 bg-brand-white shadow-card transition-all duration-300 ease-smooth hover:shadow-xl hover:-translate-y-1">
              <div className="h-80 w-full overflow-hidden bg-slate-100 relative">
                <Image src="/img/blue-room/blue11.jpg" alt="Luxury Accommodations" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-primary-900">Luxury Accommodations</h3>
                <p className="mt-4 text-primary-600">
                  Explore our Gold Room and Blue Room, each designed with Mediterranean elegance and modern comfort.
                </p>
                <Link href="/rooms" className="mt-8 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-brand-blue transition-all duration-200 ease-smooth hover:bg-accent-500 hover:shadow-glow hover:-translate-y-0.5">
                  View All Rooms
                </Link>
              </div>
            </article>

            <article className="overflow-hidden rounded-[32px] border border-primary-100 bg-brand-white shadow-card transition-all duration-300 ease-smooth hover:shadow-xl hover:-translate-y-1">
              <div className="h-80 w-full overflow-hidden bg-slate-200">
                <iframe
                  title="Amadeo Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30953.230703290206!2d120.89868907910157!3d14.127048999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd790064203323%3A0x3043972d3b983203!2sHotel%20%40%20Home!5e0!3m2!1sen!2sph!4v1777886601332!5m2!1sen!2sph"
                  className="h-full w-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-primary-900">Our Location</h3>
                <p className="mt-4 text-primary-600">
                  Located in Amadeo, Cavite, Hotel at Home is close to dining and scenic leisure spots.
                </p>
                <div className="mt-6 flex items-center gap-3 text-sm text-brand-blue/70">
                  <span className="inline-flex items-center justify-center rounded-full bg-brand-blue/10 p-3 text-brand-blue">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path fillRule="evenodd" d="M12 2C8.1 2 5 5.1 5 9c0 4.9 5.1 11.4 6.3 12.9.4.4 1 .4 1.4 0C13.9 20.4 19 13.9 19 9c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z" clipRule="evenodd" />
                    </svg>
                  </span>
                <a href="https://maps.app.goo.gl/msZvzjPS2H6DsXP68?g_st=ic" target="_blank" rel="noopener noreferrer" className="hover:underline transition-colors duration-200 hover:text-primary-900">
                  Salaban, Tagaytay-Amadeo Road, Amadeo, Cavite
                </a>
                </div>
              </div>
            </article>
          </div>

          <section className="px-6 pb-20">
            <div className="mx-auto max-w-7xl">
              <div className="text-center">
                <p className="text-5xl font-script text-primary-900">Nearby Attractions</p>
                <p className="mx-auto mt-4 max-w-2xl text-sm text-primary-600">
                  Discover the best of Cavite and Tagaytay, all within easy reach of Hotel at Home.
                </p>
              </div>

              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {[
                  {
                    title: 'Picnic Grove',
                    distance: '9.7 km away',
                    description: 'Scenic park with picnic spots and horseback riding.',
                    image: '/nearby/picnic-grove.jpg'
                  },
                  {
                    title: 'Sky Ranch',
                    distance: '4 km away',
                    description: 'Amusement park with Sky Eye ferris wheel.',
                    image: '/nearby/sky-ranch.jpg'
                  },
                  {
                    title: 'Tagaytay City Oval',
                    distance: '3.3 km away',
                    description: 'A track for those who are interested in running, walking, biking, and skateboarding.',
                    image: '/nearby/tagaytay-oval.jpg'
                  },
                  {
                    title: "People's Park in the Sky",
                    distance: '16 km away',
                    description: 'A historical mountaintop park offering breathtaking panoramic views of Tagaytay and Taal Volcano.',
                    image: '/nearby/peoples-park.jpg'
                  },
                  {
                    title: 'Puzzle Mansion',
                    distance: '8.5 km away',
                    description: 'A unique museum holding a Guinness World Record for its massive collection of jigsaw puzzles.',
                    image: '/nearby/puzzle-mansion.jpg'
                  },
                  {
                    title: 'Museo Orlina',
                    distance: '15 km away',
                    description: 'A contemporary art museum showcasing stunning glass sculptures by renowned artist Ramon Orlina.',
                    image: '/nearby/museo-orlina.jpg'
                  }
                ].map((item) => (
                  <article key={item.title} className="overflow-hidden rounded-[28px] border border-primary-100 bg-brand-white shadow-card transition-all duration-300 ease-smooth hover:shadow-lg hover:-translate-y-0.5">
                    <div className="h-56 overflow-hidden relative">
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" loading="lazy" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-primary-900">{item.title}</h3>
                      <p className="mt-2 text-sm uppercase tracking-[0.24em] text-accent-600 font-semibold">{item.distance}</p>
                      <p className="mt-4 text-sm leading-6 text-primary-600">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

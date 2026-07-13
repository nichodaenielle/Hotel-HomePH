'use client';

import React, { useEffect, useState } from 'react';

const faqs = [
  {
    question: 'What do we offer?',
    answer:
      'Elegantly designed rooms for rent with a rooftop lounge exclusive to hotel guests. The rooftop lounge may also be rented for small events subject to prior arrangements.'
  },
  {
    question: 'Are walk-in guests allowed?',
    answer: 'No. Prior booking is required.'
  },
  {
    question: 'How many guests can the rooms accommodate?',
    answer:
      'Gold Room is ideal for a couple and can accommodate 2 guests. Blue room is ideal for a small family or group and can accommodate 4 guests.'
  },
  {
    question: 'What is the set-up of the building?',
    answer:
      'The building is a mixed-used residential and commercial property. The rented rooms are located on the third floor of a walk-up building (no elevator). The rooftop lounge is located on the fourth floor. Our guests appreciate the added privacy this elevated location provides.'
  },
  {
    question: 'How far is the place from Tagaytay?',
    answer:
      'Hotel at Home is approximately 5–15 minutes from Tagaytay, depending on traffic.'
  },
  {
    question: 'Is parking available?',
    answer: 'Yes, 1 free parking slot per room booked is available for guests during their stay.'
  },
  {
    question: 'What amenities are included in the unit?',
    answer: (
      <>
        <strong>Room Amenities</strong><br />
        Basic Toiletries – shampoo, bath gel, toothpaste, toothbrush, vanity kit, shower cap<br />
        Towels, bathrobe, slippers, hair dryer<br />
        Personal refrigerator<br />
        Aircon<br />
        Wi-fi<br />
        55” Smart TV with Bluetooth Speaker<br />
        Hot Shower<br />
        Humidifier<br />
        Flat Iron and Ironing Board, steamer – available upon request<br />
        Board Games<br />
        Free Breakfast for Two (2)<br />
        <br />
        <strong>Rooftop Lounge</strong><br />
        Dining area – Indoor and outdoor<br />
        Wine and liquor – By pre-order upon check in. Outside alcoholic drinks are subject to ₱500 corkage fee per bottle (wine/liquor)<br />
        65” Smart TV with Bluetooth speaker<br />
        Microphone for Karaoke – by request<br />
        Water Dispenser<br />
        Microwave
      </>
    )
  },
  {
    question: 'Can we cook or bring food?',
    answer:
      'Guests are welcome to bring outside food and enjoy their meals in the room or at the private rooftop lounge. To help maintain the space and furnishings, cooking inside the room and at the rooftop lounge is not allowed. If you’d like to explore local dining, Tagaytay’s restaurants and cafés are just a short drive away.'
  },
  {
    question: 'Is breakfast included?',
    answer: 'Yes, complimentary breakfast is included with your stay. A breakfast menu will be provided in your room, and we encourage guests to pre-order their meals ahead of time. Please also inform us of any dietary preferences or food allergies so we can prepare accordingly.'
  },
  {
    question: 'Are pets allowed?',
    answer:
      'For the comfort and safety of all guests, pets are not allowed inside the building. However, a nearby pet hotel is available, subject to a separate fee.'
  },
  {
    question: 'Is smoking allowed?',
    answer:
      'Smoking and vaping is not allowed inside the rooms and in enclosed areas within the rooftop lounge. Designated open areas in the rooftop lounge are provided for smoking.'
  },
  {
    question: 'Can I host small events or workshops?',
    answer:
      'Small gatherings such as intimate dinners, creative workshops, or celebrations may be allowed on the rooftop lounge subject to additional charges and considering the maximum number of guests allowed. Please contact us in advance so we can discuss your plans and ensure the setup works for your group.'
  },
  {
    question: 'Can I request extra amenities or services?',
    answer:
      'Depending on availability, additional amenities such as extra pillows, blankets, or event setups may be provided. Please contact us in advance to coordinate your needs.'
  },
  {
    question: 'Is housekeeping provided?',
    answer:
      'Housekeeping services are available upon request. Additional charges may apply for extended stays.'
  }
];

export default function FAQsPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number>(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="bg-brand-white text-brand-blue overflow-x-hidden">
      <section className="relative px-6 py-16 overflow-hidden">
        {/* Subtle pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23011478' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="mx-auto max-w-3xl relative">
          {/* Header */}
          <div className="text-center">
            <h1 
              className={`font-script text-5xl leading-tight text-brand-blue sm:text-6xl transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Frequently Asked Questions
            </h1>
            <p 
              className={`mt-4 text-sm text-brand-blue/70 sm:text-base transition-all duration-700 delay-150 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Find answers to common questions about{' '}
              <span className="font-script text-[1.5em] text-brand-yellow drop-shadow-[2px_2px_2px_rgba(0,0,0,0.15)]">Hotel at Home</span>
            </p>
          </div>

          {/* FAQ list */}
          <div className="mt-10 space-y-3">
            {faqs.map((item, index) => (
              <details
                key={item.question}
                open={openIndex === index}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenIndex(openIndex === index ? -1 : index);
                }}
                className={`group rounded-xl border border-brand-blue/15 bg-brand-white px-5 py-3 shadow-sm transition-all duration-300 ease-out hover:shadow-md cursor-pointer ${
                  openIndex === index ? 'shadow-md border-brand-blue/25' : ''
                } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${200 + index * 50}ms` }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-brand-blue marker:hidden">
                  <span className="transition-colors duration-300 group-hover:text-brand-blue/80">{item.question}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 shrink-0 text-brand-blue/60 transition-transform duration-300 ease-out ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    openIndex === index ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
                  }`}
                >
                  <p className="text-sm leading-6 text-brand-blue/70">
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>

          {/* Still have questions */}
          <div 
            className={`mt-10 rounded-xl border border-brand-blue/15 bg-gradient-to-br from-brand-white to-[#f8fafc] px-6 py-8 text-center shadow-sm transition-all duration-700 ease-out hover:shadow-lg hover:shadow-brand-blue/5 hover:-translate-y-1 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '800ms' }}
          >
            <h2 className="font-script text-3xl text-brand-blue sm:text-4xl">
              Still Have Questions?
            </h2>
            <p className="mt-3 text-sm text-brand-blue/70">
              Our team is here to help! Get in touch with us through any of these channels:
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:+639681907363"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-xs font-semibold text-brand-white transition-all duration-300 hover:bg-[#001a72] hover:shadow-lg hover:shadow-brand-blue/20 hover:-translate-y-0.5 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12">
                  <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                Call Us
              </a>
              <a
                href="mailto:hotelathome.ph@gmail.com"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-300 px-5 py-2.5 text-xs font-semibold text-brand-blue transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:-translate-y-0.5 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                Email Us
              </a>
              <a
                href="viber://chat?number=09681907363"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-xs font-semibold text-brand-white transition-all duration-300 hover:bg-[#001a72] hover:shadow-lg hover:shadow-brand-blue/20 hover:-translate-y-0.5 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Viber
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
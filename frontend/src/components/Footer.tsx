'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Info', href: '/info' },
  { label: 'Book Now', href: '/book-now' },
  { label: 'FAQs', href: '/faqs' }
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/view-booking' || (pathname && pathname.includes('/portal'))) return null;

  return (
    <footer className="bg-[#02136a] text-brand-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.32em] text-[#f9cd2a]">Quick Links</p>
            <ul className="space-y-2 text-sm text-brand-white/80">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-[#f9cd2a]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.32em] text-[#f9cd2a]">Contact Us</p>
            <ul className="space-y-3 text-sm text-brand-white/80">
              <li className="font-semibold text-brand-white">Hotel @ Home</li>
              <li>9895 Salaban, Tagaytay-Amadeo Road, Cavite</li>
              <li>
                <a href="mailto:hotelathome.ph@gmail.com" className="transition hover:text-[#f9cd2a]">
                  hotelathome.ph@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+639681907363" className="transition hover:text-[#f9cd2a]">
                  +63 968 190 7363
                </a>
              </li>
              <li>
                <a href="tel:+639178800387" className="transition hover:text-[#f9cd2a]">
                  +63 917 880 0387
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.32em] text-[#f9cd2a]">Follow Us</p>
            <div className="flex items-center gap-4 text-brand-white/80">
              <a href="https://www.facebook.com/share/1EeApxNDG9/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-white/20 transition hover:bg-[#f9cd2a] hover:text-brand-blue">
                <span className="sr-only">Facebook</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.1V12h2.1V9.8c0-2.1 1.3-3.3 3.2-3.3.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 2.9h-1.9v7A10 10 0 0022 12z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/hotelathomeph?igsh=a2NxbHJlOGQwYnpw&utm_source=qr" target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-white/20 transition hover:bg-[#f9cd2a] hover:text-brand-blue">
                <span className="sr-only">Instagram</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="mailto:hotelathome.ph@gmail.com" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-white/20 transition hover:bg-[#f9cd2a] hover:text-brand-blue">
                <span className="sr-only">Email</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </a>
              <a href="viber://chat?number=09681907363" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-white/20 transition hover:bg-[#f9cd2a] hover:text-brand-blue">
                <span className="sr-only">Viber</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-brand-white/10 pt-6 text-center text-sm text-brand-white/60">
          © 2026 Hotel at Home. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

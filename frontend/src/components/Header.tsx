'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'Home', href: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Rooms', href: '/rooms', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { label: 'Info', href: '/info', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'FAQs', href: '/faqs', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Safely hide the header on the admin dashboard
  if (pathname && pathname.includes('/portal')) {
    return null;
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-out
        ${scrolled 
          ? 'bg-[#011478]/95 backdrop-blur-xl shadow-2xl shadow-brand-blue/20 border-b border-white/10' 
          : 'bg-gradient-to-b from-[#011478] to-[#011478]/90 border-b border-white/5'
        }`}
    >
      {/* Elegant Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group relative">
          {/* Logo glow effect */}
          <div className="absolute -inset-2 bg-accent/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative h-[52px] w-[52px] overflow-hidden rounded-full bg-gradient-to-br from-white/20 to-white/5 p-1.5 
            transition-all duration-300 group-hover:from-white/30 group-hover:to-white/10 group-hover:scale-110
            shadow-lg shadow-brand-blue/20 ring-2 ring-white/10 group-hover:ring-accent/30">
            <img
              src="/img/logo/hhlogo.png"
              alt="Hotel at Home"
              width="52"
              height="52"
              decoding="async"
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-contain drop-shadow-lg will-change-transform"
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-lg font-normal text-white font-script tracking-wide leading-tight">
              Hotel at Home
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-medium -mt-0.5">
              Premier Stays
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((item) => {
              // Handle active state: exact match for home, startsWith for others
              const isActive = item.href === '/' 
                ? pathname === '/' 
                : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl overflow-hidden group
                    ${isActive 
                      ? 'text-accent' 
                      : 'text-white/70 hover:text-white'
                    }`}
                >
                  {/* Background hover effect */}
                  <span className={`absolute inset-0 rounded-xl transition-all duration-300
                    ${isActive ? 'bg-white/10' : 'bg-white/0 group-hover:bg-white/5'}
                  `} />
                  
                  {/* Active indicator line */}
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-accent transition-all duration-300 shadow-[0_0_10px_rgba(249,205,42,0.5)]
                    ${isActive ? 'w-6' : 'w-0 group-hover:w-4'}
                  `} />
                  
                  <span className="relative flex items-center gap-2">
                    <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
          
          {/* Divider */}
          <div className="hidden lg:block w-px h-8 bg-white/10" />

          {/* Book Now Button */}
          <Link
            href="/book-now"
            className="hidden lg:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-300 
              px-6 py-2.5 text-sm font-bold text-brand-blue transition-all duration-300 ease-out
              hover:shadow-[0_0_20px_rgba(249,205,42,0.4)] hover:scale-105 hover:-translate-y-0.5
              active:scale-95 active:translate-y-0 relative overflow-hidden group"
          >
            {/* Shine effect */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <span className="relative flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Now
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden relative p-2.5 text-white rounded-xl transition-all duration-300
              hover:bg-white/10 active:bg-white/20"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <span className={`absolute left-0 top-1 h-0.5 w-6 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-3' : ''}`} />
              <span className={`absolute left-0 top-3 h-0.5 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? 'w-0 opacity-0' : 'w-4 opacity-100'}`} />
              <span className={`absolute left-0 top-5 h-0.5 w-6 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-3' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-out
          ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="border-t border-white/10 bg-[#011478]/98 backdrop-blur-xl shadow-2xl">
          <div className="px-4 py-6 space-y-4">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((item, index) => {
                // Handle active state: exact match for home, startsWith for others
                const isActive = item.href === '/' 
                  ? pathname === '/' 
                  : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-300 
                      flex items-center gap-3 group relative overflow-hidden
                      ${isActive 
                        ? 'text-accent bg-white/10 shadow-lg shadow-accent/5' 
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Icon */}
                    <div className={`p-2 rounded-lg transition-colors duration-300
                      ${isActive ? 'bg-accent/20' : 'bg-white/5 group-hover:bg-white/10'}
                    `}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    
                    <span className="flex-1">{item.label}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(249,205,42,0.6)]" />
                    )}
                    
                    {/* Chevron */}
                    <svg className="w-5 h-5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </nav>
            
            {/* Mobile CTA */}
            <div className="pt-4 border-t border-white/10">
              <Link
                href="/book-now"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-300 
                  px-6 py-4 text-base font-bold text-brand-blue transition-all duration-300 
                  hover:shadow-[0_0_20px_rgba(249,205,42,0.3)] active:scale-[0.98]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Your Stay
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              
              {/* Contact info */}
              <div className="mt-4 flex items-center justify-center gap-2 text-white/50 text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Questions? Call us</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

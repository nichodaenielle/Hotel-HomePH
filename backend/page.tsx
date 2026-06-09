'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface BookingStatus {
  confirmation_code: string;
  guest_first_name: string;
  guest_last_name: string;
  room_id: number;
  check_in: string;
  check_out: string;
  total_price: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  purpose: string;
}

function ViewBookingContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  
  const [searchInput, setSearchInput] = useState(initialCode);
  const [loading, setLoading] = useState(!!initialCode);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<BookingStatus | null>(null);

  useEffect(() => {
    if (initialCode) {
      fetchBooking(initialCode);
    }
  }, [initialCode]);

  const fetchBooking = async (codeToFetch: string) => {
    if (!codeToFetch.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/bookings/status/${codeToFetch.trim()}`);
      const data = await res.json();
      
      if (res.ok) {
        setBooking(data);
      } else {
        setError(data.error || 'Booking not found.');
        setBooking(null);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput) {
      window.history.replaceState(null, '', `/view-booking?code=${searchInput}`);
      fetchBooking(searchInput);
    }
  };

  const getRoomName = (roomId: number) => {
    switch (roomId) {
      case 1: return 'Gold Room';
      case 2: return 'Blue Room';
      case 3: return 'Rooftop Lounge';
      default: return 'Unknown Room';
    }
  };

  const displayDate = (dateStr: string) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <main className="min-h-screen bg-[#f3f6fb] text-brand-blue py-24 px-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-brand-blue/5">
          
          {/* Header & Search */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-script text-brand-blue">Track Booking</h1>
            <p className="text-brand-blue/70 mt-3 text-sm">Enter your reference code to view your reservation details.</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-3 mb-10 max-w-md mx-auto">
            <input 
              type="text" 
              value={searchInput} 
              onChange={e => setSearchInput(e.target.value.toUpperCase())} 
              placeholder="e.g. HH-A1B2C3" 
              className="flex-1 rounded-full border border-brand-blue/10 bg-[#f3f6fb] px-6 py-3 text-sm font-semibold outline-none focus:border-brand-blue transition placeholder:font-normal uppercase" 
            />
            <button type="submit" className="rounded-full bg-brand-blue px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#001a72] shadow-sm">
              Track
            </button>
          </form>

          {/* Status Display Area */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-brand-blue/60">
              <svg className="animate-spin h-8 w-8 mb-4 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p className="text-sm font-medium">Retrieving booking information...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl bg-red-50 p-6 text-center border border-red-100">
              <p className="text-red-600 font-medium">{error}</p>
              <p className="text-red-500/70 text-xs mt-2">Please ensure you entered the exact confirmation code sent to your email.</p>
            </div>
          )}

          {!loading && booking && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              
              {/* Status Header Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-brand-blue/10 bg-brand-blue/5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue/60">Reference Code</p>
                  <p className="text-2xl font-bold tracking-widest text-brand-blue mt-1">{booking.confirmation_code}</p>
                </div>
                <div className={`px-6 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs border w-fit ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200 shadow-sm' :
                  'bg-yellow-100 text-yellow-700 border-yellow-200 shadow-sm'
                }`}>
                  {booking.status}
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="p-6 md:p-8 rounded-2xl border border-brand-blue/10 bg-white grid sm:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue/50 mb-1">Guest Name</p>
                  <p className="font-medium">{booking.guest_first_name} {booking.guest_last_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue/50 mb-1">Accommodation</p>
                  <p className="font-medium">{getRoomName(booking.room_id)}</p>
                </div>
                <div className="sm:col-span-2 border-t border-brand-blue/5 pt-6"></div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue/50 mb-1">Check-in</p>
                  <p className="font-medium">{displayDate(booking.check_in)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue/50 mb-1">Check-out</p>
                  <p className="font-medium">{displayDate(booking.check_out)}</p>
                </div>
                <div className="sm:col-span-2 border-t border-brand-blue/5 pt-6"></div>
                <div className="sm:col-span-2 flex items-center justify-between bg-brand-blue/5 p-4 rounded-xl">
                  <span className="font-semibold text-brand-blue">Total Amount Due</span>
                  <span className="text-xl font-bold text-accent drop-shadow-sm">₱{parseFloat(booking.total_price).toLocaleString()}</span>
                </div>
              </div>
              
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ViewBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f6fb] flex items-center justify-center text-brand-blue font-semibold">Loading Portal...</div>}>
      <ViewBookingContent />
    </Suspense>
  );
}
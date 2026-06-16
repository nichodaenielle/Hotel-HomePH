﻿'use client';
import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/components/Toast';

// --- STATIC ROOM DATA (images, features, etc.) ---
const roomStaticData = {
  1: {
    image: '/img/gold-room/gold1.jpg',
    imagesCount: 15,
    folder: 'gold-room',
    prefix: 'gold',
    features: ['50 SQM with balcony', 'Ideal for 2 guests', '1 King size bed', '1 Bathroom', '4-Seater Dining Table', 'Kitchen cabinet with sink', 'Personal Ref', 'Air conditioning and WiFi', '55" Smart TV with Bluetooth Speaker', 'Toiletries, towels, and bathrobe', 'Contemporary artwork', 'Parking space']
  },
  2: {
    image: '/img/blue-room/blue4.jpg',
    imagesCount: 13,
    folder: 'blue-room',
    prefix: 'blue',
    features: ['50 SQM with balcony', 'Ideal for 4 guests', '2 Queen size beds', '1 Bathroom', '6-Seater Dining Table', 'Kitchen cabinet with sink', 'Personal Ref', 'Air conditioning and WiFi', '55" Smart TV with Bluetooth speaker', 'Toiletries, towels, and bathrobe', 'Contemporary artwork', 'Parking space']
  },
  3: {
    image: '/img/rooftop/rooftop1.jpg',
    imagesCount: 13,
    folder: 'rooftop',
    prefix: 'rooftop',
    features: ['150 SQM', 'Outdoor and indoor seating', 'Bar counter', 'Dining table setup', 'Air conditioning and WiFi', '65" Smart TV with Bluetooth speaker', 'Microphone for Karaoke - available upon request', 'Contemporary artwork']
  }
};

// --- HELPER FUNCTIONS ---
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Convert "hh:mm AM/PM" to 24-hour "HH:MM".
const to24h = (label: string): string => {
  const m = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return '';
  let hh = parseInt(m[1], 10) % 12;
  if (/pm/i.test(m[3])) hh += 12;
  return `${String(hh).padStart(2, '0')}:${m[2]}`;
};

// Parse a Rooftop slot string like "06:00 PM - 12:00 AM" into start/end times.
const parseSlotTimes = (slot: string): { checkInTime: string; checkOutTime: string } | null => {
  if (!slot) return null;
  const [start, end] = slot.split('-').map(s => s.trim());
  const checkInTime = to24h(start);
  const checkOutTime = to24h(end);
  if (!checkInTime || !checkOutTime) return null;
  return { checkInTime, checkOutTime };
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// --- COMPONENTS ---

function SmartCalendar({
  checkIn,
  checkOut,
  onChange,
  dateStatuses = {},
  isSingleDaySelection = false,
}: {
  checkIn: Date | null;
  checkOut: Date | null;
  onChange: (inDate: Date | null, outDate: Date | null) => void;
  dateStatuses?: Record<string, any[]>;
  isSingleDaySelection?: boolean;
}) {
  const [currentMonth, setCurrentMonth] = useState(getStartOfDay(new Date()));

  // Buffer calculation: Soonest check-in is 3 days from today
  const today = getStartOfDay(new Date());
  const minDate = addDays(today, 3);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDateBookings = (date: Date) => {
    return dateStatuses[formatDate(date)] || [];
  };

  const isBlocked = (date: Date) => {
    return getDateBookings(date).length > 0;
  };

  const isValidRange = (start: Date, end: Date) => {
    let curr = new Date(start);
    // We only care if the NIGHTS are blocked. A check-out day can overlap a check-in day.
    while (curr < end) {
      if (isBlocked(curr)) return false;
      curr.setDate(curr.getDate() + 1);
    }
    return true;
  };

  const handleDateClick = (clickedDate: Date) => {
    if (clickedDate < minDate) return;

    if (isSingleDaySelection) {
      if (isBlocked(clickedDate)) return;
      onChange(clickedDate, addDays(clickedDate, 1));
      return;
    }

    if (!checkIn || (checkIn && checkOut)) {
      // Start new selection (must not be a blocked date)
      if (isBlocked(clickedDate)) return;
      onChange(clickedDate, null);
    } else {
      // We have check-in, selecting check-out
      if (clickedDate <= checkIn) {
        if (isBlocked(clickedDate)) return;
        onChange(clickedDate, null);
      } else {
        // Ensure no blocked dates are between check-in and check-out
        if (isValidRange(checkIn, clickedDate)) {
          onChange(checkIn, clickedDate);
        } else {
          // If there is a blocked date in between, reset selection to the clicked date
          if (isBlocked(clickedDate)) return;
          onChange(clickedDate, null);
        }
      }
    }
  };

  const renderDays = () => {
    const days = [];
    // Empty slots before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const dateStr = formatDate(date);
      const isPastOrBuffer = date < minDate;
      const bookings = getDateBookings(date);
      const isNightBooked = bookings.length > 0;

      let isDisabled = isPastOrBuffer || isNightBooked;
      if (!isSingleDaySelection && checkIn && !checkOut && date > checkIn) {
        isDisabled = !isValidRange(checkIn, date);
      }

      const isCheckIn = checkIn && formatDate(checkIn) === dateStr;
      const isCheckOut = !isSingleDaySelection && checkOut && formatDate(checkOut) === dateStr;
      const isInRange = !isSingleDaySelection && checkIn && checkOut && date > checkIn && date < checkOut;

      let baseClasses = "relative flex h-10 w-10 items-center justify-center rounded-full text-sm transition ";

      if (isDisabled) {
        baseClasses += "cursor-not-allowed text-gray-300 ";
        if (isNightBooked) {
          baseClasses += "line-through decoration-red-400/50 ";
        }
      } else if (isCheckIn || isCheckOut) {
        baseClasses += "bg-brand-blue text-white font-semibold shadow-md ";
      } else if (isInRange) {
        baseClasses += "bg-brand-blue/10 text-brand-blue font-medium rounded-none ";
      } else {
        baseClasses += "text-brand-blue hover:bg-brand-blue/5 cursor-pointer ";
      }

      // Build tooltip with booking details
      let tooltipText = "";
      if (isNightBooked && !isPastOrBuffer) {
        const bookingDetails = bookings.map(b => {
          const checkInTime = new Date(b.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          const checkOutTime = new Date(b.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          const roomName = b.roomId === 1 ? 'Gold Room' : b.roomId === 2 ? 'Blue Room' : 'Rooftop';
          const blockReason = b.isRooftopBlock ? '(Rooftop blocks all)' : '';
          return `${roomName} ${b.status} ${checkInTime}-${checkOutTime} ${blockReason}`;
        }).join('\n');
        tooltipText = bookingDetails;
      }

      days.push(
        <div key={i} className="flex justify-center p-1">
          <button
            type="button"
            onClick={() => handleDateClick(date)}
            disabled={isDisabled}
            className={baseClasses}
            title={tooltipText}
          >
            {i}
            {isNightBooked && !isPastOrBuffer && (
               <span className="absolute bottom-1 h-1 w-1 rounded-full bg-red-400"></span>
            )}
          </button>
        </div>
      );
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="w-full max-w-sm mx-auto rounded-3xl border border-brand-blue/10 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={handlePrevMonth} className="rounded-full p-2 text-brand-blue/70 hover:bg-slate-100 transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h3 className="font-semibold text-brand-blue">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={handleNextMonth} className="rounded-full p-2 text-brand-blue/70 hover:bg-slate-100 transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Days Header */}
      <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-brand-blue/50 uppercase">
        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-2">
        {renderDays()}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-brand-blue/70 border-t border-brand-blue/5 pt-4">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-brand-blue"></span> Selected
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-gray-300 flex items-center justify-center"><span className="h-1 w-1 bg-red-400 rounded-full"></span></span> Unavailable
        </div>
      </div>

      {/* Clear Selection Button */}
      {(checkIn || checkOut) && (
        <button
          onClick={() => onChange(null, null)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium 
            text-brand-blue/70 hover:text-brand-blue hover:bg-brand-blue/5 transition-all duration-200 
            border border-brand-blue/10 hover:border-brand-blue/30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear Selection
        </button>
      )}
    </div>
  );
}

function ProgressBar({ currentStep }: { currentStep: number }) {
  const steps = ["Room", "Dates", "Guests", "Payment", "Rules"];
  
  return (
    <div className="mb-12 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center relative">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 z-10
                  ${isActive ? 'bg-brand-blue text-white ring-4 ring-brand-blue/20' : 
                    isCompleted ? 'bg-brand-blue text-white' : 'bg-white text-brand-blue border border-brand-blue/20'}`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span className={`text-xs absolute top-10 whitespace-nowrap hidden md:block ${isActive || isCompleted ? 'text-brand-blue font-semibold' : 'text-brand-blue/50'}`}>
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 rounded bg-brand-blue/10 relative overflow-hidden flex items-center">
                  <div className={`absolute top-0 left-0 h-full bg-brand-blue transition-all duration-300 ${isCompleted ? 'w-full' : 'w-0'}`}></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function BookNowContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const initialRoomId = searchParams.get('roomId') ? parseInt(searchParams.get('roomId') as string) : null;
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(initialRoomId);
  const [rooms, setRooms] = useState<any[]>([]);
  const [checkIn, setCheckIn] = useState<Date | null>(
    // For Rooftop, only check-in is needed (single-day booking)
    // For Gold/Blue, both dates are needed (multi-night booking)
    initialRoomId === 3
      ? (searchParams.get('checkIn') ? new Date(searchParams.get('checkIn') as string) : null)
      : (searchParams.get('checkIn') ? new Date(searchParams.get('checkIn') as string) : null)
  );
  const [checkOut, setCheckOut] = useState<Date | null>(
    // For Rooftop, check-out is not needed (single-day booking)
    // For Gold/Blue, check-out is needed (multi-night booking)
    initialRoomId === 3
      ? null
      : (searchParams.get('checkOut') ? new Date(searchParams.get('checkOut') as string) : null)
  );
  const [purpose, setPurpose] = useState('');
  const [guests, setGuests] = useState(
    searchParams.get('guests') ? parseInt(searchParams.get('guests') as string) : 1
  );
  const [guestDetails, setGuestDetails] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [paymentDetails, setPaymentDetails] = useState<{ method: string; proof: File | null; idFront: File | null; idBack: File | null }>({ method: 'gcash', proof: null, idFront: null, idBack: null });
  const [timeSlot, setTimeSlot] = useState('');
  const [duration, setDuration] = useState<'6' | '12'>('12'); // 6-hour or 12-hour booking
  const [isCheckingDates, setIsCheckingDates] = useState(false);
  const [datesAvailable, setDatesAvailable] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [conflictingDates, setConflictingDates] = useState<any[] | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [viewRoomDetails, setViewRoomDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateStatuses, setDateStatuses] = useState<Record<string, any[]>>({});
  const [viewQrFullscreen, setViewQrFullscreen] = useState(false);

  // Check availability when room changes and dates are already selected
  useEffect(() => {
    const checkAvailabilityForRoom = async () => {
      if (checkIn && checkOut && selectedRoomId) {
        // For Rooftop, require time slot to be selected before checking availability
        if (selectedRoomId === 3 && !timeSlot) {
          setDatesAvailable(false);
          setAvailabilityError(null);
          setConflictingDates(null);
          return;
        }

        setIsCheckingDates(true);
        setDatesAvailable(false);
        setAvailabilityError(null);
        setConflictingDates(null);
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          const slotTimes = selectedRoomId === 3 ? parseSlotTimes(timeSlot) : null;
          const res = await fetch(`${apiUrl}/api/availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId: selectedRoomId,
              checkIn: formatDate(checkIn),
              checkOut: formatDate(checkOut),
              checkInTime: slotTimes?.checkInTime,
              checkOutTime: slotTimes?.checkOutTime
            })
          });
          const data = await res.json();
          setDatesAvailable(data.available);
          if (!data.available) {
            const errorMsg = data.error || 'Selected dates are no longer available.';
            setAvailabilityError(errorMsg);
            setConflictingDates(data.conflicts || null);
          }
        } catch (e) {
          console.error('Availability check failed:', e);
          setDatesAvailable(false);
          setAvailabilityError('Could not check availability. Please try again.');
        } finally {
          setIsCheckingDates(false);
        }
      }
    };

    checkAvailabilityForRoom();
  }, [selectedRoomId, timeSlot]);

  // Check availability on mount if dates are pre-populated from URL
  useEffect(() => {
    if (checkIn && checkOut && selectedRoomId) {
      const checkInitialAvailability = async () => {
        setIsCheckingDates(true);
        setDatesAvailable(false);
        setAvailabilityError(null);
        setConflictingDates(null);
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          const slotTimes = selectedRoomId === 3 ? parseSlotTimes(timeSlot) : null;
          const res = await fetch(`${apiUrl}/api/availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId: selectedRoomId,
              checkIn: formatDate(checkIn),
              checkOut: formatDate(checkOut),
              checkInTime: slotTimes?.checkInTime,
              checkOutTime: slotTimes?.checkOutTime
            })
          });
          const data = await res.json();
          setDatesAvailable(data.available);
          if (!data.available) {
            const errorMsg = data.error || 'Selected dates are no longer available.';
            setAvailabilityError(errorMsg);
            setConflictingDates(data.conflicts || null);
          }
        } catch (e) {
          console.error('Availability check failed:', e);
          setDatesAvailable(false);
          setAvailabilityError('Could not check availability. Please try again.');
        } finally {
          setIsCheckingDates(false);
        }
      };

      checkInitialAvailability();
    }
  }, []);

  // Calculate derived values
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  
  let nights = 0;
  if (checkIn && checkOut) {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Scroll to top when step changes or booking is confirmed
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep, bookingConfirmed]);

  // Fetch rooms from backend API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/rooms`);
        if (response.ok) {
          const data = await response.json();
          // Merge backend pricing data with static data
          const mergedRooms = data.map((room: any) => ({
            ...room,
            ...roomStaticData[room.id as keyof typeof roomStaticData],
            weekendPrice: room.weekend_price || room.price,
            price6Hour: room.price_6hr,
            weekendPrice6Hour: room.weekend_price_6hr
          }));
          setRooms(mergedRooms);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        // Fallback to static data if API fails
        const fallbackRooms = Object.entries(roomStaticData).map(([id, staticData]) => ({
          id: parseInt(id),
          name: id === '1' ? 'Gold Room' : id === '2' ? 'Blue Room' : 'Rooftop Lounge',
          price: id === '1' || id === '2' ? 4800 : 8000,
          weekendPrice: id === '1' || id === '2' ? 5300 : 10000,
          price6Hour: id === '3' ? 4000 : null,
          weekendPrice6Hour: id === '3' ? 5000 : null,
          capacity: id === '1' ? 2 : id === '2' ? 4 : 20,
          ...staticData
        }));
        setRooms(fallbackRooms);
      }
    };
    fetchRooms();
  }, []);

  // Fetch blocked dates when selected room changes
  useEffect(() => {
    if (!selectedRoomId) {
      setDateStatuses({});
      return;
    }
    const fetchBlockedDates = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/bookings/dates/${selectedRoomId}`);
        if (response.ok) {
          const data = await response.json();
          // API now returns { "2026-06-10": "confirmed", "2026-06-11": "pending", ... }
          setDateStatuses(data);
        }
      } catch (error) {
        console.error('Error fetching dates:', error);
      }
    };

    fetchBlockedDates(); // Fetch immediately on room change
    const intervalId = setInterval(fetchBlockedDates, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount or when room changes
  }, [selectedRoomId]);

  let roomTotal = null;
  if (selectedRoom && selectedRoom.price !== null) {
    if (selectedRoomId === 3) {
      // Rooftop Lounge pricing based on duration
      const isWeekend = checkIn ? (checkIn.getDay() === 5 || checkIn.getDay() === 6) : false;
      if (duration === '6') {
        roomTotal = isWeekend ? (selectedRoom.weekendPrice6Hour || 4000) : (selectedRoom.price6Hour || 2000);
      } else {
        roomTotal = isWeekend ? (selectedRoom.weekendPrice || 10000) : (selectedRoom.price || 8000);
      }
    } else if (nights > 0 && checkIn) {
      roomTotal = 0;
      for (let i = 0; i < nights; i++) {
        const currentDate = new Date(checkIn);
        currentDate.setDate(currentDate.getDate() + i);
        const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
        // Calculate Weekends as Friday and Saturday nights
        if (dayOfWeek === 5 || dayOfWeek === 6) {
          roomTotal += selectedRoom.weekendPrice || selectedRoom.price;
        } else {
          roomTotal += selectedRoom.price;
        }
      }
    } else {
      roomTotal = selectedRoom.price;
    }
  }

  const isStep3Valid = 
    guestDetails.firstName.replace(/[^a-zA-Z]/g, '').length >= 2 && 
    guestDetails.lastName.trim() !== '' && 
    guestDetails.email.trim() !== '' && 
    /^\d{11}$/.test(guestDetails.phone);

  const isStep4Valid = selectedRoomId === 3 
    ? paymentDetails.idFront && paymentDetails.idBack && paymentDetails.proof && purpose.trim() !== ''
    : paymentDetails.idFront && paymentDetails.idBack && paymentDetails.proof;

  const handleNext = () => {
    if (currentStep === 1 && !selectedRoomId) return;
    if (currentStep === 2 && (!checkIn || !checkOut || (selectedRoomId === 3 && !timeSlot))) return;
    if (currentStep === 3 && !isStep3Valid) return;
    if (currentStep === 4 && !isStep4Valid) return;
    if (currentStep === 5) {
      if (!agreedToRules) return;
      
      setIsSubmitting(true);
      
      const submitBooking = async () => {
        try {
          const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });

          const proofBase64 = paymentDetails.proof ? await toBase64(paymentDetails.proof) : null;
          const idFrontBase64 = paymentDetails.idFront ? await toBase64(paymentDetails.idFront) : null;
          const idBackBase64 = paymentDetails.idBack ? await toBase64(paymentDetails.idBack) : null;

          const finalPurpose = selectedRoomId === 3 && timeSlot ? `${purpose}\n\nDuration: ${duration} Hours\nTime Slot: ${timeSlot}` : purpose;

          // Rooftop bookings carry explicit slot times; nightly rooms use the
          // backend's fixed standard times (14:00 / 12:00).
          const slotTimes = selectedRoomId === 3 ? parseSlotTimes(timeSlot) : null;

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          
          // Re-check availability before submission to prevent race conditions
          const availRes = await fetch(`${apiUrl}/api/availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId: selectedRoomId,
              checkIn: formatDate(checkIn!),
              checkOut: formatDate(checkOut!),
              checkInTime: slotTimes?.checkInTime,
              checkOutTime: slotTimes?.checkOutTime
            })
          });
          const availData = await availRes.json();
          if (!availData.available) {
            showToast('Selected dates are no longer available. Please choose different dates.', 'error');
            setDatesAvailable(false);
            setIsSubmitting(false);
            return;
          }
          
          const response = await fetch(`${apiUrl}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId: selectedRoomId,
              guestFirstName: guestDetails.firstName,
              guestLastName: guestDetails.lastName,
              guestEmail: guestDetails.email,
              guestPhone: guestDetails.phone,
              checkIn: checkIn ? formatDate(checkIn) : null,
              checkOut: checkOut ? formatDate(checkOut) : null,
              checkInTime: slotTimes?.checkInTime,
              checkOutTime: slotTimes?.checkOutTime,
              totalPrice: roomTotal,
              purpose: finalPurpose,
              guests: guests,
              proofBase64,
              idFrontBase64,
              idBackBase64,
              paymentMethod: paymentDetails.method,
              amountPaid: roomTotal
            }),
          });
          
          const data = await response.json();
          
          if (response.ok) {
            setConfirmationCode(data.confirmationCode);
            setBookingConfirmed(true);
            showToast('Booking submitted successfully!', 'success');
          } else {
            showToast('Failed to submit booking: ' + (data.error || 'Unknown error'), 'error');
          }
        } catch (error) {
          console.error('Error:', error);
          showToast('Network error. Please check your connection and try again.', 'error');
        } finally {
          setIsSubmitting(false);
        }
      };
      
      submitBooking();
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    const newStep = Math.max(currentStep - 1, 1);
    setCurrentStep(newStep);
    // Reset availability states when going back to Step 1 (room selection)
    if (newStep === 1) {
      setDatesAvailable(false);
      setAvailabilityError(null);
      setConflictingDates(null);
    }
  };

  if (bookingConfirmed) {
    return (
      <main className="min-h-screen bg-[#f3f6fb] text-brand-blue pb-20 pt-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="bg-white rounded-[32px] p-10 shadow-sm border border-brand-blue/5 mt-10">
            <svg className="w-20 h-20 text-green-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h1 className="text-4xl font-script text-brand-blue mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-brand-blue/70 mb-8">
              Thank you for choosing Hotel at Home. We have received your reservation.
            </p>
            
            <div className="bg-brand-blue/5 rounded-2xl p-6 mb-8 inline-block">
              <p className="text-sm uppercase tracking-wider text-brand-blue/60 mb-2 font-semibold">
                Your Confirmation Code
              </p>
              <p className="text-3xl font-bold text-brand-blue tracking-widest">{confirmationCode}</p>
            </div>
            
            <p className="text-sm text-brand-blue/70">
              Please save this code for your reference.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/" className="inline-flex w-full sm:w-auto justify-center rounded-full bg-brand-blue/10 px-8 py-3 text-sm font-semibold text-brand-blue transition hover:bg-brand-blue/20">Return Home</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f6fb] text-brand-blue pb-20 pt-24">
      {/* Room Details Modal */}
      {viewRoomDetails && selectedRoom && (
        <RoomDetailsModal room={selectedRoom} onClose={() => setViewRoomDetails(false)} />
      )}

      {/* GCash QR Fullscreen Modal */}
      {viewQrFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setViewQrFullscreen(false)}>
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full flex flex-col items-center relative shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setViewQrFullscreen(false)} className="absolute right-4 top-4 rounded-full bg-black/5 p-2 text-brand-blue hover:bg-black/10 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-semibold text-brand-blue mb-4">Scan to Pay</h3>
            <div className="w-full aspect-[3/4] flex justify-center rounded-xl bg-slate-50 mb-6 overflow-hidden border border-brand-blue/10 relative">
              <Image src="/img/payment/gcash.jpg" alt="GCash QR Code Full" fill className="object-contain" sizes="(max-width: 768px) 100vw, 400px" priority />
            </div>
            <a 
              href="/img/payment/gcash.jpg" 
              download="HotelAtHome_GCash_QR.jpg"
              className="inline-flex w-full justify-center items-center gap-2 rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#001a72] shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download QR Code
            </a>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center relative">
          <h1 className="text-4xl font-script text-brand-blue md:text-5xl">Book Your Stay</h1>
          <p className="mt-3 text-brand-blue/70">Complete your reservation in just a few simple steps</p>
        </div>

        <ProgressBar currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 mt-10">
          
          {/* LEFT COLUMN: Form Steps */}
          <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-brand-blue/5">
            
            {/* STEP 1: Select Room */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Select Accommodation</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rooms.map(room => (
                    <div
                      key={room.id}
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        if (guests > room.capacity) setGuests(room.capacity);
                        if (room.id !== 3) setTimeSlot('');
                        // Reset dates when switching rooms to avoid showing stale availability errors
                        setCheckIn(null);
                        setCheckOut(null);
                        // Reset date availability states when changing rooms
                        setDatesAvailable(false);
                        setAvailabilityError(null);
                        setConflictingDates(null);
                      }}
                      className={`cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                        selectedRoomId === room.id
                          ? 'border-brand-blue shadow-md bg-brand-blue/5'
                          : 'border-brand-blue/10 bg-white hover:border-brand-blue/30'
                      }`}
                    >
                      <div className="h-32 w-full overflow-hidden bg-slate-200 relative">
                        {room.image ? (
                           <Image src={room.image} alt={room.name} fill className="object-cover" sizes="128px" loading="lazy" />
                        ) : (
                           <div className="absolute inset-0 flex items-center justify-center text-sm text-brand-blue/50">Image</div>
                        )}
                        {selectedRoomId === room.id && (
                          <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">{room.name}</h3>
                        <p className="text-sm text-brand-blue/60 mt-1">Up to {room.capacity} guests</p>
                        <p className="text-xs text-brand-blue/50 mt-1">{room.features[0]}</p>
                        {room.price !== null ? (
                          <p className="font-bold text-sm mt-3 uppercase tracking-wider text-accent">From ₱{room.price.toLocaleString()} / {room.id === 3 ? '12-hrs' : 'night'}</p>
                        ) : (
                          <p className="font-bold text-sm mt-3 uppercase tracking-wider text-accent">TBA / night</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedRoom && (
                  <div className="mt-8 rounded-2xl border border-brand-blue/10 bg-brand-blue/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">Number of Guests</h3>
                      <p className="text-sm text-brand-blue/60 mt-1">Maximum capacity is {selectedRoom.capacity} guests.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white rounded-full px-4 py-2 border border-brand-blue/10 shadow-sm w-fit">
                      <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-lg transition font-medium text-brand-blue" disabled={guests <= 1}>-</button>
                      <span className="w-6 text-center font-semibold">{guests}</span>
                      <button type="button" onClick={() => setGuests(Math.min(selectedRoom.capacity, guests + 1))} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-lg transition font-medium text-brand-blue" disabled={guests >= selectedRoom.capacity}>+</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Choose Dates */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold">Choose Your Dates</h2>
                  <p className="text-sm text-brand-blue/60 mt-1">Select your check-in and check-out dates. Earliest check-in starts 3 days from today.</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-brand-blue/60">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-400"></span>
                      <span>Booked (hover for details)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-brand-blue"></span>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-brand-blue/10"></span>
                      <span>In range</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <SmartCalendar
                      checkIn={checkIn}
                      checkOut={checkOut}
                      dateStatuses={dateStatuses}
                      isSingleDaySelection={selectedRoomId === 3}
                      onChange={async (inD, outD) => {
                        setCheckIn(inD);
                        setCheckOut(outD);
                        if (selectedRoomId === 3) setTimeSlot('');
                        if (inD && outD) {
                          setIsCheckingDates(true);
                          setDatesAvailable(false);
                          setAvailabilityError(null);
                          setConflictingDates(null);
                          try {
                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                            const slotTimes = selectedRoomId === 3 ? parseSlotTimes(timeSlot) : null;
                            const res = await fetch(`${apiUrl}/api/availability`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                roomId: selectedRoomId,
                                checkIn: formatDate(inD),
                                checkOut: formatDate(outD),
                                checkInTime: slotTimes?.checkInTime,
                                checkOutTime: slotTimes?.checkOutTime
                              })
                            });
                            const data = await res.json();
                            setDatesAvailable(data.available);
                            if (!data.available) {
                              const errorMsg = data.error || 'Selected dates are no longer available.';
                              setAvailabilityError(errorMsg);
                              setConflictingDates(data.conflicts || null);
                              showToast(errorMsg, 'error');
                            }
                          } catch (e) {
                            console.error('Availability check failed:', e);
                            setDatesAvailable(false);
                            setAvailabilityError('Could not check availability. Please try again.');
                            showToast('Could not check availability. Please try again.', 'error');
                          } finally {
                            setIsCheckingDates(false);
                          }
                        } else {
                          setDatesAvailable(false);
                          setAvailabilityError(null);
                          setConflictingDates(null);
                        }
                      }} 
                    />
                  </div>
                  
                  <div className="flex-1 w-full space-y-4 pt-4 md:pt-10">
                    {selectedRoomId === 3 ? (
                      <>
                        <div className="rounded-2xl border border-brand-blue/10 bg-brand-blue/5 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue/50 mb-1">Event Date</p>
                          <p className="font-medium">{checkIn ? checkIn.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : 'Select date'}</p>
                          {checkIn && (
                            <p className="text-xs text-brand-blue/50 mt-2">{checkIn.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                          )}
                        </div>
                        {checkIn && (
                          <>
                            {/* Duration Selector */}
                            <div className="rounded-2xl border border-brand-blue/10 bg-brand-blue/5 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue/50 mb-3">Select Duration <span className="text-red-500">*</span></p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* 6 Hours Option */}
                                <button
                                  onClick={() => { setDuration('6'); setTimeSlot(''); }}
                                  className={`p-4 rounded-xl border text-left transition ${
                                    duration === '6'
                                      ? 'bg-brand-blue text-white border-brand-blue'
                                      : 'bg-white text-brand-blue border-brand-blue/20 hover:border-brand-blue/40'
                                  }`}
                                >
                                  <p className="font-bold text-lg">6 Hours</p>
                                  <div className="mt-1 space-y-0.5 text-xs opacity-90">
                                    <p>₱4,000 <span className="opacity-70">(Weekdays)</span></p>
                                    <p>₱5,000 <span className="opacity-70">(Weekends)</span></p>
                                  </div>
                                </button>
                                
                                {/* 12 Hours Option */}
                                <button
                                  onClick={() => { setDuration('12'); setTimeSlot(''); }}
                                  className={`p-4 rounded-xl border text-left transition ${
                                    duration === '12'
                                      ? 'bg-brand-blue text-white border-brand-blue'
                                      : 'bg-white text-brand-blue border-brand-blue/20 hover:border-brand-blue/40'
                                  }`}
                                >
                                  <p className="font-bold text-lg">12 Hours</p>
                                  <div className="mt-1 space-y-0.5 text-xs opacity-90">
                                    <p>₱8,000 <span className="opacity-70">(Weekdays)</span></p>
                                    <p>₱10,000 <span className="opacity-70">(Weekends)</span></p>
                                  </div>
                                </button>
                              </div>
                            </div>

                            {/* Time Slot Selector */}
                            <div className="rounded-2xl border border-brand-blue/10 bg-brand-blue/5 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue/50 mb-3">Select {duration}-Hour Time Slot <span className="text-red-500">*</span></p>
                              <div className="flex flex-wrap gap-2">
                                {(duration === '6'
                                  ? ['09:00 AM - 03:00 PM', '03:00 PM - 09:00 PM', '06:00 PM - 12:00 AM']
                                  : ['08:00 AM - 08:00 PM', '10:00 AM - 10:00 PM', '02:00 PM - 02:00 AM']
                                ).map(slot => {
                                  const isMorningSlot = slot.includes('09:00 AM') || slot.includes('08:00 AM') || slot.includes('10:00 AM');
                                  const isPrevNightBooked = checkIn ? !!dateStatuses[formatDate(addDays(checkIn, -1))] : false;
                                  const isDisabled = isPrevNightBooked && isMorningSlot;

                                  return (
                                    <button
                                      key={slot}
                                      onClick={() => !isDisabled && setTimeSlot(slot)}
                                      disabled={isDisabled}
                                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition ${
                                        isDisabled
                                          ? 'bg-brand-blue/5 text-brand-blue/30 border-brand-blue/10 cursor-not-allowed'
                                          : timeSlot === slot
                                            ? 'bg-brand-blue text-white border-brand-blue'
                                            : 'bg-white text-brand-blue border-brand-blue/20 hover:border-brand-blue/40'
                                      }`}
                                      title={isDisabled ? "Guests are checking out at 12:00 PM today." : ""}
                                    >
                                      {slot}
                                    </button>
                                  );
                                })}
                              </div>
                              {checkIn && !!dateStatuses[formatDate(addDays(checkIn, -1))] && (
                                <p className="text-xs text-brand-blue/60 mt-3 font-medium flex items-start gap-1.5">
                                  <svg className="w-4 h-4 text-brand-blue/50 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  Morning slots are unavailable because there are guests checking out at 12:00 PM today.
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="rounded-2xl border border-brand-blue/10 bg-brand-blue/5 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue/50 mb-1">Check-in</p>
                          <p className="font-medium">{checkIn ? checkIn.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : 'Select date'}</p>
                          <p className="text-xs text-brand-blue/60 mt-1">From 2:00 PM</p>
                          {checkIn && (
                            <p className="text-xs text-brand-blue/50 mt-2">{checkIn.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                          )}
                        </div>
                        <div className="rounded-2xl border border-brand-blue/10 bg-brand-blue/5 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue/50 mb-1">Check-out</p>
                          <p className="font-medium">{checkOut ? checkOut.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : 'Select date'}</p>
                          <p className="text-xs text-brand-blue/60 mt-1">By 12:00 PM</p>
                          {checkOut && (
                            <p className="text-xs text-brand-blue/50 mt-2">{checkOut.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                          )}
                        </div>
                        {checkIn && checkOut && (
                          <div className="rounded-2xl border border-brand-blue/10 bg-brand-blue/5 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue/50 mb-1">Duration</p>
                            <p className="font-medium">{nights} night{nights > 1 ? 's' : ''}</p>
                            <p className="text-xs text-brand-blue/60 mt-1">{nights === 1 ? '1 night stay' : `${nights} nights stay`}</p>
                          </div>
                        )}
                      </>
                    )}
                  
                    {checkIn && checkOut && (
                      <div className="mt-2 p-4 rounded-xl border border-brand-blue/10 bg-white w-full">
                        {isCheckingDates ? (
                          <div className="flex items-center gap-3">
                            <svg className="animate-spin h-5 w-5 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span className="font-medium text-sm text-brand-blue/70">Checking availability for selected dates...</span>
                          </div>
                        ) : datesAvailable ? (
                          <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="font-medium text-sm text-green-600">Dates are available!</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              <span className="font-medium text-sm text-red-600">Selected dates are unavailable</span>
                            </div>
                            <div className="pl-8 space-y-1">
                              <p className="text-xs text-brand-blue/60">
                                Your selection: {checkIn.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })} - {checkOut.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                              {conflictingDates && conflictingDates.length > 0 && (
                                <>
                                  <p className="text-xs text-red-500/80 font-medium mt-2">Conflicting with:</p>
                                  {conflictingDates.map((conflict: any, idx: number) => (
                                    <div key={idx} className="text-xs text-brand-blue/60">
                                      {new Date(conflict.checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(conflict.checkOut).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                                      <span className="text-red-500/70 ml-2">({conflict.status})</span>
                                    </div>
                                  ))}
                                </>
                              )}
                              {availabilityError && !conflictingDates && (
                                <p className="text-xs text-red-500/80 mt-2">{availabilityError}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Guest Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold">Guest Details</h2>
                  <p className="text-sm text-brand-blue/60 mt-1">Please provide accurate contact information for booking confirmation.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue/60 mb-2">First Name *</label>
                    <input type="text" value={guestDetails.firstName} onChange={e => setGuestDetails({...guestDetails, firstName: e.target.value})} className="w-full rounded-xl border border-brand-blue/10 bg-white px-4 py-3 outline-none focus:border-brand-blue transition" placeholder="Juan" />
                    {guestDetails.firstName && guestDetails.firstName.replace(/[^a-zA-Z]/g, '').length < 2 && (
                      <p className="text-red-500 text-[10px] mt-1 font-medium">Must contain at least 2 letters.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue/60 mb-2">Last Name *</label>
                    <input type="text" value={guestDetails.lastName} onChange={e => setGuestDetails({...guestDetails, lastName: e.target.value})} className="w-full rounded-xl border border-brand-blue/10 bg-white px-4 py-3 outline-none focus:border-brand-blue transition" placeholder="Dela Cruz" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue/60 mb-2">Email Address *</label>
                    <input type="email" value={guestDetails.email} onChange={e => setGuestDetails({...guestDetails, email: e.target.value})} className="w-full rounded-xl border border-brand-blue/10 bg-white px-4 py-3 outline-none focus:border-brand-blue transition" placeholder="juan@example.com" />
                    {guestDetails.email && !guestDetails.email.includes('@') && (
                      <p className="text-red-500 text-[10px] mt-1 font-medium">Please enter a valid email address.</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue/60 mb-2">Contact Number *</label>
                    <input 
                      type="tel" 
                      value={guestDetails.phone} 
                      onChange={e => {
                        const onlyDigits = e.target.value.replace(/\D/g, '');
                        if (onlyDigits.length <= 11) {
                          setGuestDetails({...guestDetails, phone: onlyDigits});
                        }
                      }} 
                      className="w-full rounded-xl border border-brand-blue/10 bg-white px-4 py-3 outline-none focus:border-brand-blue transition" 
                      placeholder="09123456789" 
                    />
                    {guestDetails.phone && guestDetails.phone.length < 11 && (
                      <p className="text-red-500 text-[10px] mt-1 font-medium">Must be exactly 11 digits (e.g., 09123456789).</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Payment */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {selectedRoomId === 3 ? 'Event Details & Payment' : 'Payment & Verification'}
                  </h2>
                  <p className="text-sm text-brand-blue/60 mt-1">Complete your payment to secure your booking. All payments are verified before confirmation.</p>
                </div>
                
                {selectedRoomId === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue/60">Booking Purpose & Details <span className="text-red-500">*</span></p>
                    <div className="rounded-xl border border-brand-blue/10 bg-white p-4">
                      <p className="text-xs text-brand-blue/60 mb-3">Please specify the purpose of your booking (e.g., Birthday Party, Corporate Meeting, casual hangout) and any specific setup requirements.</p>
                      <textarea 
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-brand-blue/10 bg-brand-blue/5 px-4 py-3 outline-none focus:border-brand-blue transition resize-none"
                        placeholder="E.g. A small birthday gathering for 15 people..."
                      ></textarea>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue/60">1. Select Payment Method</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${paymentDetails.method === 'gcash' ? 'border-brand-blue bg-brand-blue/5' : 'border-brand-blue/10 hover:border-brand-blue/30'}`}>
                      <input type="radio" name="paymentMethod" value="gcash" checked={paymentDetails.method === 'gcash'} onChange={() => setPaymentDetails({...paymentDetails, method: 'gcash'})} className="h-4 w-4 text-brand-blue" />
                      <span className="font-medium">GCash</span>
                    </label>
                    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${paymentDetails.method === 'bank' ? 'border-brand-blue bg-brand-blue/5' : 'border-brand-blue/10 hover:border-brand-blue/30'}`}>
                      <input type="radio" name="paymentMethod" value="bank" checked={paymentDetails.method === 'bank'} onChange={() => setPaymentDetails({...paymentDetails, method: 'bank'})} className="h-4 w-4 text-brand-blue" />
                      <span className="font-medium">Bank Transfer</span>
                    </label>
                  </div>
                </div>

                {/* Payment Details Display */}
                {paymentDetails.method === 'gcash' && (
                  <div className="rounded-2xl border border-brand-blue/10 bg-white p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                    <div 
                      className="w-32 h-32 flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden border border-brand-blue/10 shadow-sm relative group cursor-pointer"
                      onClick={() => setViewQrFullscreen(true)}
                    >
                      <Image src="/img/payment/gcash.jpg" alt="GCash QR Code" fill className="object-cover transition duration-300 group-hover:scale-105" sizes="128px" priority />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                        <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                      </div>
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                      <h3 className="font-semibold text-brand-blue text-lg">GCash Details</h3>
                      <p className="text-brand-blue/80"><span className="font-semibold text-brand-blue">Name:</span> Hermilino Jr. Calubiran</p>
                      <p className="text-brand-blue/80"><span className="font-semibold text-brand-blue">Number:</span> +63 917 887 6444</p>
                      <p className="text-xs text-brand-blue/60 mt-2">Tap the QR code to view and download, or send to the number provided to complete your reservation payment.</p>
                    </div>
                  </div>
                )}

                {paymentDetails.method === 'bank' && (
                  <div className="rounded-2xl border border-brand-blue/10 bg-white p-6 shadow-sm space-y-3">
                    <h3 className="font-semibold text-brand-blue text-lg">Bank Transfer Details</h3>
                    <p className="text-brand-blue/80"><span className="font-semibold text-brand-blue">Bank:</span> BDO Unibank, Inc.</p>
                    <p className="text-brand-blue/80"><span className="font-semibold text-brand-blue">Account Name:</span> Hermilino Calubiran, Jr.</p>
                    <p className="text-brand-blue/80"><span className="font-semibold text-brand-blue">Account Number:</span> 010100143296</p>
                    <p className="text-xs text-brand-blue/60 mt-2">Please transfer the total amount to the bank account provided.</p>
                  </div>
                )}

                <div className="space-y-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-brand-blue/60">2. Upload Requirements <span className="text-red-500">*</span></p>
                  
                  <div className="rounded-xl border border-brand-blue/10 p-4">
                    <p className="block font-medium mb-1">Payment Screenshot</p>
                    <p className="text-xs text-brand-blue/60 mb-3">Please upload a clear screenshot of your successful transaction.</p>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer rounded-full bg-brand-blue/10 px-4 py-2 text-xs font-semibold text-brand-blue transition hover:bg-brand-blue/20">
                        Choose File
                        <input type="file" accept="image/*" onChange={e => setPaymentDetails({...paymentDetails, proof: e.target.files?.[0] || null})} className="hidden" />
                      </label>
                      <span className="text-sm text-brand-blue/70">{paymentDetails.proof ? paymentDetails.proof.name : <span className="text-red-500 text-lg leading-none">*</span>}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-brand-blue/10 p-4">
                    <p className="block font-medium mb-1">Valid ID (Front)</p>
                    <p className="text-xs text-brand-blue/60 mb-3">Upload the front picture of a valid government-issued ID.</p>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer rounded-full bg-brand-blue/10 px-4 py-2 text-xs font-semibold text-brand-blue transition hover:bg-brand-blue/20">
                        Choose File
                        <input type="file" accept="image/*" onChange={e => setPaymentDetails({...paymentDetails, idFront: e.target.files?.[0] || null})} className="hidden" />
                      </label>
                      <span className="text-sm text-brand-blue/70">{paymentDetails.idFront ? paymentDetails.idFront.name : <span className="text-red-500 text-lg leading-none">*</span>}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-brand-blue/10 p-4">
                    <p className="block font-medium mb-1">Valid ID (Back)</p>
                    <p className="text-xs text-brand-blue/60 mb-3">Upload the back picture of the same valid government-issued ID.</p>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer rounded-full bg-brand-blue/10 px-4 py-2 text-xs font-semibold text-brand-blue transition hover:bg-brand-blue/20">
                        Choose File
                        <input type="file" accept="image/*" onChange={e => setPaymentDetails({...paymentDetails, idBack: e.target.files?.[0] || null})} className="hidden" />
                      </label>
                      <span className="text-sm text-brand-blue/70">{paymentDetails.idBack ? paymentDetails.idBack.name : <span className="text-red-500 text-lg leading-none">*</span>}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Rules & Regulations */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold">Rules & Regulations</h2>
                
                <div className="rounded-2xl border border-brand-blue/10 bg-white p-6 space-y-6 text-sm text-brand-blue/80 shadow-inner">
                  <div>
                    <h3 className="font-semibold text-brand-blue mb-2 text-base">Check-in & Check-out</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Check-in: 2:00 PM (Gold and Blue Rooms only)</li>
                      <li>Check-out: 12:00 PM (Gold and Blue Rooms only)</li>
                      <li>Rooftop Lounge: 12-hour booking stay depending on the available and chosen time.</li>
                      <li>Late check-out subject to availability.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-blue mb-2 text-base">General Rules</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>No smoking inside the rooms.</li>
                      <li>No pets allowed.</li>
                      <li>Respect quiet hours (10 PM – 7 AM).</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-blue mb-2 text-base">Cancellation Policy</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Full refund if canceled up to 4 days before check-in.</li>
                      <li>50% refund if canceled 3 days or less before check-in.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-blue mb-2 text-base">Damages & Liability</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Guests are responsible for any damages.</li>
                      <li>Report any issues immediately to staff.</li>
                      <li>Security deposit of ₱3,000 per room is required upon check-in.</li>
                    </ul>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-blue/10 bg-brand-blue/5 p-4 transition hover:border-brand-blue/30">
                  <input type="checkbox" checked={agreedToRules} onChange={(e) => setAgreedToRules(e.target.checked)} className="mt-1 h-4 w-4 rounded text-brand-blue focus:ring-brand-blue" />
                  <span className="text-sm font-medium">
                    I have read and agree to the house rules, cancellation policy, and terms of stay.
                  </span>
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-brand-blue/10">
              <button 
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition ${
                  currentStep === 1 
                    ? 'opacity-0 pointer-events-none' 
                    : 'bg-slate-100 text-brand-blue hover:bg-slate-200'
                }`}
              >
                Back
              </button>
              <button 
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !selectedRoomId) ||
                  (currentStep === 2 && (!checkIn || !checkOut || isCheckingDates || !datesAvailable || (selectedRoomId === 3 && !timeSlot))) ||
                  (currentStep === 3 && !isStep3Valid) ||
                  (currentStep === 4 && !isStep4Valid) ||
                  (currentStep === 5 && (!agreedToRules || isSubmitting))
                }
                className={`px-8 py-2.5 rounded-full font-semibold text-sm transition ${
                  ((currentStep === 1 && !selectedRoomId) || (currentStep === 2 && (!checkIn || !checkOut || isCheckingDates || !datesAvailable || (selectedRoomId === 3 && !timeSlot))) || (currentStep === 3 && !isStep3Valid) || (currentStep === 4 && !isStep4Valid) || (currentStep === 5 && (!agreedToRules || isSubmitting)))
                    ? 'bg-brand-blue/30 text-white cursor-not-allowed'
                    : 'bg-brand-blue text-white hover:bg-[#001a72] shadow-sm'
                }`}
              >
                {currentStep === 5 ? (isSubmitting ? 'Submitting...' : 'Confirm Booking') : 'Continue'}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Booking Summary */}
          <div className="lg:sticky lg:top-24 h-fit bg-brand-blue text-white rounded-[32px] p-8 shadow-lg">
            <h3 className="font-script text-3xl text-brand-yellow mb-6 border-b border-white/10 pb-4">Booking Summary</h3>
            
            <div className="space-y-6 text-sm">
              <div>
                <p className="text-white/60 mb-1 uppercase tracking-wider text-xs">Room / Space</p>
                {selectedRoom ? (
                  <div>
                    <p className="font-medium text-lg">{selectedRoom.name}</p>
                    <button onClick={() => setViewRoomDetails(true)} className="text-xs text-brand-yellow hover:underline mt-1">View Room Details</button>
                  </div>
                ) : (
                  <p className="italic text-white/40">Not selected</p>
                )}
              </div>

              {selectedRoom && (
                <div>
                  <p className="text-white/60 mb-1 uppercase tracking-wider text-xs">Guests</p>
                  <p className="font-medium">{guests} Guest{guests > 1 ? 's' : ''}</p>
                </div>
              )}

              {selectedRoomId === 3 ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-white/60 mb-1 uppercase tracking-wider text-xs">Event Date</p>
                    <p className="font-medium">{checkIn ? checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}</p>
                  </div>
                  {duration && (
                    <div>
                      <p className="text-white/60 mb-1 uppercase tracking-wider text-xs">Duration</p>
                      <p className="font-medium">{duration} Hours</p>
                    </div>
                  )}
                  {timeSlot && (
                    <div>
                      <p className="text-white/60 mb-1 uppercase tracking-wider text-xs">Time Slot</p>
                      <p className="font-medium">{timeSlot}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 mb-1 uppercase tracking-wider text-xs">Check-in</p>
                      <p className="font-medium">{checkIn ? checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}</p>
                    </div>
                    <div>
                      <p className="text-white/60 mb-1 uppercase tracking-wider text-xs">Check-out</p>
                      <p className="font-medium">{checkOut ? checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}</p>
                    </div>
                  </div>
                  {nights > 0 && (
                     <div>
                       <p className="text-white/60 mb-1 uppercase tracking-wider text-xs">Duration</p>
                       <p className="font-medium">{nights} Night{nights > 1 ? 's' : ''}</p>
                     </div>
                  )}
                </div>
              )}

              <div className="border-t border-white/10 pt-6 mt-6">
                <div className="flex justify-between items-end">
                  <span className="text-white/80">Total Due</span>
                  <span className="text-2xl font-bold text-brand-yellow tracking-wider">
                    {roomTotal !== null ? `₱${roomTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'TBA'}
                  </span>
                </div>
                {roomTotal !== null && (
                   <p className="text-right text-xs text-white/50 mt-1">Taxes and fees included</p>
                )}
              </div>
            </div>

            {/* Trust Badges / Info */}
            <div className="mt-8 pt-6 border-t border-white/10 space-y-3 text-xs text-white/60">
              <div className="flex items-center gap-2">
                 <svg className="w-4 h-4 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                 Secure booking
              </div>
              <div className="flex items-center gap-2">
                 <svg className="w-4 h-4 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 Flexible cancellation options
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function BookNowPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-brand-blue font-semibold">
        Loading Booking System...
      </div>
    }>
      <BookNowContent />
    </Suspense>
  );
}

function RoomDetailsModal({ room, onClose }: { room: any, onClose: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const handlePrev = () => setCurrentIdx(prev => prev === 0 ? room.imagesCount - 1 : prev - 1);
  const handleNext = () => setCurrentIdx(prev => prev === room.imagesCount - 1 ? 0 : prev + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] overflow-hidden max-w-2xl w-full shadow-lg relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 text-white hover:bg-black/40 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        {/* Carousel */}
        <div className="relative h-64 sm:h-80 bg-slate-100 flex-shrink-0">
          <Image src={`/img/${room.folder}/${room.prefix}${currentIdx + 1}.jpg`} alt={room.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 500px" priority />
          <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-brand-blue/80 hover:bg-brand-blue p-2 text-white transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-brand-blue/80 hover:bg-brand-blue p-2 text-white transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white bg-brand-blue/60 px-3 py-1 rounded-full">
            {currentIdx + 1} / {room.imagesCount}
          </div>
        </div>

        {/* Details */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          <h3 className="text-2xl font-semibold text-brand-blue mb-4">{room.name}</h3>
          <div className="grid gap-2 text-sm text-brand-blue/70 sm:grid-cols-2">
            {room.features.map((feature: string, idx: number) => (
              <p key={idx} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                {feature}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
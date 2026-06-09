'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Define the shape of your booking data to eliminate TypeScript 'any' errors
interface Booking {
  id: number;
  confirmation_code: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  room_id: number;
  check_in: string;
  check_out: string;
  total_price: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export default function SystemPortal() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Wrap in useCallback so it can be safely used in useEffect without warnings
  const fetchBookings = useCallback(async (pwd: string, currentUser?: string) => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/admin/bookings`, {
        headers: {
          'x-api-key': pwd
        }
      });
      const data: Booking[] | { error: string } = await res.json();
      
      if (res.ok) {
        setBookings(data as Booking[]);
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_pwd', pwd); // Save session
        sessionStorage.setItem('admin_user', currentUser || username || 'admin');
      } else {
        setError((data as { error: string }).error || 'Access Denied. Incorrect password.');
        sessionStorage.removeItem('admin_pwd');
        sessionStorage.removeItem('admin_user');
      }
    } catch (err) {
      setError('Network error. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Attempt to auto-login if password is saved in session
  useEffect(() => {
    const savedPwd = sessionStorage.getItem('admin_pwd');
    const savedUser = sessionStorage.getItem('admin_user');
    if (savedPwd && savedUser) {
      setUsername(savedUser);
      setPassword(savedPwd);
      fetchBookings(savedPwd, savedUser);
    }
  }, [fetchBookings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username !== 'admin') {
      setError('Invalid username or password.');
      return;
    }
    fetchBookings(password);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setBookings([]);
    setSearchTerm('');
    setFilterStatus('all');
    sessionStorage.removeItem('admin_pwd');
    sessionStorage.removeItem('admin_user');
  };

  const updateStatus = async (id: number, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this booking as ${newStatus.toUpperCase()}?`)) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': password
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        fetchBookings(password); // Refresh the table
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      alert('Network error while updating status.');
    }
  };

  const getRoomName = (roomId: number) => {
    switch (roomId) {
      case 1: return 'Gold Room';
      case 2: return 'Blue Room';
      case 3: return 'Rooftop Lounge';
      default: return 'Unknown';
    }
  };

  // Format date to local string
  const displayDate = (dateStr: string) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Derived states for filtering and stats
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = 
      b.confirmation_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${b.guest_first_name} ${b.guest_last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f3f6fb] flex items-center justify-center p-6 font-sans text-brand-blue">
        <div className="bg-white p-10 border border-brand-blue/5 rounded-[32px] w-full max-w-sm shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-script text-brand-blue">System Admin</h1>
            <p className="text-sm text-brand-blue/70 mt-2">Please authenticate to continue.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue/60 mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-brand-blue/10 bg-white px-4 py-3 outline-none focus:border-brand-blue transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-blue/60 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-brand-blue/10 bg-white px-4 py-3 outline-none focus:border-brand-blue transition"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-blue text-white rounded-full py-3 mt-2 text-sm font-semibold hover:bg-[#001a72] shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- DASHBOARD SCREEN ---
  return (
    <main className="min-h-screen bg-[#f3f6fb] p-6 sm:p-10 font-sans text-brand-blue">
      <div className="max-w-[100rem] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-5xl font-script text-brand-blue">Booking Logs</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 border border-brand-blue/5 rounded-[24px] shadow-sm flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue/60">Total Bookings</span>
            <span className="text-4xl font-bold text-brand-blue mt-2">{bookings.length}</span>
          </div>
          <div className="bg-white p-6 border border-brand-blue/5 rounded-[24px] shadow-sm flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue/60">Pending Approvals</span>
            <span className="text-4xl font-bold text-yellow-500 mt-2">{pendingCount}</span>
          </div>
          <div className="bg-white p-6 border border-brand-blue/5 rounded-[24px] shadow-sm flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue/60">Confirmed</span>
            <span className="text-4xl font-bold text-green-500 mt-2">{confirmedCount}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between bg-white p-6 border border-brand-blue/5 rounded-[24px] shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search Code or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-brand-blue/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue transition w-full sm:w-64 bg-white"
            />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-brand-blue/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue transition bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button onClick={() => fetchBookings(password)} className="px-6 py-3 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-semibold hover:bg-brand-blue/20 transition">
              Refresh Data
            </button>
            <button onClick={handleLogout} className="px-6 py-3 bg-accent text-brand-blue rounded-full text-sm font-semibold hover:bg-yellow-400 transition shadow-sm">
              Sign Out
            </button>
          </div>
        </div>

        <div className="bg-white border border-brand-blue/5 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-brand-blue/5 text-xs uppercase tracking-wider text-brand-blue/60 border-b border-brand-blue/10">
                  <th className="p-5 font-semibold">Ref Code</th>
                  <th className="p-5 font-semibold">Guest Info</th>
                  <th className="p-5 font-semibold">Space</th>
                  <th className="p-5 font-semibold">Schedule</th>
                  <th className="p-5 font-semibold">Amount</th>
                  <th className="p-5 font-semibold w-48">Notes / Requests</th>
                  <th className="p-5 font-semibold">Status</th>
                  <th className="p-5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-brand-blue/5">
                {filteredBookings.length === 0 ? (
                  <tr><td colSpan={8} className="p-10 text-center text-brand-blue/50 italic">No records found matching your criteria.</td></tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-brand-blue/5 transition duration-150">
                      <td className="p-5 font-mono font-semibold text-brand-blue">{b.confirmation_code}</td>
                      <td className="p-5">
                        <p className="font-semibold text-brand-blue">{b.guest_first_name} {b.guest_last_name}</p>
                        <p className="text-xs text-brand-blue/60 mt-1">{b.guest_email}</p>
                        <p className="text-xs text-brand-blue/60">{b.guest_phone}</p>
                      </td>
                      <td className="p-5 font-medium text-brand-blue">{getRoomName(b.room_id)}</td>
                      <td className="p-5 whitespace-nowrap text-brand-blue">{displayDate(b.check_in)} <br/><span className="text-brand-blue/50 text-xs">to</span> {displayDate(b.check_out)}</td>
                      <td className="p-5 font-semibold text-brand-blue">₱{parseFloat(b.total_price).toLocaleString()}</td>
                      <td className="p-5 text-xs text-brand-blue/70 whitespace-pre-wrap">{b.purpose || '--'}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                          b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-wrap gap-2">
                          {b.status === 'pending' && (
                            <>
                              <button onClick={() => updateStatus(b.id, 'confirmed')} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-full transition shadow-sm">Confirm</button>
                              <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-full transition shadow-sm">Cancel</button>
                            </>
                          )}
                          {b.status === 'confirmed' && (
                            <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-full transition shadow-sm">Cancel</button>
                          )}
                          {b.status === 'cancelled' && (
                            <button onClick={() => updateStatus(b.id, 'pending')} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded-full transition shadow-sm">Revert</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
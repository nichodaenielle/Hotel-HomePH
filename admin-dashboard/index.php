<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Admin Dashboard - Hotel at Home</title>
    <link rel="icon" type="image/png" href="/favicon.png?v=2">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
        @font-face {
            font-family: 'ITC Edwardian Script';
            src: url('/fonts/edwardianscriptitc.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }
        body { font-family: 'DM Sans', sans-serif; background-color: #f3f6fb; color: #011478; margin: 0; padding: clamp(10px, 2vw, 20px); min-height: 100vh; box-sizing: border-box; }
        .container { max-width: 1400px; width: 100%; margin: 0 auto; background: white; border-radius: clamp(16px, 2vw, 32px); box-shadow: 0 4px 20px rgba(1, 20, 120, 0.05); border: 1px solid rgba(1, 20, 120, 0.05); display: flex; flex-direction: column; min-height: calc(100vh - 40px); }
        header { background-color: white; color: #011478; border-bottom: 1px solid rgba(1, 20, 120, 0.05); padding: clamp(12px, 2vw, 20px) clamp(20px, 3vw, 40px); flex-shrink: 0; }
        header h1 { margin: 0; font-family: 'ITC Edwardian Script', cursive; font-size: clamp(28px, 4vw, 40px); font-weight: normal; line-height: 1.1; }
        header p { margin: 4px 0 0; color: rgba(1, 20, 120, 0.7); font-size: clamp(13px, 1.5vw, 15px); }
        .content { padding: clamp(15px, 2vw, 20px) clamp(20px, 3vw, 40px); flex: 1; display: flex; flex-direction: column; min-height: 0; }
        .table-container { position: relative; overflow: auto; flex: 1; min-height: min(300px, 40vh); max-height: calc(100vh - 350px); isolation: isolate; }
        table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; }
        th, td { padding: 16px 15px; text-align: left; border-bottom: 1px solid rgba(1, 20, 120, 0.05); }
        th { position: sticky; top: 0; background-color: #f8fafc !important; z-index: 9999; font-weight: 700; text-transform: uppercase; font-size: 12px; color: #011478; letter-spacing: 0.5px; border-bottom: 2px solid #011478; }
        td { position: relative; z-index: auto; background-color: white; }
        .row-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: #011478; }
        .action-group { display: flex; gap: 6px; align-items: center; }
        th:hover { background-color: #f1f5f9 !important; }
        .sort-icon { font-size: 10px; color: #011478; margin-left: 4px; opacity: 0.5; }
        th:hover .sort-icon { opacity: 1; }
        tr:hover { background-color: rgba(1, 20, 120, 0.02); }
        select { padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(1, 20, 120, 0.15); font-family: inherit; font-size: 14px; outline: none; transition: border-color 0.2s; color: #011478; background-color: white; }
        select:focus { border-color: #011478; }
        #loader { text-align: center; padding: 40px; font-weight: 500; color: rgba(1, 20, 120, 0.6); }
        
        /* Skeleton Loader Styles */
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-text { height: 14px; margin-bottom: 8px; }
        .skeleton-text-sm { height: 12px; width: 60%; }
        .skeleton-cell { height: 20px; }
        .btn-signout { background-color: #facc15; color: #011478; border: none; padding: 10px 20px; border-radius: 9999px; font-weight: 600; cursor: pointer; font-family: inherit; font-size: 14px; transition: filter 0.2s; }
        .btn-signout:hover { filter: brightness(0.95); }
        .login-input { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(1, 20, 120, 0.15); font-family: inherit; font-size: 15px; box-sizing: border-box; outline: none; transition: border-color 0.2s, box-shadow 0.2s; color: #011478; }
        .login-input:focus { border-color: #011478; box-shadow: 0 0 0 2px rgba(1, 20, 120, 0.1); }
        .login-label { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; color: rgba(1, 20, 120, 0.6); margin-bottom: 8px; letter-spacing: 0.5px; }
        .btn-submit { width: 100%; background-color: #011478; color: white; border: none; padding: 16px; border-radius: 9999px; font-weight: 600; cursor: pointer; font-family: inherit; font-size: 15px; transition: background-color 0.2s; margin-top: 10px; }
        .btn-submit:hover { background-color: #001a72; }
        .header-flex { display: flex; justify-content: space-between; align-items: center; }
        
        /* Dashboard Stats & Toolbar Styles */
        .stats-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: clamp(10px, 1.5vw, 15px); margin-bottom: clamp(15px, 2vw, 20px); }
        .stat-card { background: white; padding: clamp(12px, 1.5vw, 16px); border-radius: clamp(12px, 1.5vw, 16px); border: 1px solid rgba(1, 20, 120, 0.05); box-shadow: 0 4px 15px rgba(1, 20, 120, 0.03); display: flex; flex-direction: column; gap: 4px;}
        .stat-card h3 { margin: 0; font-size: clamp(10px, 1vw, 11px); color: rgba(1, 20, 120, 0.6); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .stat-card p { margin: 0; font-size: clamp(18px, 2.5vw, 22px); font-weight: 700; color: #011478; }
        
        .toolbar { display: flex; flex-wrap: wrap; gap: clamp(10px, 1.5vw, 15px); margin-bottom: clamp(15px, 2vw, 20px); }
        .toolbar-search { flex: 1; min-width: min(250px, 100%); padding: clamp(10px, 1.5vw, 12px) clamp(12px, 1.5vw, 16px); border-radius: 12px; border: 1px solid rgba(1, 20, 120, 0.15); font-family: inherit; font-size: clamp(13px, 1.5vw, 14px); color: #011478; outline: none; transition: border-color 0.2s; }
        .toolbar-search:focus { border-color: #011478; }
        .toolbar-filter { padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(1, 20, 120, 0.15); font-family: inherit; font-size: 14px; color: #011478; background-color: white; outline: none; }
        .btn-export { background-color: #f3f6fb; color: #011478; border: 1px solid rgba(1, 20, 120, 0.15); padding: 12px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; font-family: inherit; font-size: 14px; transition: background-color 0.2s; }
        .btn-export:hover { background-color: #e5e9f2; }
        .btn-icon { background-color: #f3f6fb; border: 1px solid rgba(1, 20, 120, 0.15); padding: 12px; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: background-color 0.2s; }
        .btn-icon:hover { background-color: #e5e9f2; }
        .btn-icon svg { stroke: #011478; }
        .toolbar-actions { display: flex; gap: 15px; flex-wrap: wrap; }
        
        /* Action Buttons */
        .btn-action { padding: 6px 12px; border-radius: 8px; border: none; font-weight: 600; font-size: 12px; cursor: pointer; font-family: inherit; color: white; transition: opacity 0.2s; }
        .btn-action:hover { opacity: 0.9; }
        .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-action.confirm { background-color: #166534; }
        .btn-action.cancel { background-color: #991b1b; }
        .btn-action.contact { background-color: #011478; }

        /* Empty State Styles */
        .empty-state { text-align: center; padding: 60px 20px; color: rgba(1, 20, 120, 0.6); }
        .empty-state-icon { width: 80px; height: 80px; margin: 0 auto 20px; background: #f3f6fb; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .empty-state-icon svg { width: 40px; height: 40px; stroke: #011478; opacity: 0.4; }
        .empty-state h3 { margin: 0 0 8px 0; font-size: 18px; color: #011478; font-weight: 600; }
        .empty-state p { margin: 0; font-size: 14px; }
        .empty-state button { margin-top: 16px; padding: 10px 20px; background: #011478; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
        .empty-state button:hover { background-color: #001a72; }

        /* Status Badge Styles */
        .status { padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 6px; }
        .status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
        .status-pending { background-color: #fffbeb; color: #b45309; }
        .status-pending::before { background-color: #f59e0b; }
        .status-confirmed { background-color: #f0fdf4; color: #166534; }
        .status-confirmed::before { background-color: #22c55e; }
        .status-cancelled { background-color: #fee2e2; color: #991b1b; }
        .status-cancelled::before { background-color: #ef4444; }
        .status-blocked { background-color: #f3f4f6; color: #6b7280; }
        .status-blocked::before { background-color: #9ca3af; }

        /* Last Updated Timestamp */
        .last-updated { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(1, 20, 120, 0.6); margin-left: auto; padding: 8px 12px; background: #f3f6fb; border-radius: 8px; }
        .last-updated svg { width: 14px; height: 14px; }
        .refreshing { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* Calendar Styles - Enhanced */
        .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0; padding: 0 8px; }
        .calendar-header h2 { margin: 0; font-size: 24px; font-weight: 700; color: #011478; letter-spacing: -0.5px; }
        .calendar-header .btn-icon { width: 40px; height: 40px; border-radius: 12px; background: #f8fafc; border: 2px solid rgba(1, 20, 120, 0.1); transition: all 0.2s ease; }
        .calendar-header .btn-icon:hover { background: #011478; border-color: #011478; }
        .calendar-header .btn-icon:hover svg { stroke: white; }
        
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; padding: 8px; }
        .calendar-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 12px; flex-shrink: 0; padding: 0 8px; }
        .calendar-day-header { text-align: center; font-size: 12px; font-weight: 700; color: #011478; text-transform: uppercase; padding: 8px 4px; background: #f8fafc; border-radius: 8px; }
        
        .calendar-day { 
            min-height: 90px; 
            border: 2px solid transparent; 
            border-radius: 12px; 
            padding: 8px; 
            display: flex; 
            flex-direction: column; 
            background: white; 
            box-shadow: 0 2px 8px rgba(1, 20, 120, 0.04);
            transition: all 0.2s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        .calendar-day:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 24px rgba(1, 20, 120, 0.12);
            border-color: rgba(1, 20, 120, 0.15);
        }
        .calendar-day.empty { background: transparent; border: none; box-shadow: none; cursor: default; }
        .calendar-day.empty:hover { transform: none; box-shadow: none; }
        .calendar-day.today { 
            border-color: #011478; 
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            box-shadow: 0 4px 12px rgba(1, 20, 120, 0.15);
        }
        .calendar-day.today .calendar-date { 
            background: #011478; 
            color: white; 
            width: 28px; 
            height: 28px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
        }
        .calendar-day.past { opacity: 0.5; background: #f8fafc; }
        .calendar-day.weekend { background: linear-gradient(135deg, #fefce8 0%, #ffffff 100%); }
        
        .calendar-date { 
            font-size: 14px; 
            font-weight: 700; 
            color: #011478; 
            margin-bottom: 6px; 
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 28px;
            height: 28px;
        }
        .cal-badges-container { display: flex; flex-direction: column; gap: 4px; flex: 1; overflow: hidden; }
        .cal-badge { 
            font-size: 11px; 
            padding: 5px 8px; 
            border-radius: 6px; 
            font-weight: 600; 
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            text-align: left; 
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid transparent;
        }
        .cal-badge:hover { transform: scale(1.02); }
        .cal-badge::before {
            content: '';
            width: 6px;
            height: 6px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .cal-pending { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
        .cal-pending::before { background: #f59e0b; }
        .cal-confirmed { background: #dbeafe; color: #1e40af; border-color: #93c5fd; }
        .cal-confirmed::before { background: #3b82f6; }
        .cal-block { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
        .cal-block::before { background: #ef4444; }
        
        .calendar-summary { 
            display: flex; 
            gap: 16px; 
            margin-bottom: 20px; 
            padding: 16px; 
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); 
            border-radius: 16px; 
            border: 1px solid rgba(1, 20, 120, 0.08);
        }
        .calendar-summary-item { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            padding: 12px 20px; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 2px 8px rgba(1, 20, 120, 0.04);
            min-width: 100px;
        }
        .calendar-summary-value { font-size: 24px; font-weight: 700; color: #011478; }
        .calendar-summary-label { font-size: 11px; color: rgba(1, 20, 120, 0.6); text-transform: uppercase; font-weight: 600; margin-top: 4px; }
        
        .calendar-filters {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
            padding: 0 8px;
            flex-wrap: wrap;
        }
        .calendar-filter-btn {
            padding: 8px 16px;
            border-radius: 20px;
            border: 2px solid rgba(1, 20, 120, 0.15);
            background: white;
            color: #011478;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .calendar-filter-btn:hover { border-color: #011478; background: #f8fafc; }
        .calendar-filter-btn.active { background: #011478; color: white; border-color: #011478; }
        .calendar-filter-btn .dot { width: 8px; height: 8px; border-radius: 50%; }
        .calendar-filter-btn .dot.gold { background: #fbbf24; }
        .calendar-filter-btn .dot.blue { background: #60a5fa; }
        .calendar-filter-btn .dot.rooftop { background: #a855f7; }
        
        .calendar-legend { 
            display: flex; 
            gap: 24px; 
            padding: 16px 20px; 
            background: white; 
            border-radius: 12px; 
            border: 1px solid rgba(1, 20, 120, 0.1);
            margin-top: 16px;
            flex-shrink: 0;
        }
        .calendar-legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: rgba(1, 20, 120, 0.8); }
        .calendar-legend-dot { width: 14px; height: 14px; border-radius: 4px; border: 2px solid transparent; }
        .calendar-legend-dot.pending { background: #fef3c7; border-color: #fcd34d; }
        .calendar-legend-dot.confirmed { background: #dbeafe; border-color: #93c5fd; }
        .calendar-legend-dot.blocked { background: #fee2e2; border-color: #fca5a5; }
        .calendar-legend-dot.today { background: #011478; }
        
        .day-bookings-modal { max-width: 400px !important; }
        .day-booking-item {
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .day-booking-item.pending { background: #fef3c7; }
        .day-booking-item.confirmed { background: #dbeafe; }
        .day-booking-item.blocked { background: #fee2e2; }
        .day-booking-info { display: flex; flex-direction: column; }
        .day-booking-guest { font-weight: 600; color: #011478; font-size: 14px; }
        .day-booking-code { font-size: 12px; color: rgba(1, 20, 120, 0.6); }
        .day-booking-room { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 12px; }
        
        /* Calendar Responsive Adjustments */
        .calendar-modal-wrapper { width: 95vw !important; max-width: 1200px !important; height: 90vh !important; max-height: 800px !important; display: flex; flex-direction: column; overflow: hidden !important; border-radius: 24px; }
        .calendar-modal-wrapper #calendar-grid { flex: 1; overflow-y: auto; padding-right: 8px; align-content: start; }
        @media (max-width: 768px) {
            .calendar-day { min-height: 70px; padding: 6px; }
            .calendar-day-header { font-size: 10px; padding: 6px 2px; }
            .calendar-grid, .calendar-weekdays { gap: 4px; }
            .cal-badge { font-size: 9px; padding: 3px 5px; }
            .calendar-summary { flex-wrap: wrap; }
            .calendar-summary-item { min-width: 80px; padding: 10px 14px; }
        }

        /* Modal Styles */
        .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(1, 20, 120, 0.4); z-index: 1000; justify-content: center; align-items: center; }
        .modal-container { background: white; border-radius: 24px; padding: 32px; width: 90%; max-width: 500px; box-shadow: 0 10px 40px rgba(1, 20, 120, 0.1); }
        .modal-title { margin: 0 0 16px 0; font-size: 20px; color: #011478; }
        .modal-desc { margin: 0 0 20px 0; font-size: 14px; color: rgba(1, 20, 120, 0.7); line-height: 1.5; }
        .modal-textarea { width: 100%; height: 220px; padding: 16px; border-radius: 12px; border: 1px solid rgba(1, 20, 120, 0.15); font-family: inherit; font-size: 14px; box-sizing: border-box; resize: vertical; outline: none; transition: border-color 0.2s; color: #011478; margin-bottom: 12px; }
        .modal-textarea:focus { border-color: #011478; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
        .btn-modal { padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; font-family: inherit; font-size: 14px; border: none; transition: background-color 0.2s; }
        .btn-modal-cancel { background-color: #f3f6fb; color: #011478; border: 1px solid rgba(1, 20, 120, 0.15); }
        .btn-modal-cancel:hover { background-color: #e5e9f2; }
        .btn-modal-submit { background-color: #011478; color: white; }
        .btn-modal-submit:hover { background-color: #001a72; }
        .btn-reason { padding: 6px 12px; border-radius: 8px; font-size: 12px; background-color: #f3f6fb; color: #011478; border: 1px solid rgba(1, 20, 120, 0.15); cursor: pointer; transition: background-color 0.2s; font-family: inherit; }
        .btn-reason:hover { background-color: #e5e9f2; }
        .mobile-menu { display: none; position: relative; }
        .hamburger-btn { background: none; border: none; padding: 5px; cursor: pointer; display: flex; align-items: center; }
        .mobile-menu-content {
            display: none;
            position: absolute;
            right: 0;
            top: calc(100% + 5px);
            background-color: white;
            min-width: 140px;
            box-shadow: 0 8px 16px rgba(1, 20, 120, 0.1);
            z-index: 1001;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(1, 20, 120, 0.05);
        }
        .mobile-menu-content.show { display: block; }
        .mobile-menu-content a { color: #011478; padding: 12px 16px; text-decoration: none; display: block; font-size: 14px; font-weight: 500; }
        .mobile-menu-content a:hover { background-color: #f3f6fb; }

        #dashboard-screen.container {
            height: 100%;
            flex-direction: column;
        }
        #dashboard-screen .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
        }
        #bookings-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            overflow-y: auto;
        }
        #analytics-section {
            flex: 1;
            display: none;
            flex-direction: column;
            min-height: 0;
            overflow-y: auto;
        }
        #analytics-section.active {
            display: flex;
        }
        #availability-section {
            flex: 1;
            display: none;
            flex-direction: column;
            min-height: 0;
            overflow-y: auto;
        }
        #availability-section.active {
            display: flex;
        }
        
        /* Room Availability Section Styles */
        .room-avail-card {
            background: white;
            border-radius: 20px;
            border: 1px solid rgba(1, 20, 120, 0.08);
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(1, 20, 120, 0.06);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .room-avail-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(1, 20, 120, 0.12);
        }
        
        /* Mini Calendar Grid Styles */
        .mini-calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 4px;
        }
        .mini-calendar-day {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 600;
            border-radius: 6px;
            background: #f1f5f9;
            color: rgba(1, 20, 120, 0.4);
            cursor: default;
        }
        .mini-calendar-day.available {
            background: #dcfce7;
            color: #166534;
        }
        .mini-calendar-day.booked {
            background: #011478;
            color: white;
        }
        .mini-calendar-day.pending {
            background: #fef3c7;
            color: #92400e;
        }
        .mini-calendar-day.blocked {
            background: #fee2e2;
            color: #991b1b;
        }
        .mini-calendar-day.today {
            border: 2px solid #011478;
            background: white;
            color: #011478;
        }
        
        /* Timeline Enhanced */
        .timeline-container {
            display: flex;
            gap: 3px;
            height: 50px;
            border-radius: 12px;
            overflow: hidden;
            background: #f1f5f9;
            padding: 4px;
        }
        .timeline-day {
            flex: 1;
            border-radius: 6px;
            transition: all 0.2s ease;
            cursor: pointer;
            position: relative;
        }
        .timeline-day:hover {
            transform: scaleY(1.1);
            z-index: 10;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .timeline-day.available { background: #dcfce7; }
        .timeline-day.booked { background: #011478; }
        .timeline-day.pending { background: #fef3c7; }
        .timeline-day.blocked { background: #fee2e2; }
        .timeline-day.today { border: 2px solid #011478; }
        
        /* Occupancy Badge */
        .occupancy-badge {
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            background: rgba(255,255,255,0.2);
            color: white;
            backdrop-filter: blur(4px);
        }
        .occupancy-badge.high { background: rgba(239, 68, 68, 0.2); color: #fee2e2; }
        .occupancy-badge.medium { background: rgba(245, 158, 11, 0.2); color: #fef3c7; }
        .occupancy-badge.low { background: rgba(34, 197, 94, 0.2); color: #dcfce7; }
        
        .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }

        /* Bulk Action Styles */
        .bulk-actions-bar { display: none; align-items: center; gap: 12px; padding: 12px 16px; background: #011478; color: white; border-radius: 12px; margin-bottom: 16px; animation: slideDown 0.3s ease-out; }
        .bulk-actions-bar.active { display: flex; }
        .bulk-actions-bar span { font-size: 14px; font-weight: 500; }
        .bulk-actions-bar button { padding: 8px 16px; border-radius: 8px; border: none; font-weight: 600; font-size: 13px; cursor: pointer; transition: opacity 0.2s; }
        .bulk-actions-bar button:hover { opacity: 0.9; }
        .btn-bulk-verify { background: #0ea5e9; color: white; }
        .btn-bulk-confirm { background: #166534; color: white; }
        .btn-bulk-cancel { background: #991b1b; color: white; }
        .btn-bulk-export { background: white; color: #011478; }
        .bulk-select-all { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: rgba(1, 20, 120, 0.7); margin-bottom: 12px; }
        .bulk-select-all input { width: 18px; height: 18px; cursor: pointer; accent-color: #011478; }
        tr.selected { background-color: rgba(1, 20, 120, 0.05); }
        tr.selected:hover { background-color: rgba(1, 20, 120, 0.08); }
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        /* Analytics Section Styles - now defined above with IDs */
        .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr)); gap: clamp(15px, 2vw, 20px); margin-bottom: clamp(15px, 2vw, 20px); }
        .analytics-card { background: white; border-radius: clamp(12px, 1.5vw, 16px); padding: clamp(15px, 2vw, 20px); border: 1px solid rgba(1, 20, 120, 0.05); box-shadow: 0 4px 15px rgba(1, 20, 120, 0.03); }
        .analytics-card h3 { margin: 0 0 16px 0; font-size: 14px; color: rgba(1, 20, 120, 0.6); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .analytics-card.full-width { grid-column: 1 / -1; }
        .chart-container { position: relative; height: clamp(200px, 30vh, 280px); }
        .chart-container.large { height: clamp(280px, 40vh, 380px); }
        .stat-highlight { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .stat-highlight-value { font-size: 32px; font-weight: 700; color: #011478; }
        .stat-highlight-label { font-size: 12px; color: rgba(1, 20, 120, 0.6); text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-highlight-change { padding: 4px 8px; border-radius: 8px; font-size: 12px; font-weight: 600; }
        .stat-highlight-change.positive { background: #f0fdf4; color: #166534; }
        .stat-highlight-change.negative { background: #fee2e2; color: #991b1b; }
        .analytics-filters { display: flex; gap: clamp(10px, 1.5vw, 12px); margin-bottom: clamp(15px, 2vw, 20px); flex-wrap: wrap; }
        .analytics-filter { padding: clamp(8px, 1.5vw, 10px) clamp(12px, 1.5vw, 16px); border-radius: 12px; border: 1px solid rgba(1, 20, 120, 0.15); font-family: inherit; font-size: clamp(13px, 1.5vw, 14px); color: #011478; background: white; outline: none; }
        .analytics-filter:focus { border-color: #011478; }
        .tab-navigation { display: flex; gap: clamp(6px, 1vw, 8px); margin-bottom: clamp(15px, 2vw, 20px); border-bottom: 1px solid rgba(1, 20, 120, 0.1); padding-bottom: clamp(10px, 1.5vw, 12px); flex-wrap: wrap; }
        .tab-btn { padding: clamp(8px, 1.5vw, 10px) clamp(14px, 2vw, 20px); border-radius: 12px; border: none; background: transparent; font-family: inherit; font-size: clamp(13px, 1.5vw, 14px); font-weight: 600; color: rgba(1, 20, 120, 0.6); cursor: pointer; transition: all 0.2s; }
        .tab-btn:hover { background: rgba(1, 20, 120, 0.05); color: #011478; }
        .tab-btn.active { background: #011478; color: white; }
        .kpis-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: clamp(12px, 1.5vw, 15px); margin-bottom: clamp(15px, 2vw, 20px); }
        .kpi-card { background: white; border-radius: clamp(12px, 1.5vw, 16px); padding: clamp(15px, 2vw, 20px); border: 1px solid rgba(1, 20, 120, 0.05); display: flex; flex-direction: column; }
        .kpi-card h4 { margin: 0 0 8px 0; font-size: 12px; color: rgba(1, 20, 120, 0.6); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .kpi-value { font-size: 28px; font-weight: 700; color: #011478; margin-bottom: 4px; }
        .kpi-subtext { font-size: 12px; color: rgba(1, 20, 120, 0.5); }

        /* Toast Notification Styles */
        .toast-container { position: fixed; top: 20px; right: 20px; z-index: 2000; display: flex; flex-direction: column; gap: 10px; }
        .toast { min-width: 300px; padding: 16px 20px; border-radius: 12px; background: white; box-shadow: 0 4px 20px rgba(1, 20, 120, 0.15); display: flex; align-items: center; gap: 12px; animation: slideIn 0.3s ease-out; }
        .toast-success { border-left: 4px solid #166534; }
        .toast-error { border-left: 4px solid #991b1b; }
        .toast-info { border-left: 4px solid #011478; }
        .toast-icon { flex-shrink: 0; width: 24px; height: 24px; }
        .toast-message { flex: 1; font-size: 14px; color: #011478; }
        .toast-close { flex-shrink: 0; background: none; border: none; cursor: pointer; color: rgba(1, 20, 120, 0.5); font-size: 18px; padding: 0; }
        .toast-close:hover { color: #011478; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }

        /* Large Screen Optimizations */
        @media (min-width: 1400px) {
            .container { max-width: 1600px; }
            .analytics-grid { grid-template-columns: repeat(3, 1fr); }
            .analytics-card.full-width { grid-column: 1 / -1; }
            .kpis-grid { grid-template-columns: repeat(4, 1fr); }
            .table-container { max-height: calc(100vh - 300px); }
        }

        @media (min-width: 1800px) {
            .container { max-width: 90vw; }
            .analytics-grid { grid-template-columns: repeat(4, 1fr); }
            .analytics-card.full-width { grid-column: 1 / -1; }
        }

        /* Mobile Responsive Styles */
        @media (max-width: 796px) {
            body { min-height: auto; padding: 10px; }
            .container { border-radius: 20px; min-height: auto; }
            #dashboard-screen.container { min-height: auto; }
            #dashboard-screen .content { display: block; padding: 15px; overflow: visible; }
            #bookings-section, #analytics-section { overflow: visible; }
            header { padding: 15px; position: relative; }
            header h1 { font-size: 24px; }
            header p { font-size: 13px; }
            .header-flex { justify-content: center; }
            .header-title-container { text-align: center; }
            .desktop-signout { display: none; }
            .mobile-menu { display: block; position: absolute; right: 15px; top: 15px; transform: none; }
            .stats-container {
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            .stats-container .stat-card:last-child {
                display: flex;
            }
            .stat-card { padding: 12px; }
            .stat-card h3 { font-size: 9px; }
            .stat-card p { font-size: 18px; }
            .toolbar { flex-direction: column; gap: 10px; }
            .toolbar-actions { width: 100%; flex-wrap: wrap; }
            .toolbar-actions > .toolbar-filter { flex-grow: 1; min-width: 100px; }
            .toolbar-actions > .btn-icon { flex-shrink: 0; }
            table { min-width: 850px; } /* Triggers horizontal swipe for the table */
            .modal-container { padding: 20px; width: 95%; max-height: 90vh; overflow-y: auto; }
            .table-container { max-height: none; min-height: 200px; }
            .calendar-day-header { font-size: 10px; }
            .calendar-weekdays { gap: 2px; margin-bottom: 4px; }
            .calendar-day { min-height: 50px; padding: 2px; }
            .calendar-date { font-size: 11px; text-align: center; }
            .cal-badges-container { flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 3px; margin-top: auto; padding-top: 4px; align-content: flex-end; }
            .cal-badge { width: 8px; height: 8px; border-radius: 50%; padding: 0; font-size: 0; color: transparent; text-indent: -9999px; }
            .calendar-grid { gap: 2px; }

            /* Analytics Section Responsive */
            .tab-navigation { gap: 6px; margin-bottom: 12px; }
            .tab-btn { padding: 8px 14px; font-size: 13px; }
            .kpis-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .kpi-card { padding: 12px; }
            .kpi-value { font-size: 20px; }
            .kpi-card h4 { font-size: 10px; }
            .analytics-grid { grid-template-columns: 1fr; gap: 15px; }
            .analytics-card { padding: 15px; }
            .analytics-card h3 { font-size: 12px; }
            .chart-container { height: 200px; }
            .chart-container.large { height: 250px; }
            .stat-highlight-value { font-size: 24px; }
            .analytics-filters { flex-direction: column; gap: 8px; }
            .analytics-filter { width: 100%; box-sizing: border-box; }

            /* Bookings/Analytics Sections Mobile */
            #bookings-section, #analytics-section {
                overflow-y: visible;
            }
        }

        /* Tablet Responsive Styles */
        @media (min-width: 797px) and (max-width: 1024px) {
            .analytics-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .analytics-card.full-width {
                grid-column: 1 / -1;
            }
            .kpis-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        /* Small Mobile Styles */
        @media (max-width: 480px) {
            .kpis-grid { grid-template-columns: 1fr; }
            .stat-highlight { flex-direction: column; align-items: flex-start; gap: 6px; }
            .tab-btn { padding: 6px 10px; font-size: 12px; }
            .chart-container { height: 180px; }
            .chart-container.large { height: 220px; }
        }
    </style>
</head>
<body>

    <!-- Login Screen -->
    <div id="login-screen" class="container" style="max-width: 400px; margin: 80px auto; display: none;">
        <header style="text-align: center; border-bottom: none; padding-bottom: 10px;">
            <h1>System Admin</h1>
            <p>Please authenticate to continue.</p>
        </header>
        <div class="content" style="padding: 30px;">
            <form id="login-form">
                <div style="margin-bottom: 20px;">
                    <label class="login-label">Username</label>
                    <input type="text" id="username" class="login-input" required>
                </div>
                <div style="margin-bottom: 20px;">
                    <label class="login-label">Password</label>
                    <input type="password" id="password" class="login-input" required>
                </div>
                <p id="login-error" style="color: #991b1b; font-size: 14px; text-align: center; display: none; margin-bottom: 15px; font-weight: 500;"></p>
                <button type="submit" id="login-btn" class="btn-submit">Sign In</button>
            </form>
        </div>
    </div>

    <!-- Dashboard Screen -->
    <div id="dashboard-screen" class="container" style="display: none;">
        <header class="header-flex">
            <div class="header-title-container">
                <h1>Admin Dashboard</h1>
                <p>Hotel at Home Bookings</p>
            </div>
            <button onclick="signOut()" class="btn-signout desktop-signout">Sign Out</button>
            <div class="mobile-menu">
                <button class="hamburger-btn" onclick="toggleMobileMenu(event)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div id="mobile-menu-content" class="mobile-menu-content">
                    <a href="#" onclick="signOut(); return false;">Sign Out</a>
                </div>
            </div>
        </header>
        <div class="content">
            <!-- Tab Navigation -->
            <div class="tab-navigation">
                <button class="tab-btn active" onclick="switchTab('bookings')" id="tab-bookings">Bookings</button>
                <button class="tab-btn" onclick="switchTab('availability')" id="tab-availability">Room Availability</button>
                <button class="tab-btn" onclick="switchTab('analytics')" id="tab-analytics">Analytics</button>
            </div>

            <!-- Bookings Section -->
            <div id="bookings-section" class="bookings-section">
                <!-- Statistics Dashboard -->
                <div class="stats-container">
                    <div class="stat-card">
                        <h3>Total Bookings</h3>
                        <p id="stat-total">0</p>
                    </div>
                    <div class="stat-card">
                        <h3>Pending Approvals</h3>
                        <p id="stat-pending">0</p>
                    </div>
                    <div class="stat-card">
                        <h3>Confirmed Bookings</h3>
                        <p id="stat-confirmed">0</p>
                    </div>
                    <div class="stat-card">
                        <h3>Confirmed Revenue</h3>
                        <p id="stat-revenue">₱0</p>
                    </div>
                </div>

                <!-- Controls / Toolbar -->
                <div class="toolbar">
                    <input type="text" id="search-input" class="toolbar-search" placeholder="Search by Guest Name or Code..." oninput="handleFilter()">
                    <div class="toolbar-actions">
                        <input type="month" id="filter-month" class="toolbar-filter" onchange="handleFilter()" title="Filter by Month">
                        <select id="filter-status" class="toolbar-filter" onchange="handleFilter()">
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button onclick="openCalendarModal()" class="btn-export" id="btn-view-calendar">View Calendar</button>
                        <button onclick="openBlockDatesModal()" class="btn-export">Block Dates</button>
                        <button onclick="fetchBookings()" class="btn-icon" title="Refresh Logs"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v6h6M21 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg></button>
                        <button onclick="openExportModal()" class="btn-icon" title="Export CSV"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M4 9h18M10 3v18"/></svg></button>
                    </div>
                </div>

                <!-- Bulk Actions Bar -->
                <div id="bulk-actions-bar" class="bulk-actions-bar">
                    <span id="bulk-count">0 selected</span>
                    <button class="btn-bulk-verify" onclick="bulkVerify()">Mark Verified</button>
                    <button class="btn-bulk-confirm" onclick="bulkConfirm()">Confirm Selected</button>
                    <button class="btn-bulk-cancel" onclick="bulkCancel()">Cancel Selected</button>
                    <button class="btn-bulk-export" onclick="bulkExport()">Export Selected</button>
                    <button style="background: rgba(255,255,255,0.2); color: white; margin-left: auto;" onclick="clearSelection()">Clear</button>
                </div>

                <!-- Last Updated Timestamp -->
                <div class="last-updated" id="last-updated">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span id="last-updated-text">Updated just now</span>
                </div>

                <!-- Table Container -->
                <div class="table-container">
                    <table id="bookings-table">
                        <thead>
                            <tr>
                                <th style="width: 40px;"><input type="checkbox" id="select-all-checkbox" class="row-checkbox" onclick="toggleSelectAll()"></th>
                                <th onclick="sortTable('code')" style="cursor: pointer; user-select: none;">Code <span class="sort-icon">↕</span></th>
                                <th onclick="sortTable('room')" style="cursor: pointer; user-select: none;">Room <span class="sort-icon">↕</span></th>
                                <th onclick="sortTable('guest')" style="cursor: pointer; user-select: none;">Guest <span class="sort-icon">↕</span></th>
                                <th onclick="sortTable('check_in')" style="cursor: pointer; user-select: none;">Check-in <span class="sort-icon">↕</span></th>
                                <th onclick="sortTable('check_out')" style="cursor: pointer; user-select: none;">Check-out <span class="sort-icon">↕</span></th>
                                <th onclick="sortTable('total')" style="cursor: pointer; user-select: none;">Total <span class="sort-icon">↕</span></th>
                                <th onclick="sortTable('status')" style="cursor: pointer; user-select: none;">Status <span class="sort-icon">↕</span></th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="bookings-tbody">
                            <tr>
                                <td colspan="8" id="loader">Loading bookings...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div><!-- Close bookings-section -->

            <!-- Room Availability Section -->
            <div id="availability-section" style="display: none; flex: 1; flex-direction: column; min-height: 0; overflow-y: auto;">
                <div class="availability-header">
                    <h2 style="margin: 0 0 8px 0; font-size: 24px; color: #011478;">Room Availability Overview</h2>
                    <p style="margin: 0; color: rgba(1, 20, 120, 0.6); font-size: 14px;">Quick view of room status and upcoming bookings</p>
                </div>
                
                <!-- Availability Controls -->
                <div style="display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0; align-items: center;">
                    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                        <label style="font-size: 13px; color: rgba(1, 20, 120, 0.7); font-weight: 500;">View Range:</label>
                        <input type="date" id="avail-start" class="toolbar-filter" style="width: 140px;">
                        <span style="color: rgba(1, 20, 120, 0.5);">to</span>
                        <input type="date" id="avail-end" class="toolbar-filter" style="width: 140px;">
                        <button onclick="updateAvailability()" class="btn-export" style="padding: 10px 16px; font-size: 13px;">Update</button>
                    </div>
                    <div style="display: flex; gap: 6px; margin-left: auto;">
                        <button onclick="setAvailRange(7)" class="btn-icon" style="font-size: 12px; padding: 8px 12px;">7 Days</button>
                        <button onclick="setAvailRange(14)" class="btn-icon" style="font-size: 12px; padding: 8px 12px;">14 Days</button>
                        <button onclick="setAvailRange(30)" class="btn-icon" style="font-size: 12px; padding: 8px 12px;">30 Days</button>
                    </div>
                </div>

                <!-- Room Status Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px;">
                    <!-- Gold Room -->
                    <div class="room-avail-card">
                        <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 20px; color: white; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                            <div style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1;">
                                <div>
                                    <h3 style="margin: 0; font-size: 20px; font-weight: 700;">Gold Room</h3>
                                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px; opacity: 0.9;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                        <span style="font-size: 13px;">2 Guests</span>
                                    </div>
                                </div>
                                <div id="gold-occupancy-badge" class="occupancy-badge">--% Occupied</div>
                            </div>
                        </div>
                        <div style="padding: 24px;">
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                                <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 12px;">
                                    <div id="gold-next" style="font-size: 18px; font-weight: 700; color: #011478;">-</div>
                                    <div style="font-size: 10px; color: rgba(1, 20, 120, 0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Next Available</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 12px;">
                                    <div id="gold-count" style="font-size: 18px; font-weight: 700; color: #011478;">-</div>
                                    <div style="font-size: 10px; color: rgba(1, 20, 120, 0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Bookings</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 12px;">
                                    <div id="gold-nights" style="font-size: 18px; font-weight: 700; color: #011478;">-</div>
                                    <div style="font-size: 10px; color: rgba(1, 20, 120, 0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Nights</div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <span style="font-size: 12px; font-weight: 600; color: rgba(1, 20, 120, 0.6);">Occupancy Rate</span>
                                    <span id="gold-occupancy-text" style="font-size: 12px; font-weight: 700; color: #011478;">--%</span>
                                </div>
                                <div style="height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;">
                                    <div id="gold-occupancy-bar" style="height: 100%; background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%); border-radius: 4px; transition: width 0.5s ease; width: 0%;"></div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 12px;">
                                <div style="display: flex; justify-content: space-between; font-size: 10px; color: rgba(1, 20, 120, 0.5); margin-bottom: 6px; padding: 0 2px;">
                                    <span id="gold-start-date">-</span>
                                    <span id="gold-end-date">-</span>
                                </div>
                                <div id="gold-timeline" style="display: flex; gap: 2px; height: 50px; border-radius: 10px; overflow: hidden; background: #f1f5f9; padding: 3px;"></div>
                            </div>
                            
                            <div id="gold-mini-calendar" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 20px; padding: 12px; background: #f8fafc; border-radius: 12px;"></div>
                            
                            <div style="display: flex; gap: 10px;">
                                <button onclick="viewRoomBookings(1)" class="btn-action contact" style="flex: 1; padding: 12px; font-size: 14px;">View Bookings</button>
                            </div>
                        </div>
                    </div>

                    <!-- Blue Room -->
                    <div class="room-avail-card">
                        <div style="background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); padding: 20px; color: white; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                            <div style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1;">
                                <div>
                                    <h3 style="margin: 0; font-size: 20px; font-weight: 700;">Blue Room</h3>
                                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px; opacity: 0.9;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                        <span style="font-size: 13px;">4 Guests</span>
                                    </div>
                                </div>
                                <div id="blue-occupancy-badge" class="occupancy-badge">--% Occupied</div>
                            </div>
                        </div>
                        <div style="padding: 24px;">
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                                <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 12px;">
                                    <div id="blue-next" style="font-size: 18px; font-weight: 700; color: #011478;">-</div>
                                    <div style="font-size: 10px; color: rgba(1, 20, 120, 0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Next Available</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 12px;">
                                    <div id="blue-count" style="font-size: 18px; font-weight: 700; color: #011478;">-</div>
                                    <div style="font-size: 10px; color: rgba(1, 20, 120, 0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Bookings</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 12px;">
                                    <div id="blue-nights" style="font-size: 18px; font-weight: 700; color: #011478;">-</div>
                                    <div style="font-size: 10px; color: rgba(1, 20, 120, 0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Nights</div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <span style="font-size: 12px; font-weight: 600; color: rgba(1, 20, 120, 0.6);">Occupancy Rate</span>
                                    <span id="blue-occupancy-text" style="font-size: 12px; font-weight: 700; color: #011478;">--%</span>
                                </div>
                                <div style="height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;">
                                    <div id="blue-occupancy-bar" style="height: 100%; background: linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%); border-radius: 4px; transition: width 0.5s ease; width: 0%;"></div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 12px;">
                                <div style="display: flex; justify-content: space-between; font-size: 10px; color: rgba(1, 20, 120, 0.5); margin-bottom: 6px; padding: 0 2px;">
                                    <span id="blue-start-date">-</span>
                                    <span id="blue-end-date">-</span>
                                </div>
                                <div id="blue-timeline" style="display: flex; gap: 2px; height: 50px; border-radius: 10px; overflow: hidden; background: #f1f5f9; padding: 3px;"></div>
                            </div>
                            
                            <div id="blue-mini-calendar" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 20px; padding: 12px; background: #f8fafc; border-radius: 12px;"></div>
                            
                            <div style="display: flex; gap: 10px;">
                                <button onclick="viewRoomBookings(2)" class="btn-action contact" style="flex: 1; padding: 12px; font-size: 14px;">View Bookings</button>
                            </div>
                        </div>
                    </div>

                    <!-- Rooftop Lounge -->
                    <div class="room-avail-card">
                        <div style="background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); padding: 20px; color: white; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                            <div style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1;">
                                <div>
                                    <h3 style="margin: 0; font-size: 20px; font-weight: 700;">Rooftop Lounge</h3>
                                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px; opacity: 0.9;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                        <span style="font-size: 13px;">20 Guests</span>
                                    </div>
                                </div>
                                <div id="rooftop-occupancy-badge" class="occupancy-badge">--% Occupied</div>
                            </div>
                        </div>
                        <div style="padding: 24px;">
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                                <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 12px;">
                                    <div id="rooftop-next" style="font-size: 18px; font-weight: 700; color: #011478;">-</div>
                                    <div style="font-size: 10px; color: rgba(1, 20, 120, 0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Next Available</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 12px;">
                                    <div id="rooftop-count" style="font-size: 18px; font-weight: 700; color: #011478;">-</div>
                                    <div style="font-size: 10px; color: rgba(1, 20, 120, 0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Bookings</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: #f8fafc; border-radius: 12px;">
                                    <div id="rooftop-nights" style="font-size: 18px; font-weight: 700; color: #011478;">-</div>
                                    <div style="font-size: 10px; color: rgba(1, 20, 120, 0.5); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Nights</div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <span style="font-size: 12px; font-weight: 600; color: rgba(1, 20, 120, 0.6);">Occupancy Rate</span>
                                    <span id="rooftop-occupancy-text" style="font-size: 12px; font-weight: 700; color: #011478;">--%</span>
                                </div>
                                <div style="height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;">
                                    <div id="rooftop-occupancy-bar" style="height: 100%; background: linear-gradient(90deg, #a855f7 0%, #7c3aed 100%); border-radius: 4px; transition: width 0.5s ease; width: 0%;"></div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 12px;">
                                <div style="display: flex; justify-content: space-between; font-size: 10px; color: rgba(1, 20, 120, 0.5); margin-bottom: 6px; padding: 0 2px;">
                                    <span id="rooftop-start-date">-</span>
                                    <span id="rooftop-end-date">-</span>
                                </div>
                                <div id="rooftop-timeline" style="display: flex; gap: 2px; height: 50px; border-radius: 10px; overflow: hidden; background: #f1f5f9; padding: 3px;"></div>
                            </div>
                            
                            <div id="rooftop-mini-calendar" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 20px; padding: 12px; background: #f8fafc; border-radius: 12px;"></div>
                            
                            <div style="display: flex; gap: 10px;">
                                <button onclick="viewRoomBookings(3)" class="btn-action contact" style="flex: 1; padding: 12px; font-size: 14px;">View Bookings</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Legend -->
                <div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: center; padding: 20px 24px; background: white; border-radius: 16px; border: 1px solid rgba(1, 20, 120, 0.08); margin-bottom: 20px; box-shadow: 0 2px 8px rgba(1, 20, 120, 0.04);">
                    <div style="font-size: 14px; font-weight: 700; color: #011478;">Status Guide:</div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; background: #dcfce7; border-radius: 6px; border: 2px solid #22c55e; display: flex; align-items: center; justify-content: center;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#166534"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        </div>
                        <span style="font-size: 13px; color: rgba(1, 20, 120, 0.8); font-weight: 500;">Available</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; background: #011478; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        </div>
                        <span style="font-size: 13px; color: rgba(1, 20, 120, 0.8); font-weight: 500;">Booked</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; background: #fef3c7; border-radius: 6px; border: 2px solid #f59e0b; display: flex; align-items: center; justify-content: center;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#92400e"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        </div>
                        <span style="font-size: 13px; color: rgba(1, 20, 120, 0.8); font-weight: 500;">Pending</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; background: #fee2e2; border-radius: 6px; border: 2px solid #ef4444; display: flex; align-items: center; justify-content: center;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#991b1b"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
                        </div>
                        <span style="font-size: 13px; color: rgba(1, 20, 120, 0.8); font-weight: 500;">Blocked</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; background: white; border-radius: 6px; border: 3px solid #011478; display: flex; align-items: center; justify-content: center;">
                            <div style="width: 8px; height: 8px; background: #011478; border-radius: 50%;"></div>
                        </div>
                        <span style="font-size: 13px; color: rgba(1, 20, 120, 0.8); font-weight: 500;">Today</span>
                    </div>
                </div>
            </div>

            <!-- Analytics Section -->
            <div id="analytics-section" class="analytics-section">
                <!-- KPIs -->
                <div class="kpis-grid">
                    <div class="kpi-card">
                        <h4>Total Revenue (Confirmed)</h4>
                        <div class="kpi-value" id="kpi-revenue">₱0</div>
                        <div class="kpi-subtext">From confirmed bookings</div>
                    </div>
                    <div class="kpi-card">
                        <h4>Average Booking Value</h4>
                        <div class="kpi-value" id="kpi-avg-value">₱0</div>
                        <div class="kpi-subtext">Per confirmed booking</div>
                    </div>
                    <div class="kpi-card">
                        <h4>Occupancy Rate</h4>
                        <div class="kpi-value" id="kpi-occupancy">0%</div>
                        <div class="kpi-subtext">Based on confirmed bookings</div>
                    </div>
                    <div class="kpi-card">
                        <h4>Conversion Rate</h4>
                        <div class="kpi-value" id="kpi-conversion">0%</div>
                        <div class="kpi-subtext">Confirmed vs Total</div>
                    </div>
                </div>

                <!-- Analytics Filters -->
                <div class="analytics-filters">
                    <select id="analytics-range" class="analytics-filter" onchange="updateAnalytics()">
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 3 Months</option>
                        <option value="180">Last 6 Months</option>
                        <option value="365">Last Year</option>
                        <option value="all">All Time</option>
                    </select>
                    <button onclick="refreshAnalytics()" class="btn-icon" title="Refresh Analytics">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v6h6M21 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
                    </button>
                </div>

                <!-- Charts Grid -->
                <div class="analytics-grid">
                    <!-- Booking Trends Chart -->
                    <div class="analytics-card full-width">
                        <h3>Booking Trends Over Time</h3>
                        <div class="stat-highlight">
                            <div>
                                <div class="stat-highlight-value" id="trend-total">0</div>
                                <div class="stat-highlight-label">Bookings in Period</div>
                            </div>
                            <div class="stat-highlight-change positive" id="trend-change">+0%</div>
                        </div>
                        <div class="chart-container large">
                            <canvas id="bookingTrendsChart"></canvas>
                        </div>
                    </div>

                    <!-- Revenue Chart -->
                    <div class="analytics-card full-width">
                        <h3>Revenue Trends</h3>
                        <div class="stat-highlight">
                            <div>
                                <div class="stat-highlight-value" id="revenue-total">₱0</div>
                                <div class="stat-highlight-label">Revenue in Period</div>
                            </div>
                            <div class="stat-highlight-change positive" id="revenue-change">+0%</div>
                        </div>
                        <div class="chart-container large">
                            <canvas id="revenueChart"></canvas>
                        </div>
                    </div>

                    <!-- Room Utilization -->
                    <div class="analytics-card">
                        <h3>Room Utilization</h3>
                        <div class="chart-container">
                            <canvas id="roomUtilizationChart"></canvas>
                        </div>
                    </div>

                    <!-- Booking Status Distribution -->
                    <div class="analytics-card">
                        <h3>Booking Status Distribution</h3>
                        <div class="chart-container">
                            <canvas id="statusDistributionChart"></canvas>
                        </div>
                    </div>

                    <!-- Popular Days -->
                    <div class="analytics-card">
                        <h3>Popular Booking Days</h3>
                        <div class="chart-container">
                            <canvas id="popularDaysChart"></canvas>
                        </div>
                    </div>

                    <!-- Monthly Comparison -->
                    <div class="analytics-card">
                        <h3>Monthly Comparison</h3>
                        <div class="chart-container">
                            <canvas id="monthlyComparisonChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Action Modal -->
    <div id="action-modal" class="modal-overlay">
        <div class="modal-container">
            <h2 id="modal-title" class="modal-title">Update Status</h2>
            <p id="modal-desc" class="modal-desc">Enter details.</p>
            <textarea id="modal-reason" class="modal-textarea" placeholder="Type your message here..."></textarea>
            <div id="confirm-fields" style="display: none; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 12px; color: rgba(1,20,120,0.6);">Submitted by guest — read-only</span>
                    <button id="confirm-lock-btn" type="button" onclick="toggleConfirmLock()"
                        style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(1,20,120,0.2); background: white; color: #011478; font-family: inherit; font-size: 12px; font-weight: 500; cursor: pointer;">
                        <span id="confirm-lock-icon">🔒</span><span id="confirm-lock-label">Unlock</span>
                    </button>
                </div>
                <div style="margin-bottom: 15px;">
                    <label class="login-label">Payment Option</label>
                    <select id="modal-payment-option" class="login-input" disabled>
                        <option value="GCash">GCash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                </div>
                <div>
                    <label class="login-label">Amount Received (₱)</label>
                    <input type="number" id="modal-amount" class="login-input" placeholder="0.00" min="0" step="0.01" readonly>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" onclick="closeActionModal()">Cancel</button>
                <button class="btn-modal btn-modal-submit" onclick="submitActionModal()">Send Update</button>
            </div>
        </div>
    </div>

    <!-- Block Dates Modal -->
    <div id="block-dates-modal" class="modal-overlay">
        <div class="modal-container" style="max-width: 500px;">
            <h2 class="modal-title">Block Dates</h2>
            <p class="modal-desc">Manually block dates for holidays or maintenance. This will appear as a confirmed "System Block" booking.</p>
            <div style="margin-bottom: 15px;">
                <label class="login-label">Room / Space</label>
                <select id="block-room" class="login-input">
                    <option value="all">All Units</option>
                    <option value="1">Gold Room</option>
                    <option value="2">Blue Room</option>
                    <option value="3">Rooftop Lounge</option>
                </select>
            </div>
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                <div style="flex: 1;"><label class="login-label">Start Date</label><input type="date" id="block-start" class="login-input" required></div>
                <div style="flex: 1;"><label class="login-label">End Date</label><input type="date" id="block-end" class="login-input" required></div>
            </div>
            <div style="margin-bottom: 24px;">
                <label class="login-label">Reason / Note</label>
                <input type="text" id="block-reason" class="login-input" placeholder="e.g. Unit Maintenance, Holiday">
            </div>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" onclick="closeBlockDatesModal()">Cancel</button>
                <button class="btn-modal btn-modal-submit" onclick="submitBlockDates()">Block Dates</button>
            </div>
        </div>
    </div>

    <!-- Alert Modal -->
    <div id="alert-modal" class="modal-overlay">
        <div class="modal-container" style="max-width: 400px; text-align: center;">
            <h2 id="alert-title" class="modal-title">Alert</h2>
            <p id="alert-message" class="modal-desc" style="margin-bottom: 24px;">Message</p>
            <button class="btn-modal btn-modal-submit" style="width: 100%;" onclick="closeAlertModal()">OK</button>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div id="confirm-modal" class="modal-overlay" style="z-index: 1002;">
        <div class="modal-container" style="max-width: 450px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div id="confirm-icon" style="width: 40px; height: 40px; border-radius: 50%; background: #fee2e2; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#991b1b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <h2 id="confirm-title" class="modal-title" style="margin: 0;">Confirm Action</h2>
            </div>
            <p id="confirm-message" class="modal-desc" style="margin-left: 52px; margin-bottom: 24px;">Are you sure you want to proceed?</p>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" onclick="closeConfirmModal()">Cancel</button>
                <button id="confirm-action-btn" class="btn-modal btn-modal-submit">Confirm</button>
            </div>
        </div>
    </div>

    <!-- Contact Modal -->
    <div id="contact-modal" class="modal-overlay">
        <div class="modal-container" style="max-width: 550px;">
            <h2 class="modal-title">Contact Guest</h2>
            <p class="modal-desc">Choose a method to contact the guest.</p>
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; margin-bottom: 24px;">
                <thead>
                    <tr>
                        <th style="padding: 10px; border-bottom: 2px solid rgba(1,20,120,0.05); color: rgba(1,20,120,0.6); text-transform: uppercase; font-size: 12px;">Contact via</th>
                        <th style="padding: 10px; border-bottom: 2px solid rgba(1,20,120,0.05); color: rgba(1,20,120,0.6); text-transform: uppercase; font-size: 12px;">Contact Information</th>
                        <th style="padding: 10px; border-bottom: 2px solid rgba(1,20,120,0.05); color: rgba(1,20,120,0.6); text-transform: uppercase; font-size: 12px; text-align: right;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 12px 10px; border-bottom: 1px solid rgba(1,20,120,0.05); font-weight: 600; color: #011478;">Email</td>
                        <td id="contact-email-text" style="padding: 12px 10px; border-bottom: 1px solid rgba(1,20,120,0.05); color: rgba(1,20,120,0.7);"></td>
                        <td style="padding: 12px 10px; border-bottom: 1px solid rgba(1,20,120,0.05); text-align: right;">
                            <a id="contact-email-btn" href="#" class="btn-modal btn-modal-submit" style="text-decoration: none; padding: 6px 16px; font-size: 12px; display: inline-block;">Email</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 10px; font-weight: 600; color: #011478;">Number</td>
                        <td id="contact-phone-text" style="padding: 12px 10px; color: rgba(1,20,120,0.7);"></td>
                        <td style="padding: 12px 10px; text-align: right;">
                            <a id="contact-phone-btn" href="#" class="btn-modal btn-modal-submit" style="text-decoration: none; padding: 6px 16px; font-size: 12px; display: inline-block;">Call</a>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" onclick="closeContactModal()">Close</button>
            </div>
        </div>
    </div>

    <!-- Calendar Modal -->
    <div id="calendar-modal" class="modal-overlay">
        <div class="modal-container calendar-modal-wrapper">
            <!-- Calendar Summary Stats -->
            <div class="calendar-summary">
                <div class="calendar-summary-item">
                    <div class="calendar-summary-value" id="cal-total-bookings">-</div>
                    <div class="calendar-summary-label">Total Bookings</div>
                </div>
                <div class="calendar-summary-item">
                    <div class="calendar-summary-value" id="cal-confirmed-count">-</div>
                    <div class="calendar-summary-label">Confirmed</div>
                </div>
                <div class="calendar-summary-item">
                    <div class="calendar-summary-value" id="cal-pending-count">-</div>
                    <div class="calendar-summary-label">Pending</div>
                </div>
                <div class="calendar-summary-item">
                    <div class="calendar-summary-value" id="cal-blocked-count">-</div>
                    <div class="calendar-summary-label">Blocked</div>
                </div>
                <div class="calendar-summary-item">
                    <div class="calendar-summary-value" id="cal-occupancy-rate">-</div>
                    <div class="calendar-summary-label">Occupancy</div>
                </div>
            </div>

            <!-- Room Filters -->
            <div class="calendar-filters">
                <button class="calendar-filter-btn active" onclick="toggleRoomFilter('all', this)" id="filter-all">
                    <span class="dot" style="background: #011478;"></span> All Rooms
                </button>
                <button class="calendar-filter-btn" onclick="toggleRoomFilter(1, this)" id="filter-gold">
                    <span class="dot gold"></span> Gold Room
                </button>
                <button class="calendar-filter-btn" onclick="toggleRoomFilter(2, this)" id="filter-blue">
                    <span class="dot blue"></span> Blue Room
                </button>
                <button class="calendar-filter-btn" onclick="toggleRoomFilter(3, this)" id="filter-rooftop">
                    <span class="dot rooftop"></span> Rooftop
                </button>
            </div>

            <!-- Calendar Navigation -->
            <div class="calendar-header">
                <button onclick="changeCalendarMonth(-1)" class="btn-icon" title="Previous Month">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h2 id="calendar-month-label">Month Year</h2>
                <button onclick="changeCalendarMonth(1)" class="btn-icon" title="Next Month">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>

            <!-- Weekday Headers -->
            <div class="calendar-weekdays">
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
            </div>

            <!-- Calendar Grid -->
            <div class="calendar-grid" id="calendar-grid">
                <!-- Generated by JS -->
            </div>

            <!-- Enhanced Legend -->
            <div class="calendar-legend">
                <div class="calendar-legend-item">
                    <div class="calendar-legend-dot confirmed"></div>
                    <span>Confirmed</span>
                </div>
                <div class="calendar-legend-item">
                    <div class="calendar-legend-dot pending"></div>
                    <span>Pending</span>
                </div>
                <div class="calendar-legend-item">
                    <div class="calendar-legend-dot blocked"></div>
                    <span>Blocked</span>
                </div>
                <div class="calendar-legend-item">
                    <div class="calendar-legend-dot today"></div>
                    <span>Today</span>
                </div>
                <button class="btn-modal btn-modal-cancel" onclick="closeCalendarModal()" style="margin-left: auto;">Close</button>
            </div>
        </div>
    </div>

    <!-- Day Bookings Detail Modal -->
    <div id="day-bookings-modal" class="modal-overlay">
        <div class="modal-container day-bookings-modal">
            <h2 class="modal-title" id="day-bookings-title">Bookings for Date</h2>
            <div id="day-bookings-list" style="max-height: 400px; overflow-y: auto;">
                <!-- Generated by JS -->
            </div>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" onclick="closeDayBookingsModal()">Close</button>
            </div>
        </div>
    </div>

    <!-- Booking Details Modal -->
    <div id="details-modal" class="modal-overlay">
        <div class="modal-container" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
            <h2 class="modal-title">Booking Details</h2>
            <div id="details-content" style="margin-bottom: 24px;">
                <!-- Populated by JS -->
            </div>
            <!-- Booking History Section -->
            <div id="booking-history-section" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(1,20,120,0.1); display: none;">
                <div style="font-size: 11px; color: rgba(1,20,120,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                        <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                    </svg>
                    Booking History
                </div>
                <div id="booking-history-content" style="max-height: 200px; overflow-y: auto;">
                    <!-- Populated by JS -->
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" onclick="closeDetailsModal()">Close</button>
            </div>
        </div>
    </div>

    <!-- Export CSV Modal -->
    <div id="export-modal" class="modal-overlay">
        <div class="modal-container" style="max-width: 500px;">
            <h2 class="modal-title">Export Bookings</h2>
            <p class="modal-desc">Select the date range and columns you want to include in the export.</p>
            
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                <div style="flex: 1;">
                    <label class="login-label">Start Date</label>
                    <input type="date" id="export-start" class="login-input">
                </div>
                <div style="flex: 1;">
                    <label class="login-label">End Date</label>
                    <input type="date" id="export-end" class="login-input">
                </div>
            </div>
            <label class="login-label" style="margin-bottom: 10px;">Columns to Include</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; font-size: 14px;">
                <label class="checkbox-label"><input type="checkbox" class="export-col-cb" value="code" checked> Code</label>
                <label class="checkbox-label"><input type="checkbox" class="export-col-cb" value="room" checked> Room</label>
                <label class="checkbox-label"><input type="checkbox" class="export-col-cb" value="guest" checked> Guest Name</label>
                <label class="checkbox-label"><input type="checkbox" class="export-col-cb" value="check_in" checked> Check-in Date</label>
                <label class="checkbox-label"><input type="checkbox" class="export-col-cb" value="check_out" checked> Check-out Date</label>
                <label class="checkbox-label"><input type="checkbox" class="export-col-cb" value="status" checked> Status</label>
                <label class="checkbox-label"><input type="checkbox" class="export-col-cb" value="amount_paid" checked> Amount Paid</label>
                <label class="checkbox-label"><input type="checkbox" class="export-col-cb" value="total_price" checked> Total Price</label>
            </div>
            <div class="modal-actions">
                <button class="btn-modal btn-modal-cancel" onclick="closeExportModal()">Cancel</button>
                <button class="btn-modal btn-modal-submit" onclick="processExportCSV()">Download CSV</button>
            </div>
        </div>
    </div>

    <!-- Toast Container -->
    <div id="toast-container" class="toast-container"></div>

    <script>
        // --- CONFIGURATION ---
        // Auto-detect environment: use localhost for development, production URL otherwise
        const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:4000/api'
            : (window.location.hostname.includes('admin.')
                ? 'https://hotelathomeph.com/api'  // Admin subdomain calls main domain API
                : 'https://www.hotelathomeph.com/api'); 
        
        let currentApiKey = sessionStorage.getItem('admin_pwd') || '';
        let allBookingsData = []; // Store raw bookings for search/filtering
        let filteredBookingsData = []; // Store current filtered list for exports and dashboard
        let isCalendarVisible = false;
        let currentCalDate = new Date();
        let currentSortColumn = null;
        let currentSortDirection = 'asc';

        const roomNames = {
            1: 'Gold Room',
            2: 'Blue Room',
            3: 'Rooftop Lounge'
        };

        // --- TIMEZONE DISPLAY HELPERS ---
        // The backend stores ALL timestamps in UTC and returns them as plain
        // strings (no 'Z' marker). We must explicitly interpret them as UTC and
        // then render in the application's display timezone, otherwise the
        // browser parses them as local time and the offset is double-counted.
        let APP_TZ = 'Asia/Manila';
        let APP_TZ_LABEL = 'PHT';

        // Pull the canonical timezone from the backend (non-blocking).
        fetch(`${API_BASE_URL}/config`).then(r => r.ok ? r.json() : null).then(cfg => {
            if (cfg && cfg.timezone) APP_TZ = cfg.timezone;
            if (cfg && cfg.timezoneLabel) APP_TZ_LABEL = cfg.timezoneLabel;
        }).catch(() => {});

        function parseDBDate(value) {
            if (!value) return null;
            const str = String(value).trim().replace(' ', 'T');
            // Date-only -> UTC midnight; datetime -> append 'Z' if missing.
            const iso = str.length <= 10 ? `${str}T00:00:00Z` : (str.endsWith('Z') ? str : `${str}Z`);
            const d = new Date(iso);
            return isNaN(d.getTime()) ? null : d;
        }

        function fmtDate(value) {
            const d = parseDBDate(value);
            return d ? d.toLocaleDateString('en-PH', { timeZone: APP_TZ }) : 'N/A';
        }

        function fmtDateTime(value) {
            const d = parseDBDate(value);
            return d ? `${d.toLocaleString('en-PH', { timeZone: APP_TZ })} ${APP_TZ_LABEL}` : 'N/A';
        }

        document.addEventListener('DOMContentLoaded', function() {
            if (currentApiKey) {
                showDashboard();
                fetchBookings();
            } else {
                showLogin();
            }

            document.getElementById('login-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const user = document.getElementById('username').value;
                const pass = document.getElementById('password').value;
                const errorEl = document.getElementById('login-error');
                const btn = document.getElementById('login-btn');

                if (user !== 'admin') {
                    errorEl.textContent = 'Invalid username or password.';
                    errorEl.style.display = 'block';
                    return;
                }

                errorEl.style.display = 'none';
                btn.textContent = 'Authenticating...';
                btn.disabled = true;

                fetch(`${API_BASE_URL}/admin/bookings`, {
                    headers: { 'x-api-key': pass }
                })
                .then(response => {
                    if (!response.ok) {
                        if (response.status === 401) throw new Error('Access Denied. Incorrect password.');
                        throw new Error(`Network error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(bookings => {
                    currentApiKey = pass;
                    sessionStorage.setItem('admin_user', user);
                    sessionStorage.setItem('admin_pwd', pass);
                    document.getElementById('password').value = '';
                    showDashboard();
                    allBookingsData = bookings;
                    handleFilter();
                })
                .catch(error => {
                    errorEl.textContent = error.message;
                    errorEl.style.display = 'block';
                })
                .finally(() => {
                    btn.textContent = 'Sign In';
                    btn.disabled = false;
                });
            });
        });

        function toggleMobileMenu(event) {
            event.stopPropagation();
            document.getElementById('mobile-menu-content').classList.toggle('show');
        }

        // Close the dropdown if the user clicks outside of it
        window.onclick = function(event) {
            if (!event.target.closest('.hamburger-btn')) {
                const dropdowns = document.getElementsByClassName("mobile-menu-content");
                for (let i = 0; i < dropdowns.length; i++) {
                    dropdowns[i].classList.remove('show');
                }
            }
        }

        window.addEventListener('popstate', function() {
            if (window.location.hash !== '#dashboard') {
                // If user clicks "Back" button, securely log them out
                signOut();
            } else if (!currentApiKey) {
                // Prevent "Forward" button from showing dashboard if logged out
                showLogin();
            }
        });

        window.addEventListener('pageshow', function(event) {
            if (event.persisted && !sessionStorage.getItem('admin_pwd')) {
                // Prevent browser from showing cached dashboard if logged out
                showLogin();
            }
        });

        function showLogin() {
            document.getElementById('login-screen').style.display = 'block';
            document.getElementById('dashboard-screen').style.display = 'none';
            document.getElementById('bookings-tbody').innerHTML = ''; // Clear sensitive data
            if (window.location.hash === '#dashboard') {
                window.history.replaceState(null, '', window.location.pathname);
            }
        }

        function showDashboard() {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('dashboard-screen').style.display = 'flex';
            // Add a history state so the "Back" button can be intercepted
            if (window.location.hash !== '#dashboard') {
                window.history.pushState(null, '', '#dashboard');
            }
        }

        function signOut() {
            sessionStorage.removeItem('admin_user');
            sessionStorage.removeItem('admin_pwd');
            currentApiKey = '';
            showLogin();
        }

        function fetchBookings() {
            renderSkeletonTable();

            fetch(`${API_BASE_URL}/admin/bookings`, {
                headers: { 'x-api-key': currentApiKey }
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        signOut();
                        throw new Error('Session expired. Please log in again.');
                    }
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(bookings => {
                allBookingsData = bookings;
                handleFilter();
                updateLastUpdated();
            })
            .catch(error => {
                console.error('Error fetching bookings:', error);
                if (!currentApiKey) return; // Silent if we just signed out
                
                let errorMessage = 'An unexpected error occurred.';
                if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Network Error: Cannot connect to the API. Please check if the backend is running.';
                } else {
                    errorMessage = `Failed to load bookings. (${error.message})`;
                }
                showToast('error', errorMessage);
                const tableBody = document.getElementById('bookings-tbody');
                tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px; color: #991b1b;">${errorMessage}</td></tr>`;
            });
        }

        function updateDashboardStats() {
            const data = filteredBookingsData;
            const total = data.length;
            const pending = data.filter(b => String(b.status).toLowerCase().trim() === 'pending').length;
            const confirmedBookings = data.filter(b => String(b.status).toLowerCase().trim() === 'confirmed');
            const confirmedCount = confirmedBookings.length;
            
            // Favor amount_paid if available in the database to calculate total exact revenue
            const revenue = confirmedBookings.reduce((sum, b) => sum + Number(b.amount_paid !== undefined && b.amount_paid !== null ? b.amount_paid : (b.total_price || 0)), 0);

            document.getElementById('stat-total').textContent = total;
            document.getElementById('stat-pending').textContent = pending;
            document.getElementById('stat-confirmed').textContent = confirmedCount;
            document.getElementById('stat-revenue').textContent = '₱' + revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        function renderTable() {
            const tableBody = document.getElementById('bookings-tbody');
            tableBody.innerHTML = ''; // Clear loader/old data

            if (filteredBookingsData.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="9">
                            <div class="empty-state">
                                <div class="empty-state-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                                </div>
                                <h3>No bookings found</h3>
                                <p>No bookings match your current filters. Try adjusting your search or filters.</p>
                                <button onclick="clearFilters()">Clear Filters</button>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            filteredBookingsData.forEach(booking => {
                const status = String(booking.status).toLowerCase().trim();
                const isConfirmed = status === 'confirmed';
                const isCancelled = status === 'cancelled';
                const isPaymentVerified = booking.payment_verified === 1 || booking.payment_verified === true;
                const isSelected = selectedBookings.has(booking.id);

                const row = document.createElement('tr');
                if (isSelected) row.classList.add('selected');
                row.innerHTML = `
                    <td><input type="checkbox" class="row-checkbox" ${isSelected ? 'checked' : ''} onclick="toggleRowSelection(${booking.id}, this)"></td>
                    <td><strong>${booking.confirmation_code}</strong></td>
                    <td>${roomNames[booking.room_id] || 'Unknown'}</td>
                    <td>${booking.guest_first_name} ${booking.guest_last_name}</td>
                    <td>${fmtDate(booking.check_in)}</td>
                    <td>${fmtDate(booking.check_out)}</td>
                    <td>₱${Number(booking.total_price).toLocaleString()}</td>
                    <td><span class="status status-${status}">${booking.status}</span></td>
                    <td>
                        <div class="action-group">
                            <button class="btn-action contact" onclick="openDetailsModal(${booking.id})" style="background-color: #011478;">Details</button>
                            <button class="btn-action confirm" onclick="openActionModal(${booking.id}, 'confirmed')" ${(isConfirmed || isCancelled || !isPaymentVerified) ? 'disabled' : ''}>Confirm</button>
                            <button class="btn-action cancel" onclick="openActionModal(${booking.id}, 'cancelled')" ${(isCancelled || !isPaymentVerified) ? 'disabled' : ''}>Cancel</button>
                            <button class="btn-action contact" onclick="openContactModal(${booking.id})">Contact</button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }

        function renderSkeletonTable() {
            const tableBody = document.getElementById('bookings-tbody');
            tableBody.innerHTML = '';
            
            for (let i = 0; i < 5; i++) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><div class="skeleton skeleton-cell" style="width: 18px;"></div></td>
                    <td><div class="skeleton skeleton-cell"></div></td>
                    <td><div class="skeleton skeleton-cell"></div></td>
                    <td><div class="skeleton skeleton-cell"></div></td>
                    <td><div class="skeleton skeleton-cell"></div></td>
                    <td><div class="skeleton skeleton-cell"></div></td>
                    <td><div class="skeleton skeleton-cell"></div></td>
                    <td><div class="skeleton skeleton-cell"></div></td>
                    <td><div class="skeleton skeleton-cell"></div></td>
                `;
                tableBody.appendChild(row);
            }
        }

        function handleFilter() {
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            const statusFilter = document.getElementById('filter-status').value;
            const monthFilter = document.getElementById('filter-month').value;

            filteredBookingsData = allBookingsData.filter(b => {
                const bStatus = String(b.status).toLowerCase().trim();
                const matchesSearch = (b.confirmation_code && b.confirmation_code.toLowerCase().includes(searchTerm)) ||
                                    (b.guest_first_name && b.guest_first_name.toLowerCase().includes(searchTerm)) ||
                                    (b.guest_last_name && b.guest_last_name.toLowerCase().includes(searchTerm));
                const matchesStatus = statusFilter === 'all' || bStatus === statusFilter;
                
                let matchesMonth = true;
                if (monthFilter && b.check_in) {
                    matchesMonth = b.check_in.substring(0, 7) === monthFilter;
                }
                
                return matchesSearch && matchesStatus && matchesMonth;
            });

            updateDashboardStats();
            renderTable();
            if (isCalendarVisible) renderCalendar();
        }

        let pendingActionBookingId = null;
        let pendingActionStatus = null;

        function openActionModal(bookingId, newStatus) {
            pendingActionBookingId = bookingId;
            pendingActionStatus = newStatus;
            
            const booking = allBookingsData.find(b => b.id === bookingId);
            const guestEmail = booking && booking.guest_email ? ` (${booking.guest_email})` : '';

            const titleEl = document.getElementById('modal-title');
            const descEl = document.getElementById('modal-desc');
            const textareaEl = document.getElementById('modal-reason');
            const confirmFieldsEl = document.getElementById('confirm-fields');
            
            if (newStatus === 'cancelled') {
                const guestName = booking.guest_first_name || 'Guest';
                const bookingCode = booking.confirmation_code || 'N/A';
                
                titleEl.textContent = 'Cancel Booking';
                descEl.textContent = 'Review the cancellation message. This will be sent to the guest via email.';
                textareaEl.style.display = 'block';
                confirmFieldsEl.style.display = 'none';
                
                textareaEl.value = `Dear ${guestName},\n\nWe regret to inform you that your booking with reference code ${bookingCode} has been cancelled.\n\nThis could be due to issues with payment verification, unavailability of dates, or at your request. If you believe this is a mistake or would like to rebook, please contact us immediately.\n\nThank you for considering us.\n\nHotel at Home Team\n+63 927 858 4938  |  +63 917 887 6444`;
            } else {
                titleEl.textContent = 'Confirm Booking';
                descEl.textContent = `Are you sure you want to confirm this booking? An automated email will be sent to the guest${guestEmail}.`;
                textareaEl.style.display = 'none';
                confirmFieldsEl.style.display = 'block';
                
                textareaEl.value = ''; // Clear input for confirm mode

                // Pre-populate amount + the EXACT payment method submitted by the guest.
                document.getElementById('modal-amount').value =
                    (booking.amount_paid != null && Number(booking.amount_paid) > 0) ? booking.amount_paid : (booking.total_price || '');
                prefillPaymentOption(booking.payment_option);

                // Reset to locked / read-only each time the modal opens.
                setConfirmLock(true);
            }
            
            document.getElementById('action-modal').style.display = 'flex';
            if (newStatus === 'cancelled') textareaEl.focus();
        }

        // Ensure the guest's submitted method is reflected, adding it as an option
        // if it isn't one of the presets (e.g. lowercase "gcash").
        function prefillPaymentOption(method) {
            const select = document.getElementById('modal-payment-option');
            if (!method) { select.selectedIndex = 0; return; }
            const existing = Array.from(select.options)
                .find(o => o.value.toLowerCase() === String(method).toLowerCase());
            if (existing) {
                select.value = existing.value;
            } else {
                const opt = document.createElement('option');
                opt.value = method;
                opt.textContent = method;
                select.appendChild(opt);
                select.value = method;
            }
        }

        let confirmFieldsUnlocked = false;
        function setConfirmLock(locked) {
            confirmFieldsUnlocked = !locked;
            document.getElementById('modal-payment-option').disabled = locked;
            document.getElementById('modal-amount').readOnly = locked;
            document.getElementById('confirm-lock-icon').textContent = locked ? '🔒' : '🔓';
            document.getElementById('confirm-lock-label').textContent = locked ? 'Unlock' : 'Lock';
        }
        function toggleConfirmLock() { setConfirmLock(confirmFieldsUnlocked); }

        function setReason(text) {
            document.getElementById('modal-reason').value = text;
        }

        function closeActionModal() {
            document.getElementById('action-modal').style.display = 'none';
            pendingActionBookingId = null;
            pendingActionStatus = null;
        }

        function openBlockDatesModal() {
            document.getElementById('block-start').value = '';
            document.getElementById('block-end').value = '';
            document.getElementById('block-reason').value = '';
            document.getElementById('block-dates-modal').style.display = 'flex';
        }

        function closeBlockDatesModal() {
            document.getElementById('block-dates-modal').style.display = 'none';
        }

        function submitBlockDates() {
            const roomId = document.getElementById('block-room').value;
            const checkIn = document.getElementById('block-start').value;
            const checkOut = document.getElementById('block-end').value;
            const reason = document.getElementById('block-reason').value.trim() || 'Manual Block';

            if (!checkIn || !checkOut) { showToast('error', 'Please provide both start and end dates.'); return; }
            if (checkIn >= checkOut) { showToast('error', 'End date must be after the start date.'); return; }

            closeBlockDatesModal();
            const tableBody = document.getElementById('bookings-tbody');
            tableBody.innerHTML = '<tr><td colspan="9" id="loader">Blocking dates...</td></tr>';

            fetch(`${API_BASE_URL}/admin/block-dates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': currentApiKey },
                body: JSON.stringify({ roomId, checkIn, checkOut, reason })
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) { signOut(); throw new Error('Session expired'); }
                    return response.json().then(data => { throw new Error(data.error || 'Failed to block dates.'); });
                }
                return response.json();
            })
            .then(data => { if (data.success) { showToast('success', 'Dates have been successfully blocked.'); } fetchBookings(); })
            .catch(error => {
                console.error('Error blocking dates:', error);
                if (currentApiKey) showToast('error', error.message || 'An error occurred while blocking dates.');
                fetchBookings();
            });
        }

        function openContactModal(bookingId) {
            const booking = allBookingsData.find(b => b.id === bookingId);
            if (!booking) return;

            const email = booking.guest_email || 'Not provided';
            const phone = booking.guest_phone || 'Not provided';

            document.getElementById('contact-email-text').textContent = email;
            document.getElementById('contact-phone-text').textContent = phone;
            
            const emailBtn = document.getElementById('contact-email-btn');
            if (booking.guest_email) {
                emailBtn.href = `mailto:${booking.guest_email}`;
                emailBtn.style.display = 'inline-block';
            } else {
                emailBtn.style.display = 'none';
            }

            const phoneBtn = document.getElementById('contact-phone-btn');
            if (booking.guest_phone) {
                phoneBtn.href = `tel:${booking.guest_phone}`;
                phoneBtn.style.display = 'inline-block';
            } else {
                phoneBtn.style.display = 'none';
            }
            
            document.getElementById('contact-modal').style.display = 'flex';
        }

        function closeContactModal() {
            document.getElementById('contact-modal').style.display = 'none';
        }

        function openDetailsModal(bookingId) {
            const booking = allBookingsData.find(b => b.id === bookingId);
            if (!booking) return;

            const content = document.getElementById('details-content');
            const status = String(booking.status).toLowerCase().trim();
            
            // Build uploaded files section
            let filesSection = '';
            if (booking.payment_proof_url || booking.id_document_url) {
                filesSection = `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(1,20,120,0.1);">
                    <div style="font-size: 11px; color: rgba(1,20,120,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                            <polyline points="13 2 13 9 20 9"/>
                        </svg>
                        Uploaded Documents
                    </div>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        ${booking.payment_proof_url ? `
                        <a href="${booking.payment_proof_url}" target="_blank" style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #f0fdf4; border: 1px solid #166534; border-radius: 8px; text-decoration: none; color: #166534; font-size: 13px; font-weight: 500; transition: all 0.2s;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                <line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                            Payment Proof
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 4px;">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                        </a>
                        ` : ''}
                        ${booking.id_document_url ? `
                        <a href="${booking.id_document_url}" target="_blank" style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; text-decoration: none; color: #3b82f6; font-size: 13px; font-weight: 500; transition: all 0.2s;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            ID Document
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 4px;">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                        </a>
                        ` : ''}
                    </div>
                </div>
                `;
            }
            
            // Build notes section
            let notesSection = '';
            if (booking.booking_purpose || booking.admin_notes) {
                notesSection = `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(1,20,120,0.1);">
                    <div style="font-size: 11px; color: rgba(1,20,120,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Notes
                    </div>
                    ${booking.booking_purpose ? `
                    <div style="margin-bottom: 12px; padding: 10px 12px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #f9cd2a;">
                        <div style="font-size: 11px; color: rgba(1,20,120,0.5); margin-bottom: 4px;">Booking Purpose</div>
                        <div style="font-size: 13px; color: #011478; line-height: 1.5;">${booking.booking_purpose}</div>
                    </div>
                    ` : ''}
                    ${booking.admin_notes ? `
                    <div style="padding: 10px 12px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #011478;">
                        <div style="font-size: 11px; color: rgba(1,20,120,0.5); margin-bottom: 4px;">Admin Notes</div>
                        <div style="font-size: 13px; color: #011478; line-height: 1.5;">${booking.admin_notes}</div>
                    </div>
                    ` : ''}
                </div>
                `;
            }
            
            content.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px;">
                    <div>
                        <div style="font-size: 11px; color: rgba(1,20,120,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Confirmation Code</div>
                        <div style="font-weight: 600; color: #011478;">${booking.confirmation_code}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: rgba(1,20,120,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Status</div>
                        <div><span class="status status-${status}">${booking.status}</span></div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: rgba(1,20,120,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Room</div>
                        <div style="font-weight: 500;">${roomNames[booking.room_id] || 'Unknown'}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: rgba(1,20,120,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Total Price</div>
                        <div style="font-weight: 600;">₱${Number(booking.total_price).toLocaleString()}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: rgba(1,20,120,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Check-in</div>
                        <div>${fmtDate(booking.check_in)}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: rgba(1,20,120,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Check-out</div>
                        <div>${fmtDate(booking.check_out)}</div>
                    </div>
                </div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(1,20,120,0.1);">
                    <div style="font-size: 11px; color: rgba(1,20,120,0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Guest Information</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                        <div>
                            <div style="font-size: 11px; color: rgba(1,20,120,0.5); margin-bottom: 4px;">Name</div>
                            <div style="font-weight: 500;">${booking.guest_first_name} ${booking.guest_last_name}</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: rgba(1,20,120,0.5); margin-bottom: 4px;">Email</div>
                            <div>${booking.guest_email || 'Not provided'}</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: rgba(1,20,120,0.5); margin-bottom: 4px;">Phone</div>
                            <div>${booking.guest_phone || 'Not provided'}</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: rgba(1,20,120,0.5); margin-bottom: 4px;">Created</div>
                            <div>${fmtDateTime(booking.created_at)}</div>
                        </div>
                        ${booking.updated_at ? `
                        <div>
                            <div style="font-size: 11px; color: rgba(1,20,120,0.5); margin-bottom: 4px;">Last Updated</div>
                            <div>${fmtDateTime(booking.updated_at)}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(1,20,120,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="font-size: 11px; color: rgba(1,20,120,0.6); text-transform: uppercase; letter-spacing: 0.5px;">Payment &amp; Verification</div>
                        <span id="pay-verify-badge" style="font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 9999px; background: #fef9c3; color: #854d0e;">Pending</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                        <div>
                            <div style="font-size: 11px; color: rgba(1,20,120,0.5); margin-bottom: 4px;">Amount Paid</div>
                            <input id="pay-amount" type="number" step="0.01" value="${booking.amount_paid != null ? Number(booking.amount_paid) : ''}" readonly
                                style="width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid rgba(1,20,120,0.15); border-radius: 8px; font-family: inherit; font-size: 14px; background: #f8fafc; color: #011478;">
                        </div>
                        <div>
                            <div style="font-size: 11px; color: rgba(1,20,120,0.5); margin-bottom: 4px;">Payment Method</div>
                            <input id="pay-method" type="text" value="${booking.payment_option || ''}" readonly
                                style="width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid rgba(1,20,120,0.15); border-radius: 8px; font-family: inherit; font-size: 14px; background: #f8fafc; color: #011478;">
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center; margin-top: 10px;">
                        <button id="pay-lock-btn" onclick="togglePaymentLock()" type="button"
                            style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(1,20,120,0.2); background: white; color: #011478; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer;">
                            <span id="pay-lock-icon">🔒</span><span id="pay-lock-label">Unlock to edit</span>
                        </button>
                        <button id="pay-save-btn" onclick="savePaymentEdits()" type="button"
                            style="display: none; padding: 8px 14px; border-radius: 8px; border: none; background: #011478; color: white; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer;">Save changes</button>
                    </div>
                    <div style="font-size: 11px; color: rgba(1,20,120,0.5); margin-top: 12px;">Payment Submitted</div>
                    <div style="font-size: 14px;">${fmtDateTime(booking.payment_submitted_at)}</div>

                    <div style="margin-top: 14px;">
                        <div style="font-size: 11px; color: rgba(1,20,120,0.5); margin-bottom: 6px;">Proof of Payment</div>
                        <div id="pay-proof" style="min-height: 40px;">
                            <span style="font-size: 13px; color: rgba(1,20,120,0.5);">Loading proof…</span>
                        </div>
                    </div>

                    <button id="pay-verify-btn" onclick="confirmAndPurge()" type="button"
                        style="margin-top: 14px; width: 100%; padding: 12px; border-radius: 10px; border: none; background: #166534; color: white; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer;">
                        Mark Payment Verified
                    </button>
                </div>
                ${filesSection}
                ${notesSection}
            `;

            // Load payment proof + verification state, then history.
            loadPaymentSection(booking);
            fetchBookingHistory(bookingId);
            
            document.getElementById('details-modal').style.display = 'flex';
        }

        // --- PAYMENT WORKFLOW ---
        let currentDetailsBooking = null;
        let paymentUnlocked = false;
        let currentPaymentProof = null; // Store proof data for purge check

        async function loadPaymentSection(booking) {
            currentDetailsBooking = booking;
            paymentUnlocked = false;
            const badge = document.getElementById('pay-verify-badge');
            const proofEl = document.getElementById('pay-proof');
            const verifyBtn = document.getElementById('pay-verify-btn');

            try {
                const res = await fetch(`${API_BASE_URL}/admin/bookings/${booking.id}/proof`, {
                    headers: { 'x-api-key': currentApiKey }
                });
                if (!res.ok) throw new Error('Could not load payment proof');
                const data = await res.json();

                if (data.verified) {
                    badge.textContent = 'Verified' + (data.verifiedBy ? ` by ${data.verifiedBy}` : '');
                    badge.style.background = '#dcfce7';
                    badge.style.color = '#166534';
                } else {
                    badge.textContent = 'Pending';
                    badge.style.background = '#fef9c3';
                    badge.style.color = '#854d0e';
                }

                // Store proof data for purge check
                currentPaymentProof = data.proof;

                let imagesHtml = '';
                if (data.proof) {
                    imagesHtml += `<div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                        <img src="${data.proof}" alt="Payment proof" onclick="openLightbox(this.src)"
                            style="max-width: 160px; max-height: 160px; border-radius: 10px; border: 1px solid rgba(1,20,120,0.15); cursor: zoom-in; object-fit: cover;">
                        <div style="font-size: 11px; color: rgba(1,20,120,0.45);">Payment Proof (click to zoom)</div>
                    </div>`;
                }
                if (data.idFront) {
                    imagesHtml += `<div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                        <img src="${data.idFront}" alt="ID Front" onclick="openLightbox(this.src)"
                            style="max-width: 160px; max-height: 160px; border-radius: 10px; border: 1px solid rgba(1,20,120,0.15); cursor: zoom-in; object-fit: cover;">
                        <div style="font-size: 11px; color: rgba(1,20,120,0.45);">ID Front (click to zoom)</div>
                    </div>`;
                }
                if (data.idBack) {
                    imagesHtml += `<div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                        <img src="${data.idBack}" alt="ID Back" onclick="openLightbox(this.src)"
                            style="max-width: 160px; max-height: 160px; border-radius: 10px; border: 1px solid rgba(1,20,120,0.15); cursor: zoom-in; object-fit: cover;">
                        <div style="font-size: 11px; color: rgba(1,20,120,0.45);">ID Back (click to zoom)</div>
                    </div>`;
                }

                if (imagesHtml) {
                    proofEl.innerHTML = `<div style="display: flex; gap: 12px; flex-wrap: wrap;">${imagesHtml}</div>`;
                    verifyBtn.style.display = 'block';
                    verifyBtn.disabled = false;
                    verifyBtn.textContent = 'Mark Payment Verified';
                } else {
                    proofEl.innerHTML = `<span style="font-size: 13px; color: rgba(1,20,120,0.5);">${data.verified ? 'Proof purged after verification.' : 'No proof image on file.'}</span>`;
                    verifyBtn.style.display = 'block';
                    verifyBtn.textContent = 'Mark Payment Verified';
                }

                // If already verified, disable the verify button and change text
                if (data.verified) {
                    verifyBtn.disabled = true;
                    verifyBtn.textContent = 'Payment Verified';
                    verifyBtn.style.background = '#166534';
                }
            } catch (e) {
                proofEl.innerHTML = `<span style="font-size: 13px; color: #991b1b;">Failed to load proof.</span>`;
                verifyBtn.style.display = 'none';
            }
        }

        function togglePaymentLock() {
            paymentUnlocked = !paymentUnlocked;
            const amount = document.getElementById('pay-amount');
            const method = document.getElementById('pay-method');
            const icon = document.getElementById('pay-lock-icon');
            const label = document.getElementById('pay-lock-label');
            const saveBtn = document.getElementById('pay-save-btn');

            [amount, method].forEach(el => {
                el.readOnly = !paymentUnlocked;
                el.style.background = paymentUnlocked ? 'white' : '#f8fafc';
            });
            icon.textContent = paymentUnlocked ? '🔓' : '🔒';
            label.textContent = paymentUnlocked ? 'Locked when done' : 'Unlock to edit';
            saveBtn.style.display = paymentUnlocked ? 'inline-block' : 'none';
        }

        async function savePaymentEdits() {
            if (!currentDetailsBooking) return;
            const amountPaid = document.getElementById('pay-amount').value;
            const paymentOption = document.getElementById('pay-method').value.trim();
            const saveBtn = document.getElementById('pay-save-btn');
            saveBtn.disabled = true;

            try {
                const res = await fetch(`${API_BASE_URL}/admin/bookings/${currentDetailsBooking.id}/payment`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': currentApiKey },
                    body: JSON.stringify({ amountPaid: amountPaid === '' ? undefined : Number(amountPaid), paymentOption })
                });
                if (!res.ok) throw new Error('Save failed');
                showToast('success', 'Payment details updated.');
                togglePaymentLock();
                fetchBookings();
                fetchBookingHistory(currentDetailsBooking.id);
            } catch (e) {
                showToast('error', 'Failed to update payment details.');
            } finally {
                saveBtn.disabled = false;
            }
        }

        async function confirmAndPurge() {
            if (!currentDetailsBooking) return;
            const verifyBtn = document.getElementById('pay-verify-btn');

            const confirmed = await showConfirmModal(
                'Mark Payment Verified',
                'This will mark the payment as verified.',
                'Verify',
                'Cancel',
                false
            );
            if (!confirmed) return;

            verifyBtn.disabled = true;
            verifyBtn.textContent = 'Processing…';
            try {
                const res = await fetch(`${API_BASE_URL}/admin/bookings/${currentDetailsBooking.id}/verify-payment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': currentApiKey }
                });
                if (!res.ok) throw new Error('Verify failed');
                showToast('success', 'Payment verified.');
                await loadPaymentSection(currentDetailsBooking);
                fetchBookings();
                fetchBookingHistory(currentDetailsBooking.id);
            } catch (e) {
                showToast('error', 'Failed to verify payment.');
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Mark Payment Verified';
            }
        }

        // --- IMAGE LIGHTBOX ---
        function openLightbox(src) {
            let lb = document.getElementById('image-lightbox');
            if (!lb) {
                lb = document.createElement('div');
                lb.id = 'image-lightbox';
                lb.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.85);padding:24px;cursor:zoom-out;';
                lb.onclick = closeLightbox;
                lb.innerHTML = '<img id="image-lightbox-img" style="max-width:95vw;max-height:90vh;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,0.5);">';
                document.body.appendChild(lb);
            }
            document.getElementById('image-lightbox-img').src = src;
            lb.style.display = 'flex';
        }

        function closeLightbox() {
            const lb = document.getElementById('image-lightbox');
            if (lb) lb.style.display = 'none';
        }

        function closeDetailsModal() {
            document.getElementById('details-modal').style.display = 'none';
            document.getElementById('booking-history-section').style.display = 'none';
        }

        // Fetch and display booking history
        async function fetchBookingHistory(bookingId) {
            const historySection = document.getElementById('booking-history-section');
            const historyContent = document.getElementById('booking-history-content');
            
            try {
                const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/history`, {
                    headers: { 'x-api-key': currentApiKey }
                });
                
                if (!response.ok) {
                    // Hide history section if endpoint not available
                    historySection.style.display = 'none';
                    return;
                }
                
                const history = await response.json();
                
                if (history.length === 0) {
                    historyContent.innerHTML = `
                        <div style="padding: 16px; text-align: center; color: rgba(1,20,120,0.5); font-size: 13px;">
                            No history available for this booking.
                        </div>
                    `;
                } else {
                    historyContent.innerHTML = history.map(item => {
                        const actionColors = {
                            'created': '#22c55e',
                            'confirmed': '#166534',
                            'cancelled': '#991b1b',
                            'updated': '#3b82f6',
                            'default': '#011478'
                        };
                        const color = actionColors[item.action] || actionColors.default;
                        
                        return `
                        <div style="display: flex; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px;">
                            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; margin-top: 6px; flex-shrink: 0;"></div>
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                                    <div style="font-weight: 600; color: #011478; font-size: 13px; text-transform: capitalize;">
                                        ${item.action}
                                        ${item.old_status && item.new_status ? 
                                            `<span style="color: rgba(1,20,120,0.5); font-weight: 400;">: ${item.old_status} → ${item.new_status}</span>` : 
                                            ''}
                                    </div>
                                    <div style="font-size: 11px; color: rgba(1,20,120,0.5); white-space: nowrap;">
                                        ${fmtDateTime(item.created_at)}
                                    </div>
                                </div>
                                <div style="font-size: 12px; color: rgba(1,20,120,0.7); margin-top: 4px;">
                                    by ${item.performed_by}
                                </div>
                                ${item.notes ? `
                                <div style="font-size: 12px; color: rgba(1,20,120,0.6); margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(1,20,120,0.1);">
                                    "${item.notes}"
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        `;
                    }).join('');
                }
                
                historySection.style.display = 'block';
            } catch (error) {
                console.log('History not available:', error);
                historySection.style.display = 'none';
            }
        }

        function showAlert(title, message) {
            document.getElementById('alert-title').textContent = title;
            document.getElementById('alert-message').textContent = message;
            document.getElementById('alert-modal').style.display = 'flex';
        }

        function closeAlertModal() {
            document.getElementById('alert-modal').style.display = 'none';
        }

        // Confirmation Modal Functions
        let confirmCallback = null;

        function showConfirmModal(title, message, confirmText, cancelText, isDestructive = false) {
            document.getElementById('confirm-title').textContent = title;
            document.getElementById('confirm-message').textContent = message;

            const confirmBtn = document.getElementById('confirm-action-btn');
            const cancelBtn = document.querySelector('.btn-modal-cancel');
            confirmBtn.textContent = confirmText || 'Confirm';
            cancelBtn.textContent = cancelText || 'Cancel';

            // Update styling based on action type
            const iconDiv = document.getElementById('confirm-icon');
            if (isDestructive) {
                iconDiv.style.background = '#fee2e2';
                iconDiv.querySelector('svg').style.stroke = '#991b1b';
                confirmBtn.style.backgroundColor = '#991b1b';
                confirmBtn.onmouseover = () => confirmBtn.style.backgroundColor = '#7f1d1d';
                confirmBtn.onmouseout = () => confirmBtn.style.backgroundColor = '#991b1b';
            } else {
                iconDiv.style.background = '#f0fdf4';
                iconDiv.querySelector('svg').style.stroke = '#166534';
                confirmBtn.style.backgroundColor = '#011478';
                confirmBtn.onmouseover = () => confirmBtn.style.backgroundColor = '#001a72';
                confirmBtn.onmouseout = () => confirmBtn.style.backgroundColor = '#011478';
            }

            document.getElementById('confirm-modal').style.display = 'flex';

            // Return a promise that resolves when confirmed or cancelled
            return new Promise((resolve) => {
                confirmCallback = resolve;
                confirmBtn.onclick = () => {
                    if (confirmCallback) confirmCallback(true);
                    closeConfirmModal();
                };
                cancelBtn.onclick = () => {
                    if (confirmCallback) confirmCallback(false);
                    closeConfirmModal();
                };
            });
        }

        function closeConfirmModal() {
            document.getElementById('confirm-modal').style.display = 'none';
            confirmCallback = null;
        }

        function submitActionModal() {
            if (!pendingActionBookingId || !pendingActionStatus) return;
            
            const reason = document.getElementById('modal-reason').value.trim();
            const bookingId = pendingActionBookingId;
            const newStatus = pendingActionStatus;

            let amountPaid = null;
            let paymentOption = null;

            // Prevent empty submissions
            if (newStatus === 'cancelled' && !reason) {
                showToast('error', 'Please enter a reason for cancellation to send to the guest.');
                return;
            }
            
            if (newStatus === 'confirmed') {
                amountPaid = document.getElementById('modal-amount').value;
                paymentOption = document.getElementById('modal-payment-option').value;
                if (amountPaid === '' || amountPaid < 0 || isNaN(amountPaid)) {
                    showToast('error', 'Please enter a valid amount received.');
                    return;
                }
            }
            
            closeActionModal(); // Hide modal

            // Set loading state on the page
            const tableBody = document.getElementById('bookings-tbody');
            tableBody.innerHTML = '<tr><td colspan="9" id="loader">Processing update and securing dates...</td></tr>';

            const payload = { 
                status: newStatus,
                send_email: true 
            };
            
            if (newStatus === 'cancelled') {
                payload.email_message = reason;
            } else if (newStatus === 'confirmed') {
                payload.amount_paid = parseFloat(amountPaid);
                payload.payment_option = paymentOption;
            }

            fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': currentApiKey
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        signOut();
                        throw new Error('Session expired');
                    }
                    throw new Error('Failed to update status.');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showToast('success', `Booking ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'} successfully`);
                    fetchBookings(); 
                } else {
                    showToast('error', 'Failed to update status: ' + (data.error || 'Unknown error'));
                    fetchBookings(); // Reload to original state
                }
            })
            .catch(error => {
                console.error('Error updating status:', error);
                if (currentApiKey) showToast('error', 'An error occurred while updating the status.');
                fetchBookings();
            });
        }

        function openExportModal() {
            document.getElementById('export-modal').style.display = 'flex';
        }

        function closeExportModal() {
            document.getElementById('export-modal').style.display = 'none';
        }

        function processExportCSV() {
            const startDate = document.getElementById('export-start').value;
            const endDate = document.getElementById('export-end').value;

            const selectedCols = [];
            document.querySelectorAll('.export-col-cb:checked').forEach(cb => selectedCols.push(cb.value));
            
            if (selectedCols.length === 0) {
                showToast('error', 'Please select at least one column to export.');
                return;
            }

            let dataToExport = allBookingsData;

            // Apply Date Filters
            if (startDate) dataToExport = dataToExport.filter(b => b.check_in >= startDate);
            if (endDate) dataToExport = dataToExport.filter(b => b.check_in <= endDate);

            if (dataToExport.length === 0) {
                showToast('error', 'No bookings found for the selected dates.');
                return;
            }
            
            const colLabels = { code: 'Code', room: 'Room', guest: 'Guest', check_in: 'Check-in', check_out: 'Check-out', amount_paid: 'Amount Paid (PHP)', total_price: 'Total (PHP)', status: 'Status' };
            const colMap = {
                'code': b => b.confirmation_code,
                'room': b => roomNames[b.room_id] || 'Unknown',
                'guest': b => `${b.guest_first_name || ''} ${b.guest_last_name || ''}`,
                'check_in': b => b.check_in,
                'check_out': b => b.check_out,
                'amount_paid': b => {
                    // Handle various falsy values - only show empty if truly null/undefined/empty
                    const val = b.amount_paid;
                    if (val === undefined || val === null || val === '' || String(val).toLowerCase() === 'null') {
                        return '';
                    }
                    // Format as number with 2 decimal places for CSV
                    const num = Number(val);
                    return isNaN(num) ? '' : num.toFixed(2);
                },
                'total_price': b => {
                    const val = b.total_price;
                    if (val === undefined || val === null || val === '' || String(val).toLowerCase() === 'null') {
                        return '';
                    }
                    const num = Number(val);
                    return isNaN(num) ? '' : num.toFixed(2);
                },
                'status': b => b.status
            };

            // Helper function to escape CSV values
            const escapeCSV = (value) => {
                if (value === null || value === undefined || value === '') return '';
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            };

            const csvRows = [selectedCols.map(c => colLabels[c]).join(',')];
            let totalAmountPaid = 0;
            let totalRevenue = 0;
            
            dataToExport.forEach(b => {
                const row = selectedCols.map(c => {
                    const value = colMap[c](b);
                    return escapeCSV(value);
                });
                csvRows.push(row.join(','));
                
                if (String(b.status).toLowerCase().trim() === 'confirmed') {
                    totalAmountPaid += Number(b.amount_paid !== undefined && b.amount_paid !== null ? b.amount_paid : 0);
                    totalRevenue += Number(b.total_price || 0);
                }
            });

            // Add a revenue summary row if revenue metrics were included in the export
            if (selectedCols.includes('amount_paid') || selectedCols.includes('total_price')) {
                const summaryRow = selectedCols.map((c, index) => {
                    if (index === 0) return '"CONFIRMED REVENUE TOTAL"';
                    if (c === 'amount_paid') return totalAmountPaid.toFixed(2);
                    if (c === 'total_price') return totalRevenue.toFixed(2);
                    return '';
                });
                csvRows.push(summaryRow.join(','));
            }

            let filename = 'bookings_export';
            if (startDate && endDate) filename += `_${startDate}_to_${endDate}`;
            else if (startDate) filename += `_from_${startDate}`;
            else if (endDate) filename += `_until_${endDate}`;
            else filename += `_all_time`;

            // Add BOM for Excel UTF-8 compatibility
            const csvString = '\uFEFF' + csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            closeExportModal();
            showToast('success', `Exported ${dataToExport.length} bookings to CSV`);
        }

        function openCalendarModal() {
            isCalendarVisible = true;
            document.getElementById('calendar-modal').style.display = 'flex';
            renderCalendar();
        }

        function closeCalendarModal() {
            isCalendarVisible = false;
            document.getElementById('calendar-modal').style.display = 'none';
        }

        function changeCalendarMonth(offset) {
            currentCalDate.setMonth(currentCalDate.getMonth() + offset);
            renderCalendar();
        }

        // Calendar room filter state
        let calendarRoomFilter = 'all';

        function renderCalendar() {
            const monthLabel = document.getElementById('calendar-month-label');
            const grid = document.getElementById('calendar-grid');
            if (!grid) return;

            const year = currentCalDate.getFullYear();
            const month = currentCalDate.getMonth();
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            
            monthLabel.textContent = `${monthNames[month]} ${year}`;
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let html = '';
            let totalBookings = 0;
            let confirmedCount = 0;
            let pendingCount = 0;
            let blockedCount = 0;
            let occupiedDays = 0;

            for (let i = 0; i < firstDay; i++) { html += `<div class="calendar-day empty"></div>`; }

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const currentDate = new Date(year, month, day);
                
                let dayBookings = allBookingsData.filter(b => {
                    if (String(b.status).toLowerCase().trim() === 'cancelled') return false;
                    const bIn = String(b.check_in).substring(0, 10);
                    const bOut = String(b.check_out).substring(0, 10);
                    return dateStr >= bIn && dateStr < bOut;
                });

                // Apply room filter
                if (calendarRoomFilter !== 'all') {
                    dayBookings = dayBookings.filter(b => b.room_id == calendarRoomFilter);
                }

                // Update summary stats
                if (dayBookings.length > 0) {
                    occupiedDays++;
                    dayBookings.forEach(b => {
                        totalBookings++;
                        const status = String(b.status).toLowerCase().trim();
                        if (status === 'confirmed') {
                            if (Number(b.total_price) === 0) blockedCount++;
                            else confirmedCount++;
                        } else if (status === 'pending') {
                            pendingCount++;
                        }
                    });
                }

                // Build day classes
                let dayClasses = ['calendar-day'];
                if (currentDate.getTime() === today.getTime()) dayClasses.push('today');
                if (currentDate < today) dayClasses.push('past');
                if (currentDate.getDay() === 0 || currentDate.getDay() === 6) dayClasses.push('weekend');

                let badgesHtml = '';
                dayBookings.forEach(b => {
                    const rName = roomNames[b.room_id] ? roomNames[b.room_id].split(' ')[0] : 'Rm';
                    let typeClass = 'cal-pending';
                    let label = `${rName}: Pending`;

                    if (String(b.status).toLowerCase().trim() === 'confirmed') {
                        if (Number(b.total_price) === 0) { typeClass = 'cal-block'; label = `${rName}: Blocked`; } 
                        else { typeClass = 'cal-confirmed'; label = `${rName}: Booked`; }
                    }
                    badgesHtml += `<div class="cal-badge ${typeClass}" onclick="showBookingDetails(${b.id}, event)" title="${b.guest_first_name} ${b.guest_last_name} (${b.confirmation_code})">${label}</div>`;
                });

                // Add "more" indicator if many bookings
                if (dayBookings.length > 3) {
                    badgesHtml += `<div style="font-size: 10px; color: rgba(1,20,120,0.5); text-align: center; margin-top: 2px;">+${dayBookings.length - 3} more</div>`;
                }

                html += `<div class="${dayClasses.join(' ')}" onclick="showDayBookings('${dateStr}', ${dayBookings.length})">
                    <div class="calendar-date">${day}</div>
                    <div class="cal-badges-container">${badgesHtml}</div>
                </div>`;
            }
            grid.innerHTML = html;

            // Update summary stats
            document.getElementById('cal-total-bookings').textContent = totalBookings;
            document.getElementById('cal-confirmed-count').textContent = confirmedCount;
            document.getElementById('cal-pending-count').textContent = pendingCount;
            document.getElementById('cal-blocked-count').textContent = blockedCount;
            
            // Calculate occupancy rate
            const occupancyRate = daysInMonth > 0 ? Math.round((occupiedDays / daysInMonth) * 100) : 0;
            document.getElementById('cal-occupancy-rate').textContent = `${occupancyRate}%`;
        }

        function toggleRoomFilter(roomId, btn) {
            // Update active state
            document.querySelectorAll('.calendar-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update filter
            calendarRoomFilter = roomId;
            
            // Re-render calendar
            renderCalendar();
        }

        function showDayBookings(dateStr, count) {
            if (count === 0) return;
            
            const date = new Date(dateStr);
            const title = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('day-bookings-title').textContent = title;
            
            let dayBookings = allBookingsData.filter(b => {
                if (String(b.status).toLowerCase().trim() === 'cancelled') return false;
                const bIn = String(b.check_in).substring(0, 10);
                const bOut = String(b.check_out).substring(0, 10);
                return dateStr >= bIn && dateStr < bOut;
            });

            // Apply room filter
            if (calendarRoomFilter !== 'all') {
                dayBookings = dayBookings.filter(b => b.room_id == calendarRoomFilter);
            }

            let html = '';
            if (dayBookings.length === 0) {
                html = '<p style="text-align: center; color: rgba(1,20,120,0.5); padding: 20px;">No bookings for this date</p>';
            } else {
                dayBookings.forEach(b => {
                    const status = String(b.status).toLowerCase().trim();
                    let itemClass = status;
                    let roomName = roomNames[b.room_id] || 'Unknown';
                    
                    html += `
                        <div class="day-booking-item ${itemClass}" onclick="showBookingDetails(${b.id}, event)">
                            <div class="day-booking-info">
                                <span class="day-booking-guest">${b.guest_first_name} ${b.guest_last_name}</span>
                                <span class="day-booking-code">${b.confirmation_code}</span>
                            </div>
                            <span class="day-booking-room" style="background: ${getRoomColor(b.room_id)}20; color: ${getRoomColor(b.room_id)};">${roomName}</span>
                        </div>
                    `;
                });
            }
            
            document.getElementById('day-bookings-list').innerHTML = html;
            document.getElementById('day-bookings-modal').style.display = 'flex';
        }

        function closeDayBookingsModal() {
            document.getElementById('day-bookings-modal').style.display = 'none';
        }

        function showBookingDetails(bookingId, event) {
            if (event) event.stopPropagation();
            openDetailsModal(bookingId);
            closeDayBookingsModal();
        }

        function getRoomColor(roomId) {
            const colors = { 1: '#fbbf24', 2: '#60a5fa', 3: '#a855f7' };
            return colors[roomId] || '#011478';
        }

        // Toast Notification Functions
        function showToast(type, message) {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            const icons = {
                success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#166534"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
                error: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#991b1b"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>',
                info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#011478"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
            };

            toast.innerHTML = `
                <div class="toast-icon">${icons[type] || icons.info}</div>
                <div class="toast-message">${message}</div>
                <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
            `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }

        // Table Sorting Function
        function sortTable(column) {
            if (currentSortColumn === column) {
                currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortColumn = column;
                currentSortDirection = 'asc';
            }

            filteredBookingsData.sort((a, b) => {
                let valA, valB;

                switch(column) {
                    case 'code':
                        valA = a.confirmation_code;
                        valB = b.confirmation_code;
                        break;
                    case 'room':
                        valA = roomNames[a.room_id] || '';
                        valB = roomNames[b.room_id] || '';
                        break;
                    case 'guest':
                        valA = `${a.guest_first_name} ${a.guest_last_name}`;
                        valB = `${b.guest_first_name} ${b.guest_last_name}`;
                        break;
                    case 'check_in':
                        valA = new Date(a.check_in);
                        valB = new Date(b.check_in);
                        break;
                    case 'check_out':
                        valA = new Date(a.check_out);
                        valB = new Date(b.check_out);
                        break;
                    case 'total':
                        valA = Number(a.total_price);
                        valB = Number(b.total_price);
                        break;
                    case 'status':
                        valA = a.status;
                        valB = b.status;
                        break;
                    default:
                        return 0;
                }

                if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
                return 0;
            });

            updateSortIcons();
            renderTable();
        }

        function updateSortIcons() {
            document.querySelectorAll('.sort-icon').forEach(icon => {
                icon.textContent = '↕';
            });

            if (currentSortColumn) {
                const header = document.querySelector(`th[onclick="sortTable('${currentSortColumn}')"]`);
                if (header) {
                    const icon = header.querySelector('.sort-icon');
                    if (icon) {
                        icon.textContent = currentSortDirection === 'asc' ? '↑' : '↓';
                    }
                }
            }
        }

        // Bulk Actions Variables
        let selectedBookings = new Set();

        // Last Updated Timestamp
        let lastUpdatedTime = new Date();

        function updateLastUpdated() {
            lastUpdatedTime = new Date();
            const text = document.getElementById('last-updated-text');
            text.textContent = 'Updated just now';
            
            // Update relative time every minute
            setInterval(() => {
                const diff = Math.floor((new Date() - lastUpdatedTime) / 60000);
                if (diff === 0) text.textContent = 'Updated just now';
                else if (diff === 1) text.textContent = 'Updated 1 minute ago';
                else if (diff < 60) text.textContent = `Updated ${diff} minutes ago`;
                else {
                    const hours = Math.floor(diff / 60);
                    if (hours === 1) text.textContent = 'Updated 1 hour ago';
                    else text.textContent = `Updated ${hours} hours ago`;
                }
            }, 60000);
        }

        // Toggle row selection
        function toggleRowSelection(bookingId, checkbox) {
            if (checkbox.checked) {
                selectedBookings.add(bookingId);
            } else {
                selectedBookings.delete(bookingId);
            }
            updateBulkActionsBar();
            renderTable(); // Re-render to update row styling
        }

        // Toggle select all
        function toggleSelectAll() {
            const selectAllCheckbox = document.getElementById('select-all-checkbox');
            const isChecked = selectAllCheckbox.checked;
            
            if (isChecked) {
                filteredBookingsData.forEach(booking => selectedBookings.add(booking.id));
            } else {
                filteredBookingsData.forEach(booking => selectedBookings.delete(booking.id));
            }
            
            updateBulkActionsBar();
            renderTable();
        }

        // Update bulk actions bar visibility
        function updateBulkActionsBar() {
            const bar = document.getElementById('bulk-actions-bar');
            const count = document.getElementById('bulk-count');
            
            if (selectedBookings.size > 0) {
                bar.classList.add('active');
                count.textContent = `${selectedBookings.size} selected`;
            } else {
                bar.classList.remove('active');
                document.getElementById('select-all-checkbox').checked = false;
            }
        }

        // Clear selection
        function clearSelection() {
            selectedBookings.clear();
            document.getElementById('select-all-checkbox').checked = false;
            updateBulkActionsBar();
            renderTable();
        }

        // Bulk confirm
        function bulkVerify() {
            const ids = Array.from(selectedBookings);
            if (ids.length === 0) return;

            // Filter only bookings that are not yet verified
            const unverifiedIds = ids.filter(id => {
                const booking = allBookingsData.find(b => b.id === id);
                return booking && booking.payment_verified !== 1 && booking.payment_verified !== true;
            });

            if (unverifiedIds.length === 0) {
                showToast('error', 'No unverified bookings selected. Only unverified bookings can be marked as verified.');
                return;
            }

            showConfirmModal(
                'Mark Payment Verified',
                `Are you sure you want to mark ${unverifiedIds.length} booking(s) as verified?`,
                'Verify',
                'Cancel',
                false
            ).then(() => {
                showToast('info', `Verifying ${unverifiedIds.length} bookings...`);

                // Show loading state
                const tableBody = document.getElementById('bookings-tbody');
                tableBody.innerHTML = '<tr><td colspan="9" id="loader">Processing bulk verification...</td></tr>';

                // Process all bookings in parallel
                const promises = unverifiedIds.map(id => {
                    return fetch(`${API_BASE_URL}/admin/bookings/${id}/verify-payment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': currentApiKey
                        }
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('Failed');
                        return response.json();
                    })
                    .then(data => ({ success: true, id }))
                    .catch(error => ({ success: false, id, error }));
                });

                Promise.all(promises).then(results => {
                    const successful = results.filter(r => r.success).length;
                    const failed = results.filter(r => !r.success).length;

                    if (successful > 0) {
                        showToast('success', `${successful} booking(s) verified successfully`);
                    }
                    if (failed > 0) {
                        showToast('error', `${failed} booking(s) failed to verify`);
                    }

                    clearSelection();
                    fetchBookings();
                });
            });
        }

        function bulkConfirm() {
            const ids = Array.from(selectedBookings);
            if (ids.length === 0) return;

            // Filter only pending bookings that can be confirmed
            const pendingIds = ids.filter(id => {
                const booking = allBookingsData.find(b => b.id === id);
                return booking && booking.status.toLowerCase() === 'pending';
            });

            if (pendingIds.length === 0) {
                showToast('error', 'No pending bookings selected. Only pending bookings can be confirmed.');
                return;
            }

            showConfirmModal(
                'Confirm Bookings',
                `Are you sure you want to confirm ${pendingIds.length} booking(s)? This will send confirmation emails to all selected guests.`,
                'Confirm Bookings',
                'Cancel',
                false
            ).then(() => {
                showToast('info', `Confirming ${pendingIds.length} bookings...`);

                // Show loading state
                const tableBody = document.getElementById('bookings-tbody');
                tableBody.innerHTML = '<tr><td colspan="9" id="loader">Processing bulk confirmation...</td></tr>';

                // Process all bookings in parallel
                const promises = pendingIds.map(id => {
                    const payload = {
                        status: 'confirmed',
                        send_email: true,
                        amount_paid: 0,
                        payment_option: 'pending'
                    };

                    return fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': currentApiKey
                        },
                        body: JSON.stringify(payload)
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('Failed');
                        return response.json();
                    })
                    .then(data => ({ success: true, id }))
                    .catch(error => ({ success: false, id, error }));
                });

                Promise.all(promises).then(results => {
                    const successful = results.filter(r => r.success).length;
                    const failed = results.filter(r => !r.success).length;

                    if (successful > 0) {
                        showToast('success', `${successful} booking(s) confirmed successfully`);
                    }
                    if (failed > 0) {
                        showToast('error', `${failed} booking(s) failed to confirm`);
                    }

                    clearSelection();
                    fetchBookings();
                });
            });
        }

        // Bulk cancel
        function bulkCancel() {
            const ids = Array.from(selectedBookings);
            if (ids.length === 0) return;

            // Filter only bookings that can be cancelled (not already cancelled)
            const cancellableIds = ids.filter(id => {
                const booking = allBookingsData.find(b => b.id === id);
                return booking && booking.status.toLowerCase() !== 'cancelled';
            });

            if (cancellableIds.length === 0) {
                showToast('error', 'No cancellable bookings selected.');
                return;
            }

            showConfirmModal(
                'Cancel Bookings',
                `Are you sure you want to cancel ${cancellableIds.length} booking(s)? This action cannot be undone and cancellation emails will be sent to all selected guests.`,
                'Cancel Bookings',
                'Go Back',
                true
            ).then(() => {
                showToast('info', `Cancelling ${cancellableIds.length} bookings...`);

                // Show loading state
                const tableBody = document.getElementById('bookings-tbody');
                tableBody.innerHTML = '<tr><td colspan="9" id="loader">Processing bulk cancellation...</td></tr>';

                // Default cancellation message
                const defaultMessage = `Dear Guest,\n\nWe regret to inform you that your booking has been cancelled as requested or due to unavailability.\n\nIf you have any questions, please contact us.\n\nHotel at Home Team\n+63 927 858 4938 | +63 917 887 6444`;

                // Process all bookings in parallel
                const promises = cancellableIds.map(id => {
                    const payload = {
                        status: 'cancelled',
                        send_email: true,
                        email_message: defaultMessage
                    };

                    return fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': currentApiKey
                        },
                        body: JSON.stringify(payload)
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('Failed');
                        return response.json();
                    })
                    .then(data => ({ success: true, id }))
                    .catch(error => ({ success: false, id, error }));
                });

                Promise.all(promises).then(results => {
                    const successful = results.filter(r => r.success).length;
                    const failed = results.filter(r => !r.success).length;

                    if (successful > 0) {
                        showToast('success', `${successful} booking(s) cancelled successfully`);
                    }
                    if (failed > 0) {
                        showToast('error', `${failed} booking(s) failed to cancel`);
                    }

                    clearSelection();
                    fetchBookings();
                });
            });
        }

        // Bulk export
        function bulkExport() {
            const ids = Array.from(selectedBookings);
            if (ids.length === 0) return;
            
            const selectedData = allBookingsData.filter(b => ids.includes(b.id));
            
            // Build CSV
            const headers = ['Code', 'Room', 'Guest', 'Check-in', 'Check-out', 'Total', 'Status'];
            const rows = selectedData.map(b => [
                b.confirmation_code,
                roomNames[b.room_id] || 'Unknown',
                `${b.guest_first_name} ${b.guest_last_name}`,
                b.check_in,
                b.check_out,
                b.total_price,
                b.status
            ]);
            
            const csv = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
            
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `selected-bookings-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            
            showToast('success', `${ids.length} bookings exported successfully`);
        }

        // Clear filters
        function clearFilters() {
            document.getElementById('search-input').value = '';
            document.getElementById('filter-status').value = 'all';
            document.getElementById('filter-month').value = '';
            handleFilter();
        }

        // Tab Switching
        function switchTab(tabName) {
            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById(`tab-${tabName}`).classList.add('active');

            // Show/hide sections
            if (tabName === 'bookings') {
                document.getElementById('bookings-section').style.display = 'flex';
                document.getElementById('availability-section').style.display = 'none';
                document.getElementById('availability-section').classList.remove('active');
                document.getElementById('analytics-section').style.display = 'none';
                document.getElementById('analytics-section').classList.remove('active');
            } else if (tabName === 'availability') {
                document.getElementById('bookings-section').style.display = 'none';
                document.getElementById('availability-section').style.display = 'flex';
                document.getElementById('availability-section').classList.add('active');
                document.getElementById('analytics-section').style.display = 'none';
                document.getElementById('analytics-section').classList.remove('active');
                // Initialize availability view when first switching
                if (!window.availabilityInitialized) {
                    initAvailability();
                    window.availabilityInitialized = true;
                } else {
                    updateAvailability();
                }
            } else if (tabName === 'analytics') {
                document.getElementById('bookings-section').style.display = 'none';
                document.getElementById('availability-section').style.display = 'none';
                document.getElementById('availability-section').classList.remove('active');
                document.getElementById('analytics-section').style.display = 'flex';
                document.getElementById('analytics-section').classList.add('active');
                // Initialize charts when first switching to analytics
                if (!window.analyticsInitialized) {
                    initAnalytics();
                    window.analyticsInitialized = true;
                } else {
                    updateAnalytics();
                }
            }
        }

        // Analytics Charts
        let bookingTrendsChart, revenueChart, roomUtilizationChart, statusDistributionChart, popularDaysChart, monthlyComparisonChart;

        function initAnalytics() {
            updateAnalytics();
        }

        function refreshAnalytics() {
            // Show loading toast
            showToast('info', 'Refreshing analytics...');
            updateAnalytics();
        }

        function updateAnalytics() {
            const daysRange = parseInt(document.getElementById('analytics-range').value) || 30;
            const now = new Date();
            const startDate = daysRange === 'all' ? new Date(0) : new Date(now.getTime() - (daysRange * 24 * 60 * 60 * 1000));

            // Filter bookings based on date range
            const filteredBookings = allBookingsData.filter(b => {
                const bookingDate = new Date(b.created_at || b.check_in);
                return bookingDate >= startDate;
            });

            // Calculate KPIs
            calculateKPIs(filteredBookings, daysRange);

            // Render charts
            renderBookingTrendsChart(filteredBookings, daysRange);
            renderRevenueChart(filteredBookings, daysRange);
            renderRoomUtilizationChart(filteredBookings);
            renderStatusDistributionChart(filteredBookings);
            renderPopularDaysChart(filteredBookings);
            renderMonthlyComparisonChart(filteredBookings);
        }

        function calculateKPIs(bookings, daysRange) {
            const confirmed = bookings.filter(b => b.status === 'confirmed');
            const totalRevenue = confirmed.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
            const avgValue = confirmed.length > 0 ? totalRevenue / confirmed.length : 0;
            const occupancyRate = calculateOccupancyRate(confirmed, daysRange);
            const conversionRate = bookings.length > 0 ? (confirmed.length / bookings.length * 100) : 0;

            document.getElementById('kpi-revenue').textContent = '₱' + totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            document.getElementById('kpi-avg-value').textContent = '₱' + avgValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            document.getElementById('kpi-occupancy').textContent = occupancyRate.toFixed(1) + '%';
            document.getElementById('kpi-conversion').textContent = conversionRate.toFixed(1) + '%';
        }

        function calculateOccupancyRate(confirmedBookings, daysRange) {
            if (confirmedBookings.length === 0 || daysRange === 'all') return 0;
            const totalRoomDays = 3 * daysRange; // 3 rooms * days
            const bookedDays = confirmedBookings.reduce((sum, b) => {
                const checkIn = new Date(b.check_in);
                const checkOut = new Date(b.check_out);
                const days = Math.max(1, (checkOut - checkIn) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0);
            return Math.min(100, (bookedDays / totalRoomDays) * 100);
        }

        function renderBookingTrendsChart(bookings, daysRange) {
            const ctx = document.getElementById('bookingTrendsChart').getContext('2d');
            
            // Group bookings by date
            const dateMap = new Map();
            const labels = [];
            const data = [];

            if (daysRange === 'all' || daysRange > 90) {
                // Group by month for longer periods
                bookings.forEach(b => {
                    const date = new Date(b.created_at || b.check_in);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    dateMap.set(monthKey, (dateMap.get(monthKey) || 0) + 1);
                });
                const sortedMonths = Array.from(dateMap.keys()).sort();
                sortedMonths.forEach(month => {
                    labels.push(month);
                    data.push(dateMap.get(month));
                });
            } else {
                // Group by day for shorter periods
                bookings.forEach(b => {
                    const date = new Date(b.created_at || b.check_in);
                    const dayKey = date.toISOString().split('T')[0];
                    dateMap.set(dayKey, (dateMap.get(dayKey) || 0) + 1);
                });
                const sortedDays = Array.from(dateMap.keys()).sort();
                sortedDays.forEach(day => {
                    labels.push(new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                    data.push(dateMap.get(day));
                });
            }

            // Update stats
            document.getElementById('trend-total').textContent = bookings.length;

            if (bookingTrendsChart) bookingTrendsChart.destroy();
            bookingTrendsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Bookings',
                        data: data,
                        borderColor: '#011478',
                        backgroundColor: 'rgba(1, 20, 120, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                }
            });
        }

        function renderRevenueChart(bookings, daysRange) {
            const ctx = document.getElementById('revenueChart').getContext('2d');
            
            const confirmed = bookings.filter(b => b.status === 'confirmed');
            const dateMap = new Map();
            const labels = [];
            const data = [];

            if (daysRange === 'all' || daysRange > 90) {
                confirmed.forEach(b => {
                    const date = new Date(b.check_in);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    dateMap.set(monthKey, (dateMap.get(monthKey) || 0) + parseFloat(b.total_price || 0));
                });
                const sortedMonths = Array.from(dateMap.keys()).sort();
                sortedMonths.forEach(month => {
                    labels.push(month);
                    data.push(dateMap.get(month));
                });
            } else {
                confirmed.forEach(b => {
                    const date = new Date(b.check_in);
                    const dayKey = date.toISOString().split('T')[0];
                    dateMap.set(dayKey, (dateMap.get(dayKey) || 0) + parseFloat(b.total_price || 0));
                });
                const sortedDays = Array.from(dateMap.keys()).sort();
                sortedDays.forEach(day => {
                    labels.push(new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                    data.push(dateMap.get(day));
                });
            }

            const totalRevenue = data.reduce((sum, val) => sum + val, 0);
            document.getElementById('revenue-total').textContent = '₱' + totalRevenue.toLocaleString();

            if (revenueChart) revenueChart.destroy();
            revenueChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Revenue (₱)',
                        data: data,
                        backgroundColor: '#011478',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { callback: val => '₱' + val.toLocaleString() } }
                    }
                }
            });
        }

        function renderRoomUtilizationChart(bookings) {
            const ctx = document.getElementById('roomUtilizationChart').getContext('2d');
            
            const roomCounts = { 1: 0, 2: 0, 3: 0 };
            bookings.filter(b => b.status === 'confirmed').forEach(b => {
                if (roomCounts[b.room_id] !== undefined) roomCounts[b.room_id]++;
            });

            if (roomUtilizationChart) roomUtilizationChart.destroy();
            roomUtilizationChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Gold Room', 'Blue Room', 'Rooftop Lounge'],
                    datasets: [{
                        data: [roomCounts[1], roomCounts[2], roomCounts[3]],
                        backgroundColor: ['#facc15', '#011478', '#22c55e'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }

        function renderStatusDistributionChart(bookings) {
            const ctx = document.getElementById('statusDistributionChart').getContext('2d');
            
            const counts = { pending: 0, confirmed: 0, cancelled: 0 };
            bookings.forEach(b => {
                const status = (b.status || '').toLowerCase();
                if (counts[status] !== undefined) counts[status]++;
            });

            if (statusDistributionChart) statusDistributionChart.destroy();
            statusDistributionChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Pending', 'Confirmed', 'Cancelled'],
                    datasets: [{
                        data: [counts.pending, counts.confirmed, counts.cancelled],
                        backgroundColor: ['#f59e0b', '#22c55e', '#ef4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }

        function renderPopularDaysChart(bookings) {
            const ctx = document.getElementById('popularDaysChart').getContext('2d');
            
            const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
            bookings.forEach(b => {
                const date = new Date(b.check_in);
                dayCounts[date.getDay()]++;
            });

            if (popularDaysChart) popularDaysChart.destroy();
            popularDaysChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    datasets: [{
                        label: 'Bookings',
                        data: dayCounts,
                        backgroundColor: '#011478',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
        }

        function renderMonthlyComparisonChart(bookings) {
            const ctx = document.getElementById('monthlyComparisonChart').getContext('2d');
            
            const monthCounts = new Array(12).fill(0);
            const thisYear = new Date().getFullYear();
            
            bookings.filter(b => new Date(b.check_in).getFullYear() === thisYear).forEach(b => {
                const month = new Date(b.check_in).getMonth();
                monthCounts[month]++;
            });

            if (monthlyComparisonChart) monthlyComparisonChart.destroy();
            monthlyComparisonChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Bookings',
                        data: monthCounts,
                        backgroundColor: '#011478',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
        }

        // Room Availability Functions
        let availStartDate, availEndDate;

        function initAvailability() {
            // Set default range (next 30 days)
            setAvailRange(30);
        }

        function setAvailRange(days) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            availStartDate = new Date(today);
            availEndDate = new Date(today);
            availEndDate.setDate(today.getDate() + days);
            
            document.getElementById('avail-start').value = availStartDate.toISOString().split('T')[0];
            document.getElementById('avail-end').value = availEndDate.toISOString().split('T')[0];
            
            updateAvailability();
        }

        function updateAvailability() {
            availStartDate = new Date(document.getElementById('avail-start').value);
            availEndDate = new Date(document.getElementById('avail-end').value);
            
            if (isNaN(availStartDate.getTime()) || isNaN(availEndDate.getTime())) {
                setAvailRange(30);
                return;
            }
            
            renderRoomAvailability(1, 'gold');
            renderRoomAvailability(2, 'blue');
            renderRoomAvailability(3, 'rooftop');
        }

        function renderRoomAvailability(roomId, prefix) {
            const roomBookings = allBookingsData.filter(b => {
                if (b.room_id != roomId) return false;
                if (String(b.status).toLowerCase().trim() === 'cancelled') return false;
                const bIn = new Date(b.check_in);
                return bIn <= availEndDate;
            }).sort((a, b) => new Date(a.check_in) - new Date(b.check_in));
            
            // Update counts
            const activeBookings = roomBookings.filter(b => {
                const bIn = new Date(b.check_in);
                const bOut = new Date(b.check_out);
                return bOut >= availStartDate && bIn <= availEndDate;
            });
            document.getElementById(`${prefix}-count`).textContent = activeBookings.length;
            
            // Calculate nights booked
            let nightsBooked = 0;
            activeBookings.forEach(b => {
                const checkIn = new Date(b.check_in);
                const checkOut = new Date(b.check_out);
                const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                nightsBooked += Math.max(0, nights);
            });
            const nightsEl = document.getElementById(`${prefix}-nights`);
            if (nightsEl) nightsEl.textContent = nightsBooked;
            
            // Calculate occupancy rate
            const totalDays = Math.ceil((availEndDate - availStartDate) / (1000 * 60 * 60 * 24)) + 1;
            let occupiedDays = 0;
            for (let d = new Date(availStartDate); d <= availEndDate; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const isBooked = roomBookings.some(b => {
                    const bIn = String(b.check_in).substring(0, 10);
                    const bOut = String(b.check_out).substring(0, 10);
                    return dateStr >= bIn && dateStr < bOut;
                });
                if (isBooked) occupiedDays++;
            }
            const occupancyRate = totalDays > 0 ? Math.round((occupiedDays / totalDays) * 100) : 0;
            
            // Update occupancy bar
            const occupancyBar = document.getElementById(`${prefix}-occupancy-bar`);
            const occupancyText = document.getElementById(`${prefix}-occupancy-text`);
            const occupancyBadge = document.getElementById(`${prefix}-occupancy-badge`);
            
            if (occupancyBar) occupancyBar.style.width = `${occupancyRate}%`;
            if (occupancyText) occupancyText.textContent = `${occupancyRate}%`;
            if (occupancyBadge) {
                occupancyBadge.textContent = `${occupancyRate}% Occupied`;
                occupancyBadge.className = 'occupancy-badge';
                if (occupancyRate >= 70) occupancyBadge.classList.add('high');
                else if (occupancyRate >= 40) occupancyBadge.classList.add('medium');
                else occupancyBadge.classList.add('low');
            }
            
            // Update date labels
            const startLabel = document.getElementById(`${prefix}-start-date`);
            const endLabel = document.getElementById(`${prefix}-end-date`);
            if (startLabel) startLabel.textContent = availStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (endLabel) endLabel.textContent = availEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // Find next available date
            let nextAvailable = availStartDate;
            let found = false;
            for (let d = new Date(availStartDate); d <= availEndDate; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const isBooked = roomBookings.some(b => {
                    const bIn = String(b.check_in).substring(0, 10);
                    const bOut = String(b.check_out).substring(0, 10);
                    return dateStr >= bIn && dateStr < bOut;
                });
                if (!isBooked) {
                    nextAvailable = new Date(d);
                    found = true;
                    break;
                }
            }
            
            const nextEl = document.getElementById(`${prefix}-next`);
            if (found) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (nextAvailable.getTime() === today.getTime()) {
                    nextEl.textContent = 'Today';
                    nextEl.style.color = '#22c55e';
                } else {
                    nextEl.textContent = nextAvailable.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    nextEl.style.color = '#011478';
                }
            } else {
                nextEl.textContent = 'Fully Booked';
                nextEl.style.color = '#ef4444';
            }
            
            // Render timeline and mini calendar
            renderTimeline(roomBookings, prefix);
            renderMiniCalendar(roomBookings, prefix);
        }

        function renderTimeline(bookings, prefix) {
            const timeline = document.getElementById(`${prefix}-timeline`);
            const totalDays = Math.ceil((availEndDate - availStartDate) / (1000 * 60 * 60 * 24)) + 1;
            const maxDisplayDays = 30;
            const displayDays = Math.min(totalDays, maxDisplayDays);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let html = '';
            for (let i = 0; i < displayDays; i++) {
                const d = new Date(availStartDate);
                d.setDate(d.getDate() + i);
                const dateStr = d.toISOString().split('T')[0];
                
                const booking = bookings.find(b => {
                    const bIn = String(b.check_in).substring(0, 10);
                    const bOut = String(b.check_out).substring(0, 10);
                    return dateStr >= bIn && dateStr < bOut;
                });
                
                let statusClass = 'available';
                let title = `Available - ${d.toLocaleDateString()}`;
                
                if (booking) {
                    const status = String(booking.status).toLowerCase().trim();
                    if (status === 'confirmed') {
                        if (parseFloat(booking.total_price) === 0) {
                            statusClass = 'blocked';
                            title = `Blocked - ${d.toLocaleDateString()}`;
                        } else {
                            statusClass = 'booked';
                            title = `${booking.guest_first_name} - ${d.toLocaleDateString()}`;
                        }
                    } else {
                        statusClass = 'pending';
                        title = `Pending - ${booking.guest_first_name} - ${d.toLocaleDateString()}`;
                    }
                }
                
                // Add today marker
                const isToday = d.getTime() === today.getTime();
                const todayClass = isToday ? 'today' : '';
                
                html += `<div class="timeline-day ${statusClass} ${todayClass}" title="${title}"></div>`;
            }
            
            timeline.innerHTML = html;
            timeline.className = 'timeline-container';
        }

        function renderMiniCalendar(bookings, prefix) {
            const calendar = document.getElementById(`${prefix}-mini-calendar`);
            if (!calendar) return;
            
            // Show 2 weeks (14 days) starting from availStartDate
            const daysToShow = 14;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let html = '';
            
            // Day headers (Su, Mo, Tu, etc.)
            const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
            
            // Calculate starting day to align with week
            const startDay = new Date(availStartDate);
            
            for (let i = 0; i < daysToShow; i++) {
                const d = new Date(startDay);
                d.setDate(d.getDate() + i);
                const dateStr = d.toISOString().split('T')[0];
                const dayNum = d.getDate();
                const isToday = d.getTime() === today.getTime();
                
                const booking = bookings.find(b => {
                    const bIn = String(b.check_in).substring(0, 10);
                    const bOut = String(b.check_out).substring(0, 10);
                    return dateStr >= bIn && dateStr < bOut;
                });
                
                let statusClass = 'available';
                if (booking) {
                    const status = String(booking.status).toLowerCase().trim();
                    if (status === 'confirmed') {
                        statusClass = parseFloat(booking.total_price) === 0 ? 'blocked' : 'booked';
                    } else {
                        statusClass = 'pending';
                    }
                }
                
                const todayClass = isToday ? 'today' : '';
                
                html += `<div class="mini-calendar-day ${statusClass} ${todayClass}" title="${d.toLocaleDateString()}">${dayNum}</div>`;
            }
            
            calendar.innerHTML = html;
            calendar.className = 'mini-calendar-grid';
        }

        function viewRoomBookings(roomId) {
            // Switch to bookings tab and filter by room
            document.getElementById('filter-status').value = 'all';
            // Filter in the table
            filteredBookingsData = allBookingsData.filter(b => b.room_id == roomId);
            renderTable();
            switchTab('bookings');
            showToast('success', `Showing all bookings for ${roomNames[roomId]}`);
        }

        // Update timestamp on initial load
        updateLastUpdated();
    </script>

</body>
</html>
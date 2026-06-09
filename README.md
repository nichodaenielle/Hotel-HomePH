# HH Project

## Overview

This workspace contains a full-stack starter project with:
- `Next.js` frontend in `frontend/`
- `Express` backend in `backend/`
- `MySQL` database integration (Hostinger hPanel)
- Hostinger GitHub auto-deployment path for the Next.js frontend
- Hostinger Node.js GitHub deployment path for the Express backend

## Frontend Setup

1. Open `frontend/`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Preview locally at `http://localhost:3000`

## Backend Setup

1. Open `backend/`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Set your MySQL connection values in `.env`
5. Start development server: `npm run dev`
6. Preview backend at `http://localhost:4000`

## Deployment Notes

### Hostinger + GitHub Deployment Steps

1. **Database**: Create a MySQL Database in your Hostinger hPanel. Note your Database Name, User, and Password (they usually have prefixes like `u123456789_`). Open **phpMyAdmin** to execute your table creation scripts.
2. **Backend**: 
   - In your Hostinger Node.js dashboard, connect your GitHub repository.
   - Set your deployment directory to `/backend` and your startup file to `server.js`.
   - Add your MySQL database details directly to the **Environment Variables** section in the Hostinger dashboard (Do not push your `.env` file to GitHub). Start the app.
3. **Frontend**: 
   - In your Hostinger Web Hosting dashboard, connect your GitHub repository.
   - Go to the **Environment Variables** section and add `NEXT_PUBLIC_API_URL=https://api.hotelathomeph.com`.
   - Set the build command to `npm run build` and the publish directory to `frontend/out`.

## VS Code Tasks

Use the tasks in `.vscode/tasks.json` to run frontend and backend from the workspace.

## Important

This scaffold assumes Node.js is installed on the local machine. Install Node.js before running the commands.

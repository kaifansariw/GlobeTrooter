# 🌍 GlobeTrotter — Travel Itinerary & Exploration Platform

GlobeTrotter is a full-stack travel planning platform built with **React (Vite)**, **Node.js / Express**, and **PostgreSQL**, styled with an **Odoo-inspired enterprise design system**.

---

## 🚀 Features

- **Trip Planner & Itinerary Builder**: Multi-day trip planning with stops, scheduled activities, and cost tracking.
- **Visual Calendar View**: Monthly interactive timeline view of all planned journeys.
- **Explore & Destination Discovery**: Live debounced search across destinations and activities with real high-resolution travel photography.
- **Budget Tracking & Visual Analytics**: Interactive budget breakdowns, category distributions, and analytics.
- **Community Travel Hub**: Traveler feed with trip tips, tags, and likes.
- **Admin Dashboard**: Real-time user management, destination analytics, booking distribution, and trends.
- **Odoo Enterprise UI**: Aubergine & teal palette, interactive filter/sort/group by popovers, clean Kanban cards.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Canvas Charts
- **Backend**: Node.js, Express.js, JWT, bcryptjs, pg (node-postgres)
- **Database**: PostgreSQL 16+
- **Styling**: Vanilla CSS (Odoo Enterprise Design System)

---

## 🏁 Quick Start

### 1. Database Setup (PostgreSQL)
Ensure PostgreSQL is running locally on port 5432:
```bash
# Create database
createdb globetrotter

# Initialize schema and seed data
psql -d globetrotter -f server/src/db/schema.sql
```

### 2. Configure Backend
Copy `.env.example` to `server/.env` and update your PostgreSQL credentials:
```bash
cp server/.env.example server/.env
```

Install server dependencies and run:
```bash
cd server
npm install
npm run dev
```
Backend API will run on `http://localhost:5000`.

### 3. Configure Frontend
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`.

---

## 🔑 Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `alex@globetrotter.app` | `password123` |
| **Traveler** | `sarah@email.com` | `password123` |
| **Traveler** | `marco@email.com` | `password123` |

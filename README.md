# Smart Hub Repair Management System 🛠️

A modern, full-stack Repair Management web application built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Supabase**. Designed to digitize device repair workflows, ticket management, customer tracking, inventory, invoicing, and technician assignments.

---

## 🌟 Features

### 👤 Customer Portal
- **Service Browsing**: Explore repair services across Mobile, Laptop, PC, Tablet, Printer, and Electronics.
- **Online Booking**: Multi-step booking form with device details, problem description, date/time scheduling.
- **Real-time Tracking**: Live status tracker with timeline (Request Received ➔ Diagnosed ➔ In Progress ➔ Completed ➔ Delivered).
- **Repair History & Invoices**: Downloadable PDF invoices with breakdown of spare parts and labour charges.
- **Feedback & Rating**: Rate services and leave reviews.

### 🛡️ Admin Portal
- **Analytics Dashboard**: Real-time stats, revenue charts, repair volume, and low stock alerts.
- **Repair Management**: Assign technicians, update status, add diagnosis and completion estimates.
- **Technician & Customer CRM**: Manage staff availability, specializations, and customer directories.
- **Inventory & Spare Parts**: Track stock levels with automated low-stock warnings.
- **Invoice Generation**: Automated invoice number generation (`INV-XXXXX`), status tracking, and PDF printing.

### 🔧 Technician Portal
- **Job Queue**: View assigned repairs with priority and status tags.
- **Diagnosis & Work Log**: Update diagnosis notes, request spare parts, and update job progress.

---

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Framer Motion, Recharts
- **Backend / Database**: Supabase (PostgreSQL, Row-Level Security, Auth, Triggers)
- **Deployment**: Vercel

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://ojuqqaglqtcfpdprclgm.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Execute `supabase-setup.sql` in your **Supabase Project SQL Editor**. This creates all tables, triggers, auto-increment sequences, RLS policies, and seed data.

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub: `https://github.com/Virus4uN/repairshop.git`
2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import the `repairshop` repository.
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will automatically detect Vite and configure the build settings.

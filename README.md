# MRC Dealer Portal

![MRC Logo](https://via.placeholder.com/150x50?text=MRC+Logo)

## 🏢 Project Overview
**MRC Dealer Portal** is a premium, high-performance web application designed for authorized dealers in the hardware and industrial supply sector. The platform allows dealers to browse a comprehensive catalog of adhesives, plumbing solutions, and industrial supplies from industry-leading brands.

### 🎯 Key Objectives
- **Seamless Authentication**: Secure Login and OTP verification for authorized dealers.
- **Product Discovery**: Categorized browsing of PVC pipes, plumbing tools, bathware, and more.
- **Brand Showcasing**: Dedicated sections for trusted partner brands like **Astral**, **Skipper**, **APL Apollo**, and **Finolex**.
- **Intuitive UI**: A modern, responsive interface built with visual excellence and user experience in mind.

---

## 🚀 Tech Stack
- **Frontend**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Styling**: Vanilla CSS (Modern, Responsive Design)
- **Routing**: State-based navigation (Initial Phase) and [React Router DOM](https://reactrouter.com/) (Integration in progress)

---

## 📂 Project Structure

```text
mrc/
├── src/
│   ├── components/      # Reusable UI components (Header, Footer, ProductCard)
│   ├── pages/           # Core page views (Home, Login, Otp, Products)
│   ├── css/             # Centralized CSS stylesheets
│   ├── assets/          # Static assets and images
│   ├── App.jsx          # Main application root and routing logic
│   └── main.jsx         # Entry point
├── public/              # Public assets (Images, Icons)
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

---

## ✨ Features

### 1. Secure Authentication
- **Dealer Login**: Specialized login for authorized personnel.
- **OTP Verification**: Two-factor authentication via email/phone for enhanced security.

### 2. Product Catalog
- **Dynamic Categories**: Effortlessly browse through various hardware categories.
- **Product Filtering**: Sidebar filters for price and category (Implementation phase).
- **Product Details**: Deep-dive into product specifications (In development).

### 3. Modern Hero Section
- High-impact visuals focused on hardware solutions.
- Quick "Shop Now" navigation and benefit highlights.

### 4. Trust & Reliability
- Partner brand integration showcasing industry trust.
- Minimalist design using a curated blue-accented palette.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🎨 Design Philosophy
The application follows a **Premium Modern Hardware** aesthetic:
- **Primary Color**: `#2563eb` (Modern Blue)
- **Typography**: Clean sans-serif hierarchy for readability.
- **Visuals**: High-quality imagery with subtle drop shadows and rounded corners.

---

## 🗺️ Roadmap
- [ ] Integration of Full JSON API for dynamic product management.
- [ ] Real-time order tracking status updates.
- [ ] Shopping cart and checkout flow.
- [ ] User profile and order history dashboard.

---

Built with ❤️ by the MRC Development Team.

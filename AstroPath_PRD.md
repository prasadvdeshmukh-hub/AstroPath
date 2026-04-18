# AstroPath - Product Requirements Document (PRD)

**Project Name:** AstroPath (Astrology Super App)

**Tagline:** "Decode Your Destiny, Daily."

---

## Project Notes

**Platform scope:** Mobile app only

**Development ownership split:**

- Codex owns mobile UI/UX development
- Claude owns backend development
- To avoid conflict, frontend and backend should work through clearly defined API contracts, shared schemas, and mock responses during UI development
- Frontend work should not directly modify backend infrastructure, database logic, or server-side business rules
- Backend work should not directly alter mobile presentation components, design systems, or UX flows without coordination

**Local project location:** `C:\Users\Vihaan\AstroPath`

---

# 1. Product Overview

## 1.1 Vision

Build a next-generation astrology platform that combines:

- Deep Vedic astrology calculations
- AI-driven personalized insights
- Real-time astrologer consultation
- Futuristic immersive user experience

The app should function as a "Cosmic Operating System" for users' daily decisions and life planning.

---

## 1.2 Objectives

- Deliver accurate Kundli generation
- Create daily engagement loop
- Enable high-revenue consultation marketplace
- Build premium subscription ecosystem
- Provide AI-powered astrology guidance

---

## 1.3 Target Users

- Astrology enthusiasts
- Users seeking life guidance (career, marriage, finance)
- Couples (compatibility matching)
- Spiritual users
- Paid consultation seekers

---

# 2. Product Scope

## 2.1 In-Scope

- Kundli generation
- Horoscope engine
- Panchang and Muhurat
- Compatibility matching
- Astrologer marketplace
- AI assistant
- Subscription and payments
- Multi-language support with full app language switching

## 2.2 Out-of-Scope (Phase 1)

- Hardware integrations
- AR/VR features
- Offline astrology engine

---

# 3. Core Features

## 3.1 Kundli Engine (Critical Module)

**Inputs:**

- Name
- Date of Birth
- Time of Birth
- Location

**Processing:**

- Julian Date conversion
- Sidereal calculations (Lahiri Ayanamsa)
- Planetary positions
- House calculation

**Outputs:**

- Lagna Chart
- Planet positions
- Nakshatra + Pada
- Dasha system
- Dosha detection

---

## 3.2 Panchang and Muhurat

- Vara, Tithi, Nakshatra, Yoga, Karana
- Sunrise / Sunset
- Moonrise / Moonset

**Muhurat Types:**

- Marriage
- Business start
- Griha Pravesh
- Travel
- Naming ceremony

---

## 3.3 Horoscope Engine

- Daily / Weekly / Monthly / Yearly

**Categories:**

- Love
- Career
- Finance
- Health

---

## 3.4 Compatibility Module

- Guna Milan
- Emotional compatibility
- Long-term compatibility insights

---

## 3.5 Astrologer Marketplace (Revenue Core)

- Chat / Call / Video consultation
- Astrologer profiles
- Pricing per minute
- Wallet system
- Ratings and reviews

---

## 3.6 AI Astrology Assistant

- Kundli explanation
- User Q&A
- Personalized insights
- Trend predictions

**Tone:** Advisory, non-deterministic

---

## 3.7 Dosha and Remedies

- Manglik
- Kaal Sarp
- Pitra Dosha

**Remedies:**

- Mantra
- Puja
- Donation
- Behavioral guidance

---

## 3.8 Multi-Astrology Support

- Vedic
- Tarot
- Numerology
- Vastu

---

## 3.9 Family Profiles

- Save multiple Kundlis
- Switch profiles

---

## 3.10 Language and Localization

- Users must be able to select their preferred app language
- The complete app language should change based on user selection
- Core flows including onboarding, dashboard, Kundli, horoscope, Panchang, consultation, AI assistant, and settings must support localization
- Language preference should be saved per user profile
- The app should be designed to support future expansion into multiple regional and international languages

---

# 4. User Experience (UX)

## 4.1 Design Principles

- Minimal + Premium
- Emotional + Spiritual
- Fast + Smooth

---

## 4.2 UI Theme

- Dark cosmic theme

**Colors:**

- Deep Blue
- Purple
- Gold

---

## 4.3 Key Screens

- Onboarding
- Birth Details Input
- Dashboard
- Kundli Screen
- Horoscope Screen
- Panchang Screen
- Muhurat Finder
- Compatibility Screen
- Marketplace
- Chat/Call Screen
- AI Assistant
- Settings and Language Selection Screen

---

## 4.4 Dashboard Layout

- Greeting
- Today's Horoscope
- Energy Score
- Quick Actions
- Moon Phase
- Notifications

---

## 4.5 Onboarding Flow

- Welcome and brand introduction
- User guidance focus selection such as career, love, finance, and spiritual growth
- Language selection during onboarding
- Notification and experience preference setup
- Smooth transition into the personalized dashboard after onboarding completion

---

## 4.6 Settings Experience

- Language and localization controls
- Personalization preferences
- Notification preferences
- Consultation mode preferences
- Trust, privacy, and disclaimer section
- Settings changes should immediately reflect across the app where applicable

---

# 5. Animation Requirements

- Dynamic Kundli generation
- Planet movement animations
- Swipe-based interactions
- Compatibility orbit merge
- Smooth transitions

**Suggested tools:**

- Lottie
- Rive

---

# 6. Monetization

## 6.1 Revenue Streams

- Consultation charges
- Premium subscriptions
- Paid reports
- Wallet recharge

## 6.2 Pricing Model

- Free Tier
- Monthly Subscription
- Yearly Subscription
- Pay-per-use consultation

---

# 7. Technical Architecture

## 7.1 Frontend

- Flutter / React Native

## 7.2 Backend

- Firebase / Node.js

## 7.3 Database

- Firestore / PostgreSQL

## 7.4 Core Services

- Astrology Engine
- AI Engine
- Notification Service
- Payment Gateway

---

# 8. Database (High Level)

## Tables

- Users
- Profiles
- Kundli Data
- Horoscope Data
- Astrologers
- Consultations
- Payments
- Subscriptions

---

# 9. Security and Privacy

- Encrypted data storage
- Secure authentication
- User consent for data
- Privacy settings

---

# 10. Disclaimers

- App provides spiritual guidance only

**Not a substitute for:**

- Medical advice
- Financial advice
- Legal advice

---

# 11. Success Metrics (KPIs)

- Daily Active Users (DAU)
- Retention Rate
- Conversion Rate (Free -> Paid)
- Avg Consultation Time
- Revenue per User

---

# 12. Phase-Wise Roadmap

## Phase 1 (MVP)

- Kundli
- Horoscope
- Panchang
- Consultation

## Phase 2

- AI assistant
- Compatibility
- Premium reports

## Phase 3

- Advanced astrology
- Gamification
- Community

---

# 13. Key Differentiators

- High accuracy Kundli engine
- AI-powered astrology
- Premium UI/UX
- Real-time consultation
- Deep personalization

---

# Final Summary

This product is not just an astrology app - it is:

- A personal life guidance platform
- A revenue-driven marketplace
- An AI-powered spiritual system

---

# Approval

**Prepared for:** Product Development

**Status:** Ready for Design & Development

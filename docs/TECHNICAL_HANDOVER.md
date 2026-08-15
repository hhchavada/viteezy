# Viteezy Frontend — Technical Handover Document

**Project:** Viteezy — Personalized Vitamins  
**Version:** 0.1.0  
**Framework:** Next.js 16 (App Router)  
**Last Updated:** June 2025  

This document describes the frontend application architecture, setup, and handover details so that new developers or the client can understand, run, and maintain the project.

---

## 1. Project Overview

### 1.1 What is Viteezy?

Viteezy is a **personalized vitamins e-commerce platform** that helps users discover and purchase customized vitamin supplements tailored to their health needs. The platform combines an **intelligent quiz-based recommendation system** with a full-featured **online store**.

**Core Value Proposition:**
- Users take a structured health quiz (goals, lifestyle, safety questions) managed via the admin panel
- The Node.js backend analyzes responses and recommends personalized vitamin products
- Users can purchase recommended products or browse the full catalog
- The platform supports multiple languages and markets (EN, NL, DE, FR, ES)

### 1.2 Key Business Features

- **Personalized Quiz System (Quiz Engine v2):** Multi-step questionnaire with goals, info pages, and admin-configured questions
- **Product Recommendations:** Rule- and matrix-driven product suggestions after quiz completion
- **E-commerce Store:** Full product catalog with categories, filters, search, and detailed product pages
- **Shopping Cart & Checkout:** Complete purchase flow with address management, subscription options, and discount codes
- **User Accounts:** Profile management, order history, saved addresses, and wishlist/favorites
- **Content Hub:** Blog articles and FAQ system for health education and support
- **Multi-language Support:** Content and UI available in 5 languages
- **Social Authentication:** Quick sign-up/login via Google and Apple accounts

### 1.3 Quick Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    VITEEZY USER JOURNEY                          │
└─────────────────────────────────────────────────────────────────┘

1. LANDING PAGE (/)
   ├─> Browse content (How It Works, Benefits, Testimonials, Blog, FAQ)
   ├─> Click "Start Quiz" ──┐
   └─> Browse Products ──────┼─> Direct Purchase Flow
                             │
2. QUIZ FLOW (/quiz → /quiz/questions → /recommendation)
   ├─> Quiz start page (configuration from admin)
   ├─> Goal selection + structured questions (text, date, pills, info pages)
   ├─> Guest or logged-in session (magic link / save progress supported)
   ├─> Quiz completes → Recommendations page
   └─> User adds recommended products to cart
                             │
3. PRODUCT BROWSING (/products, /products/[id])
   ├─> Filter, search, browse categories
   ├─> View product details (images, description, reviews)
   └─> Add products to cart
                             │
4. SHOPPING CART (Sidebar)
   ├─> Review items, update quantities
   ├─> Apply discount codes
   └─> Click "Checkout"
                             │
5. CHECKOUT (/checkout)
   ├─> Enter/select shipping address
   ├─> Choose subscription plan (if applicable)
   ├─> Apply coupon codes
   ├─> Review order summary
   └─> Click "Pay Now"
                             │
6. PAYMENT & ORDER CONFIRMATION
   ├─> Order created → Payment gateway
   ├─> Payment successful
   └─> Order confirmation page (/orderConfirmed)
       └─> Shows order details & "What Happens Next" timeline

───────────────────────────────────────────────────────────────────

ALTERNATIVE FLOWS:
• Account Management (/account): Profile, Orders, Addresses, Favorites
• Content: Blog (/blog), FAQ (/faq), Static Pages (/static-pages/[slug])
• Membership: Subscribe to membership plan (/membership)
• Auth: Login, Register, Password Reset, Email Verification
```

---

## 2. User Flows & Project Workflow

This section explains how users interact with the platform and the complete journey from discovery to purchase.

### 2.1 Primary User Journey: Quiz → Recommendation → Purchase

**Step 1: Landing on Homepage**
- User arrives at the homepage (`/`)
- Sees hero section with value proposition
- Views sections: "How It Works", "Member Benefits", "Why Choose Us", testimonials, blog preview, FAQ
- Can click "Start Quiz" or browse products directly

**Step 2: Starting the Quiz**
- User clicks "Start Quiz" or navigates to `/quiz`
- Start page loads quiz configuration from the backend (`getQuizConfiguration`)
- `QuizStartButton` checks for an active saved session (`getActiveQuizSession`) or creates a new one (`createQuizSession`)
- User is sent to `/quiz/questions` to answer questions

**Step 3: Quiz Session Flow (`/quiz/questions`)**
- `QuizQuestions` drives the flow: goals → info pages → question steps
- Answers submitted via `submitQuizAnswer` (PATCH `/quiz/session/:id/answers`)
- Session state persisted in localStorage (`quizSessionStorage`) and on the server
- User can save progress (`saveQuizSession`) or discard (`discardQuizSession`)
- Leave guard warns before navigating away mid-quiz

**Step 4: Quiz Completion & Recommendations**
- On complete (`completeQuizSession`), user is redirected to `/recommendation`
- Recommendation page loads quiz results, product suggestions, and checkout options
- User can adjust pill quantities, add add-ons, and proceed to cart/checkout

**Step 5: Product Discovery**
- User can browse products at `/products`
- Filter by categories, sort by price/popularity, search by keyword
- Click any product to view detail page (`/products/[id]`)
- Product detail shows:
  - Image gallery (main image + gallery)
  - Product info (title, description, price, ratings)
  - Variant selection (Sachets vs. Standup Pouch)
  - Benefits overview
  - Comparison table (if applicable)
  - Similar products
  - Customer reviews
  - FAQ section
- User can add product to cart from detail page

**Step 6: Shopping Cart**
- Cart is accessible via **cart sidebar** (opens from header icon)
- Shows all items with quantities, prices, subtotal
- User can:
  - Update quantities
  - Remove items
  - Apply discount codes
  - View suggested products
- Click "Proceed to Checkout" opens checkout page

**Step 7: Checkout Process**
- Checkout page (`/checkout`) has multiple sections:
  - **Contact Information:** Email, phone
  - **Shipping Address:** 
    - Select from saved addresses OR
    - Add new address (form with country, street, city, postal code, etc.)
  - **Packaging Options:** Choose variant (Sachets/Pouch) if applicable
  - **Subscription Plans:** Select subscription frequency (one-time, monthly, etc.)
  - **Discount Code:** Apply coupon codes
  - **Add to Order:** Browse and add more products
  - **Order Summary:** Shows cart items, pricing breakdown, shipping cost, discount, total
- User reviews all information and clicks "Pay Now"

**Step 8: Payment & Order Confirmation**
- On "Pay Now":
  1. Cart is validated (`validateCart`)
  2. Order is created (`createOrder`) with all details (items, address, subscription plan, coupon)
  3. Payment is initiated (`createPayment`) with order ID and payment method
  4. User is redirected to payment gateway (external URL) OR shown order confirmation
- After payment:
  - User lands on `/orderConfirmed?orderId=[id]`
  - Order confirmation page shows:
    - Success message
    - Order details (items, shipping address, total)
    - "What Happens Next" timeline (Order Confirmed → Preparing → Shipped → Delivered)
    - Link to continue shopping

### 2.2 Secondary User Journeys

**A. Direct Product Purchase (Without Quiz)**
- User browses products → Adds to cart → Checks out → Pays
- Same checkout flow as above

**B. Account Management**
- User logs in → Goes to `/account`
- **Tabs:**
  - **Profile:** Edit name, email, phone, language preference
  - **Orders:** View order history, order details, tracking
  - **Addresses:** Manage saved shipping addresses (add, edit, delete, set default)
  - **Favorites:** View wishlist items, add/remove favorites

**C. Content Consumption**
- **Blog:** Browse articles at `/blog`, read individual posts at `/blog/[id]`
- **FAQ:** Browse categories at `/faq`, view articles at `/faq/[slug]/[id]`
- **Static Pages:** Read privacy policy, terms, etc. at `/static-pages/[slug]`

**D. Membership Flow**
- User visits `/membership` to learn about membership benefits
- Can proceed to `/membership/payment` to subscribe
- Membership may provide discounts or special access

### 2.3 Authentication Flows

**Registration:**
1. User clicks "Create Account" or "Sign Up"
2. Fills form: name, email, password, phone (optional)
3. Submits → Account created → Email verification OTP sent
4. User enters OTP on `/verify-email` → Account activated → Auto-logged in

**Login:**
- **Email/Password:** Enter credentials → Login → Redirected to intended page or home
- **Google Login:** Click "Sign in with Google" → Firebase handles OAuth → Backend validates → User logged in
- **Apple Login:** Click "Sign in with Apple" → Firebase handles OAuth → Backend validates → User logged in

**Password Reset:**
1. User clicks "Forgot Password" → Enters email
2. Reset link/OTP sent to email
3. User enters new password on `/resetPassword` → Password updated → Can login

**Change Password (Logged In):**
- User goes to `/changePassword` → Enters current password + new password → Password updated

### 2.4 Language & Localization Flow

- User selects language from header dropdown
- Language preference saved in cookie (`NEXT_LOCALE`)
- UI strings update immediately (via next-intl)
- For **unauthenticated users:** Language sent as query param to API (e.g., `?lang=en`)
- For **authenticated users:** Language fetched from user profile (`/users/me`)
- Product names, descriptions, blog content, FAQ content come from backend in selected language

### 2.5 Quiz System Deep Dive (Quiz Engine v2)

**Architecture:** All quiz logic runs on the **Node.js backend** (`/api/v1/quiz/*`). The legacy Python AI chat quiz has been removed from the frontend.

**API client:** `healthQuizApi` in `src/store/api/healthQuizApi.ts`  
**Base URL:** `NEXT_PUBLIC_API_QUIZ_URL` (falls back to `NEXT_PUBLIC_API_BASE_URL`; at least one must be set)

**Key endpoints:**

| Action | RTK hook / endpoint | Backend route |
|--------|---------------------|---------------|
| Load start page config | `useGetQuizConfigurationQuery` | `GET /quiz-configuration` |
| Create session | `useCreateQuizSessionMutation` | `POST /quiz/session` |
| Resume active session | `useLazyGetActiveQuizSessionQuery` | `GET /quiz/session/active` |
| Get session state | `useLazyGetQuizSessionQuery` | `GET /quiz/session/:id` |
| Submit answer / goals | `useSubmitQuizAnswerMutation` | `PATCH /quiz/session/:id/answers` or `PATCH /quiz/session/:id/goals` |
| Complete quiz | `useCompleteQuizSessionMutation` | `POST /quiz/session/:id/complete` |
| Recommendations | `useGetQuizRecommendationCompleteQuery` | `POST /quiz/recommendation/:id/complete` |

**Session flow:**

1. User lands on `/quiz` → configuration and CTA from admin-managed quiz settings.
2. `QuizStartButton` creates or resumes a session → navigates to `/quiz/questions`.
3. `QuizQuestions` walks through goals, info pages, and questions; each answer is PATCHed to the backend.
4. On completion, user goes to `/recommendation` with the recommendation ID from the session.
5. Guest users can use a guest token (`quizGuestToken.ts`); logged-in users attach the Bearer token.

**Quiz UI components (v2):**

| Component | Role |
|-----------|------|
| `index.tsx` (`QuizStartPage`) | Quiz landing / start page |
| `QuizStartButton` | Create or resume session |
| `QuizQuestions` | Main question flow |
| `questions/QuizQuestionView` | Renders a single question |
| `questions/QuizGoalSelection` | Goal picker step |
| `questions/QuizInfoPageView` | Info / education pages between questions |
| `ContinueQuizModal` | Resume vs start new when a saved session exists |
| `SavePlanModal` | Save progress / contact capture |
| `MagicLinkPage` | `/quiz/magic-link` — recommendation access via magic link |
| `recommendations/` | Post-quiz recommendation and checkout UI |

**Subscription product change:** From account subscription settings, "Take quiz" navigates to `/quiz` (same v2 flow) rather than an in-modal chat quiz.

**Admin:** Quiz questions, goals, safety rules, matrix, and configuration are managed in `viteezy-v2-admin` under Quiz Management.

---

## 3. Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16.0.3 (App Router) |
| **UI** | React 19.2.0 |
| **Language** | TypeScript 5 |
| **State & API** | Redux Toolkit 2.x, RTK Query |
| **Styling** | Tailwind CSS 4, tw-animate-css |
| **i18n** | next-intl 4.x |
| **Forms** | react-hook-form, yup, @hookform/resolvers |
| **Auth (social)** | Firebase 12.x (Google, Apple) |
| **Animations** | GSAP 3.x, AOS, Lottie |
| **UI primitives** | Radix UI (Dialog, Accordion, Slot) |
| **Other** | lucide-react, react-hot-toast, embla-carousel-react, libphonenumber-js |

---

## 4. Project Structure

```
viteezy-v2-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages & layout
│   │   ├── layout.tsx          # Root layout (providers, fonts, header/footer placeholders)
│   │   ├── globals.css         # Global styles, Tailwind, CSS variables
│   │   ├── fonts/              # Local fonts (Cardinal, Saans)
│   │   ├── (auth)/             # Auth routes: login, createAccount, forgotPassword, etc.
│   │   ├── account/            # User account
│   │   ├── blog/               # Blog listing & detail
│   │   ├── checkout/           # Checkout flow
│   │   ├── faq/                # FAQ categories & articles
│   │   ├── membership/         # Membership & payment
│   │   ├── orderConfirmed/     # Order success
│   │   ├── products/           # Product listing & detail
│   │   ├── quiz/               # Quiz start, questions, magic-link
│   │   ├── recommendation/     # Post-quiz recommendations
│   │   ├── static-pages/       # CMS-like static pages (e.g. privacy, terms)
│   │   └── ...                 # aboutUs, contactUs, ourTeam, etc.
│   │
│   ├── components/             # Reusable UI and feature components
│   │   ├── account/            # Profile, addresses, order history
│   │   ├── auth/               # Login, register, reset password
│   │   ├── checkout/           # Checkout steps, summary, addresses
│   │   ├── constants/          # Routes, countries, footer config
│   │   ├── faq/                # FAQ categories, articles, banner
│   │   ├── footer/             # Footer, mobile menu
│   │   ├── header/             # Header, side menu, search, language dialog
│   │   ├── home/               # Home sections (hero, how it works, FAQ, etc.)
│   │   ├── layouts/            # MainLayout (header + footer + content wrapper)
│   │   ├── membership/         # Membership UI
│   │   ├── products/           # Product list, detail, comparison, gallery
│   │   ├── quiz/               # Quiz Engine v2 UI (start, questions, modals)
│   │   ├── staticPage/         # Static page content
│   │   ├── types/              # Shared component types
│   │   └── ui/                 # Buttons, inputs, carousel, cart sidebar, etc.
│   │
│   ├── store/                  # Redux store and API layer
│   │   ├── store.ts            # configureStore (baseApi + healthQuizApi)
│   │   ├── storeProvider.tsx   # Client-side Redux Provider
│   │   ├── api/
│   │   │   ├── baseApi.ts      # RTK Query base: auth, token refresh, caching
│   │   │   ├── authApi.ts      # Login, register, logout, social login, password flows
│   │   │   ├── productApi.ts   # Products, categories, product by ID
│   │   │   ├── cartApi.ts      # Cart CRUD, validate, checkout summary
│   │   │   ├── orderApi.ts     # Orders
│   │   │   ├── healthQuizApi.ts # Quiz Engine v2 (separate base URL)
│   │   │   ├── blogApi.ts      # Blogs, categories
│   │   │   ├── faqApi.ts       # FAQs
│   │   │   ├── wishlistApi.ts
│   │   │   ├── userApi.ts, generalSettingsApi.ts, staticPagesApi.ts
│   │   │   ├── couponApi.ts, membershipApi.ts, paymentApi.ts
│   │   │   ├── addressApi.ts, subscriptionApi, landingApi, teamApi, aboutUsApi
│   │   │   └── types/         # Request/response types per domain
│   │   └── hooks.ts            # useAppDispatch, useAppSelector, useAppStore
│   │
│   ├── lib/                    # Utilities and services
│   │   ├── utils.ts            # cn, FixedPortal, etc.
│   │   ├── firebase.ts         # Firebase app, auth, Google/Apple providers
│   │   ├── cartSidebar.tsx     # Cart sidebar context
│   │   ├── generalSettings.ts  # Map API general settings to languages/social links
│   │   ├── faqSearch.ts        # FAQ search helpers
│   │   └── services/
│   │       ├── language.ts     # getLanguageCode, getLanguageParam (for API)
│   │       └── locale.ts       # Server: getUserLocale, setUserLocale (cookies)
│   │
│   ├── i18n/
│   │   ├── config.ts           # locales: en, nl, de, fr, es; defaultLocale
│   │   └── request.ts          # next-intl getRequestConfig (messages, locale from cookie)
│   │
│   ├── hooks/                  # useLanguageSwitcher, useGeneralSettings, useClickOutside, etc.
│   └── messages/               # JSON message files per locale (en.json, nl.json, …)
│
├── public/                     # Static assets
├── next.config.ts              # next-intl plugin, standalone output, images, webpack
├── tailwind.config.ts          # Theme (colors, fonts, screens)
├── tsconfig.json               # Paths: @/* -> ./src/*
├── postcss.config.mjs          # Tailwind PostCSS
└── package.json
```

---

## 5. Architecture Highlights

### 4.1 Data & API

- **Single main API:** All domain APIs (auth, products, cart, orders, blog, FAQ, etc.) are **injected** into one RTK Query API (`baseApi`) in `src/store/api/baseApi.ts`. They share:
  - Base URL from `NEXT_PUBLIC_API_BASE_URL`
  - Automatic **Bearer token** attachment (except public endpoints)
  - **Token refresh** on 401 (refresh token in localStorage)
  - **Cache tags** for invalidation (e.g. `Auth`, `User`, `Cart`, `Product`, `Order`, `Blog`, `FAQ`, `Wishlist`, `Addresses`, `Subscription`, `Membership`)
- **Quiz API (Quiz Engine v2):** Uses a **separate** RTK Query API (`healthQuizApi`) with base URL from `NEXT_PUBLIC_API_QUIZ_URL` (falls back to `NEXT_PUBLIC_API_BASE_URL`). Registered in `store.ts` alongside `baseApi`. Both point at the same Node.js backend in production; quiz routes live under `/api/v1/quiz/*`.
- **Auth storage:** Access token, refresh token, and user JSON are stored in **localStorage** and cleared on logout; logout also redirects to `/login`.

### 4.2 Internationalization (i18n)

- **next-intl** is used for UI strings. Locale is resolved **server-side** via `getUserLocale()` in `src/i18n/request.ts`, which reads the `NEXT_LOCALE` cookie; default is `en`.
- **Supported locales:** `en`, `nl`, `de`, `fr`, `es` (see `src/i18n/config.ts`).
- **Message files:** `src/messages/{locale}.json`.
- **API language:** For unauthenticated users, language is sent as a query parameter (e.g. `lang=en`); for logged-in users it is taken from user profile (e.g. `/users/me`). Logic is in `src/lib/services/language.ts` and used in `productApi` and similar.

### 4.3 Routing

- **Next.js App Router** only (no `pages/`). Routes are file-based under `src/app/`.
- **Auth routes** are under `(auth)` (e.g. `/login`, `/createAccount`, `/forgotPassword`, `/resetPassword`, `/verify-email`, `/changePassword`).
- **Dynamic routes:** e.g. `products/[id]`, `blog/[id]`, `faq/[slug]`, `faq/[slug]/[id]`, `static-pages/[slug]`.

### 4.4 UI Layout

- **Root layout** (`src/app/layout.tsx`) wraps the app with:
  - `NextIntlClientProvider`
  - `StoreProvider` (Redux)
  - `MaintenanceGate` (optional scheduled maintenance via Socket.IO — see `NEXT_PUBLIC_SERVER_URL`)
  - `ClientLayoutWrapper`
  - `CartSidebarProvider`
  - Scroll/animations wrappers and a main content area.
- **Page-level layout:** Many pages use `MainLayout` from `src/components/layouts/MainLayout.tsx`, which includes Header (or SimpleHeader), optional Footer, and a content wrapper. Header/Footer are commented out in the root layout but used inside `MainLayout` for most pages.

### 4.5 Styling

- **Tailwind CSS 4** with theme extended in `tailwind.config.ts` (e.g. `primary`, `secondary`, custom screens like `3xl`).
- **Design tokens** are defined in `src/app/globals.css` as CSS variables (e.g. `--color-primary-color`, `--font-saans`).
- **Local fonts:** Cardinal and Saans are loaded from `src/app/fonts/` and applied via `layout.tsx` and component class names.

---

## 6. Environment Variables

Copy `.env.example` to `.env` and adjust for your environment. All variables use the `NEXT_PUBLIC_` prefix (embedded at build time). Restart dev server or rebuild after changes.

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Node.js backend API base (e.g. `http://localhost:8050/api/v1`) | Yes |
| `NEXT_PUBLIC_API_QUIZ_URL` | Quiz Engine v2 API base (same Node backend as above in most environments) | Yes |
| `NEXT_PUBLIC_ADMIN_ORIGIN` | Admin panel origin for preview links from the storefront | Yes |
| `NEXT_PUBLIC_SERVER_URL` | Socket.IO origin for `MaintenanceGate` (backend root without `/api/v1`; empty disables maintenance checks locally) | No |

`.env` and `.env.local` are gitignored; `.env.example` is committed as the reference template.

**Deployment:** CI injects these via Docker build args in `.github/workflows/deploy.yml` (dev and staging values differ — see that file for hostnames).

---

## 7. How to Run the Project

### 7.1 Prerequisites

- **Node.js** (version compatible with Next.js 16; LTS recommended)
- **npm** or **pnpm** (package manager used in scripts)

### 7.2 Install Dependencies

```bash
npm install
# or
pnpm install
```

### 7.3 Environment Setup

Create a `.env` from the template:

```bash
cp .env.example .env
```

Example local values:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8050/api/v1
NEXT_PUBLIC_API_QUIZ_URL=http://localhost:8050/api/v1
NEXT_PUBLIC_ADMIN_ORIGIN=http://localhost:8081
NEXT_PUBLIC_SERVER_URL=http://localhost:8050
```

Replace with the URLs for your environment. Quiz and main API both use the **Node.js backend** — do not point `NEXT_PUBLIC_API_QUIZ_URL` at a legacy Python `/py/` service.

### 7.4 Development

```bash
npm run dev
# or
pnpm dev
```

The app runs at **http://localhost:8080** (port 8080 is set in `package.json`).

### 7.5 Build (Production)

```bash
npm run build
# or
pnpm build
```

### 7.6 Start (Production)

```bash
npm run start
# or
pnpm start
```

Again, the app listens on port 8080.

### 7.7 Lint

```bash
npm run lint
# or
pnpm lint
```

---

## 8. Main Application Routes

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/quiz` | Quiz start page (Quiz Engine v2) |
| `/quiz/questions` | Active quiz question flow |
| `/quiz/magic-link` | Access recommendations via magic link |
| `/recommendation` | Post-quiz product recommendations |
| `/products` | Product listing |
| `/products/[id]` | Product detail |
| `/checkout` | Checkout |
| `/orderConfirmed` | Order confirmation |
| `/orderConfirmed/success` | Order success |
| `/account` | Account (profile, orders, addresses, favorites) |
| `/login` | Login |
| `/createAccount` | Registration |
| `/forgotPassword` | Forgot password |
| `/resetPassword` | Reset password |
| `/verify-email` | Email verification |
| `/changePassword` | Change password (authenticated) |
| `/faq` | FAQ listing |
| `/faq/[slug]` | FAQ category |
| `/faq/[slug]/[id]` | FAQ article |
| `/blog` | Blog listing |
| `/blog/[id]` | Blog post |
| `/membership` | Membership |
| `/membership/payment` | Membership payment |
| `/contactUs` | Contact |
| `/aboutUs` | About us |
| `/ourTeam` | Our team |
| `/static-pages/[slug]` | Static pages (e.g. privacy, terms) |

---

## 9. Key Features (Summary)

- **Quiz flow (v2):** Structured multi-step quiz (`/quiz` → `/quiz/questions` → `/recommendation`); admin-configured questions; session save/resume; guest and logged-in support via `healthQuizApi`.
- **Products & cart:** Product list with filters/sort, product detail (gallery, comparison, benefits), add to cart, cart sidebar, checkout with addresses and coupons.
- **Auth:** Email/password login and registration; Google and Apple login via Firebase; forgot/reset password; email verification (OTP); change password when logged in.
- **Account:** Profile, addresses, order history, favorites (wishlist).
- **Content:** Blog, FAQ (categories and articles), static pages (slug-based).
- **Internationalization:** Five locales (EN, NL, DE, FR, ES); locale from cookie; API language for products/content.
- **General settings:** Languages and social links can be driven by backend general settings (see `generalSettingsApi`, `useGeneralSettings`, `getEnabledLanguagesFromSettings`).

---

## 10. Third-Party Services & Integrations

This section lists every third-party service the platform uses, **what each is used for on the platform**, and where it is configured.

| Service | Used for on the platform | Config / API key | Plans |
|--------|---------------------------|------------------|-------|
| **Firebase (Google)** | **Google Sign-In** and **Apple Sign-In** (social login). Also **Firebase Analytics** for usage/events. | Config in `src/lib/firebase.ts` (apiKey, authDomain, projectId, etc.). Should be moved to env for production. | Free (Spark) + paid (Blaze) |
| **Klaviyo** | **Marketing & onsite**: email capture, popups, onsite messaging, and analytics (company_id in layout script). | Script in root layout: `company_id=VMhqn7`. No API key in frontend. | Free tier + paid |
| **Google Fonts** | **UI typography**: Geist and Geist Mono fonts via Next.js (`next/font/google`). | No API key; Next.js fetches at build time. | Free |
| **Backend API** | **All app data**: auth, products, cart, orders, user profile, blog, FAQ, static pages, addresses, wishlist, coupons, checkout summary. | `NEXT_PUBLIC_API_BASE_URL` in `.env`. Auth via Bearer token from login. | Your hosting |
| **Quiz Engine v2 API** | **Quiz flow:** configuration, sessions, answers, completion, recommendations. Same Node backend as main API. | `NEXT_PUBLIC_API_QUIZ_URL` in `.env`. Bearer token for logged-in users; guest token for anonymous sessions. | Your hosting |
| **Stripe / Mollie / PayPal** | **Payment methods** shown in checkout; user selects one and is sent to gateway. Payment creation is done by **your backend** (no keys in frontend). | No keys in this repo; backend holds gateway credentials. | Per-provider (fees / paid plans) |
| **Unsplash** | **Placeholder images** in constants (e.g. testimonials, fallbacks). | Direct image URLs only; no API key. | Free (with attribution) |

### 10.1 What each service is used for (detail)

- **Firebase**
  - **Authentication:** “Sign in with Google” and “Sign in with Apple” on login/register; tokens are sent to your backend to create or link the user.
  - **Analytics:** Page views and events (initialized in `src/lib/firebase.ts` on the client).

- **Klaviyo**
  - **Onsite:** Popups, signup forms, and onsite messaging (script loads in `src/app/layout.tsx`).
  - **Marketing:** Email and campaigns are managed in Klaviyo; the script ties site behavior to the Klaviyo account (`company_id=VMhqn7`).

- **Google Fonts**
  - **Platform use:** Geist and Geist Mono fonts used across the app (loaded in root layout).

- **Backend API**
  - **Platform use:** Login/register, products, categories, cart, checkout summary, orders, user profile, addresses, blog, FAQ, static pages, general settings, wishlist, coupons. All of this is powered by `NEXT_PUBLIC_API_BASE_URL`.

- **Quiz Engine v2 API**
  - **Platform use:** Quiz configuration, session lifecycle, answer submission, completion, and product recommendations. Powered by `healthQuizApi` and `NEXT_PUBLIC_API_QUIZ_URL` (Node.js `/api/v1/quiz/*`). The legacy Python AI chat quiz is no longer used by the frontend.

- **Stripe / Mollie / PayPal**
  - **Platform use:** Checkout shows these as payment options; user clicks “Pay Now”, backend creates the order and payment and redirects to the provider. No payment API keys or secrets in the frontend.

- **Unsplash**
  - **Platform use:** Placeholder/fallback images (e.g. in `src/components/constants/index.tsx`).

---

## 11. Build & Deployment

- **Output:** Next.js is configured with `output: "standalone"` in `next.config.ts`, which produces a standalone build suitable for Docker or minimal Node server.
- **Docker:** `Dockerfile` accepts build args for all four `NEXT_PUBLIC_*` variables (see `.env.example`).
- **CI/CD:** `.github/workflows/deploy.yml` builds and deploys to dev/staging with environment-specific API and admin URLs.
- **Port:** Dev and start scripts use port **8080**.
- **Source maps:** Production browser source maps are disabled; dev uses resilient source map options to avoid third-party map parsing issues.

---

## 12. Handover Notes for Client / New Team

1. **Backend dependency:** The frontend expects the Node.js backend (`viteezy-v2-BE`). Set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_API_QUIZ_URL` to the same API origin (including `/api/v1`). Ensure CORS and auth contracts match.
2. **Quiz Engine v2 only:** Legacy AI chat quiz code (`quizApi`, `/quiz/[sessionId]`, Python `/py/` proxy) has been removed. Old bookmarked session URLs will 404; users should start at `/quiz`.
3. **Python service:** The backend repo still runs a small Python service for **PDF generation only** — it is not part of the storefront quiz flow.
4. **Fonts:** Local fonts (Cardinal, Saans) live under `src/app/fonts/`. Ensure these directories and files are present in the delivered codebase.
5. **API documentation:** For exact request/response shapes and error handling, refer to the backend API documentation. Types in `src/store/api/types/` and `healthQuizApi.ts` reflect current frontend expectations.
6. **Further reading:** The API layer is documented in `src/store/api/README.md` (RTK Query usage, hooks, tags, and adding new endpoints). Backend overview: `viteezy-v2-BE/README.md`.

---

## 13. Document History

| Date | Version | Changes |
|------|---------|---------|
| Feb 2025 | 1.0 | Initial technical handover document |
| Jun 2025 | 1.1 | Quiz Engine v2: replaced legacy AI chat quiz docs; updated env vars, routes, API layer, deployment |

---

*This document is intended for developers and the client during project handover. For API usage details, see `src/store/api/README.md`. For backend contracts, refer to the backend API documentation.*

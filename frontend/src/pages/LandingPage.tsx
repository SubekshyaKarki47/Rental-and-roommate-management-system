import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Calendar,
  Home,
  Users,
  Building2,
  Building,
  Search,
  ArrowRight,
  Heart,
  Star,
  Check,
  ChevronDown,
  MessageSquare,
  Handshake,
  Clock,
  CreditCard,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onNavigateTab?: (tab: string) => void;
}

const FEATURED_PROPERTIES = [
  {
    id: 1,
    title: 'Modern Apartment',
    location: 'Thamel, Kathmandu',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
    beds: '2 Bed',
    baths: '1 Bath',
    area: '850 sq.ft.',
    price: 'Rs. 18,000/month',
  },
  {
    id: 2,
    title: 'Cozy Room in Shared House',
    location: 'Lalitpur, Lalitpur',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80',
    beds: '1 Bed',
    baths: '1 Bath',
    area: '450 sq.ft.',
    price: 'Rs. 12,000/month',
  },
  {
    id: 3,
    title: 'Studio Apartment',
    location: 'Bhatbhateni, Kathmandu',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
    beds: '1 Bed',
    baths: '1 Bath',
    area: '450 sq.ft.',
    price: 'Rs. 15,000/month',
  },
  {
    id: 4,
    title: 'Luxury Apartment',
    location: 'Lazimpat, Kathmandu',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    beds: '3 Bed',
    baths: '2 Bath',
    area: '1,200 sq.ft.',
    price: 'Rs. 28,000/month',
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Student, Kathmandu',
    quote: 'RoomMateHub made it so easy to find a great roommate. The matching really works!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    id: 2,
    name: 'Ankit Raj',
    role: 'Working Professional, Lalitpur',
    quote: 'I found my current apartment through RoomMateHub. The process was smooth and secure.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    id: 3,
    name: 'Sneha Gurung',
    role: 'Student, Kathmandu',
    quote: "It's not just about finding a place, it's about finding people who fit your lifestyle.",
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    rating: 5,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateTab }) => {
  const { isAuthenticated, setShowAuthModal, setAuthModalTab, openAuthModal } = useAuth();

  const [location, setLocation] = useState('');
  const [pricingTab, setPricingTab] = useState<'tenant' | 'landlord'>('tenant');

  const handleOpenAuth = (tab: 'login' | 'register') => {
    if (isAuthenticated && onNavigateTab) {
      onNavigateTab('properties');
    } else {
      setAuthModalTab(tab);
      setShowAuthModal(true);
    }
  };

  const handleCardIntent = (intent: string) => {
    if (isAuthenticated && onNavigateTab) {
      if (intent === 'roommate') onNavigateTab('roommates');
      else onNavigateTab('properties');
    } else {
      openAuthModal('register', intent as any);
    }
  };

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 font-sans text-slate-900 dark:text-slate-100 relative">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Exact Replica of Mockup)                                 */}
      {/* ========================================================================= */}
      <section className="pt-2 sm:pt-6 relative">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Pill, Headline, Subtitle, Search, Trust points */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            {/* Tag Pill */}
            <div>
              <span className="hero-tag-pill">
                Find a place  •  Find a roommate  •  Build your community
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[50px] font-extrabold font-display tracking-tight text-slate-900 dark:text-white leading-[1.14]">
                Find a place you’ll<br />
                <span className="text-blue-600 dark:text-blue-400">love to live in.</span>
              </h1>
              <p className="mt-3.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                Discover verified rentals, find compatible roommates, and make your next move easier — all in one place.
              </p>
            </div>

            {/* Floating Search Bar Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 p-2 sm:p-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                
                {/* 1. Location */}
                <div className="sm:col-span-5 px-3 py-1 flex items-center justify-between gap-2 cursor-pointer">
                  <div className="flex items-center gap-2.5 flex-1">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] font-medium text-slate-400 leading-none">Location</span>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Where do you want to live?"
                        className="w-full text-xs font-semibold text-slate-800 dark:text-white bg-transparent focus:outline-none placeholder:text-slate-400 mt-0.5"
                      />
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>

                {/* 2. Move-in date */}
                <div className="sm:col-span-3 px-3 py-1 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] font-medium text-slate-400 leading-none">Move-in date</span>
                      <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">Any date</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>

                {/* 3. Property type */}
                <div className="sm:col-span-2 px-3 py-1 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] font-medium text-slate-400 leading-none">Property type</span>
                      <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">Any</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>

                {/* 4. Search Button */}
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 transition text-xs cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                Verified listings
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                Trusted landlords
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                Safe & secure
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                Easy communication
              </span>
            </div>

          </div>

          {/* Right Column: Hero Visual with Roommates on Couch */}
          <div className="lg:col-span-6 relative">
            <div className="hero-image-wrapper aspect-[16/10] sm:aspect-[16/9.5]">
              <img
                src="/landing/hero_roommates.jpg"
                alt="Four happy roommates laughing on couch in sunny modern apartment"
                className="w-full h-full object-cover"
              />

              {/* Top-Right Handwritten Cursive Script inside Image */}
              <div className="absolute top-4 right-5 handwriting-note -rotate-6 text-white drop-shadow-md bg-black/20 backdrop-blur-xs px-3 py-1 rounded-2xl pointer-events-none">
                <span className="text-white">Better homes</span><br />
                <span className="text-white">Better together</span>
                <span className="handwriting-heart text-white">♡</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. WHAT ARE YOU LOOKING FOR? (4 Category Cards)                          */}
      <section className="explore-options-section space-y-6 text-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
            What are you looking for?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore your options and take the first step towards your perfect home.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Find a place */}
          <div
            onClick={() => handleCardIntent('place')}
            className="explore-card"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mb-4">
                <Home className="w-5 h-5 fill-blue-600 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Find a place</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Browse verified rentals in your preferred location.
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <div className="explore-card-arrow bg-blue-50 dark:bg-blue-950 text-blue-600">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 2: Find a roommate */}
          <div
            onClick={() => handleCardIntent('roommate')}
            className="explore-card"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Find a roommate</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Connect with like-minded people and find your perfect match.
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <div className="explore-card-arrow bg-purple-50 dark:bg-purple-950 text-purple-600">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 3: Find a place & roommate */}
          <div
            onClick={() => handleCardIntent('both')}
            className="explore-card"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Find a place & roommate</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Get the best of both worlds — a home and a roommate.
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <div className="explore-card-arrow bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 4: I'm a landlord */}
          <div
            onClick={() => handleCardIntent('landlord')}
            className="explore-card"
          >
            <div>
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">I’m a landlord</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                List your properties and find reliable tenants.
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <div className="explore-card-arrow bg-orange-50 dark:bg-orange-950 text-orange-600">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURED PROPERTIES (4 Cards Replica)                                  */}
      {/* ========================================================================= */}
      <section id="properties" className="space-y-6">
        <div className="flex items-end justify-between">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
              Featured Properties
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Handpicked homes for your next chapter.
            </p>
          </div>
          <button
            onClick={() => handleOpenAuth('login')}
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition cursor-pointer"
          >
            <span>View all properties</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_PROPERTIES.map((prop) => (
            <div
              key={prop.id}
              onClick={() => handleOpenAuth('login')}
              className="property-card-replica group text-left"
            >
              {/* Image with Tag & Heart */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={prop.image}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-3 left-3 bg-emerald-100 text-emerald-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                  For Rent
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenAuth('login');
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-rose-500 transition"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              {/* Card Details */}
              <div className="p-4 space-y-2.5">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    📍 {prop.location}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>🛏 {prop.beds}</span>
                  <span>🚿 {prop.baths}</span>
                  <span>📐 {prop.area}</span>
                </div>

                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {prop.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS (4 Sequential Steps with Arrows)                         */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="space-y-8 text-left scroll-mt-20">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Get started in just a few simple steps.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-4 pt-2">
          
          {/* Step 1 */}
          <div className="how-it-works-step">
            <div className="step-icon-wrapper">
              <span className="step-circle-badge">1</span>
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Search & Explore</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              Find properties or roommates that match your preferences.
            </p>
          </div>

          <div className="hidden md:block text-slate-300 dark:text-slate-700 text-lg">→</div>

          {/* Step 2 */}
          <div className="how-it-works-step">
            <div className="step-icon-wrapper">
              <span className="step-circle-badge">2</span>
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Connect & Chat</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              Talk, ask questions, and get to know each other.
            </p>
          </div>

          <div className="hidden md:block text-slate-300 dark:text-slate-700 text-lg">→</div>

          {/* Step 3 */}
          <div className="how-it-works-step">
            <div className="step-icon-wrapper">
              <span className="step-circle-badge">3</span>
              <Handshake className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Get Matched</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              When you both agree, create your plan and move forward.
            </p>
          </div>

          <div className="hidden md:block text-slate-300 dark:text-slate-700 text-lg">→</div>

          {/* Step 4 */}
          <div className="how-it-works-step">
            <div className="step-icon-wrapper">
              <span className="step-circle-badge">4</span>
              <Home className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Move In & Enjoy</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              Settle in and start your new chapter together.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. WHY CHOOSE ROOMMATEHUB? (Exact Replica from Mockup)                   */}
      {/* ========================================================================= */}
      <section className="space-y-6 text-left">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
            Why Choose RoomMateHub?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            More than just a platform — we’re your housing partner.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          
          {/* Left: 6 Features in 2 columns */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            
            {/* 1. Verified Listings */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0">
                <Home className="w-5 h-5 fill-blue-600 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Verified Listings</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  All properties are verified for your safety.
                </p>
              </div>
            </div>

            {/* 2. Trusted Community */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Trusted Community</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Real people, real connections.
                </p>
              </div>
            </div>

            {/* 3. Smart Matching */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-emerald-600 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Smart Matching</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Find roommates who fit your lifestyle.
                </p>
              </div>
            </div>

            {/* 4. 24/7 Support */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">24/7 Support</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  We’re always here to help.
                </p>
              </div>
            </div>

            {/* 5. Secure Payments */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Secure Payments</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Multiple payment options with protection.
                </p>
              </div>
            </div>

            {/* 6. Easy to Use */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Easy to Use</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  Simple, intuitive and mobile friendly.
                </p>
              </div>
            </div>

          </div>

          {/* Right: Bedroom Photo with Handwritten Note */}
          <div className="lg:col-span-6 relative">
            <div className="why-choose-image-wrapper">
              <img
                src="/landing/why_choose_bedroom.jpg"
                alt="Cozy sunlit bedroom with panoramic view"
                className="w-full h-full object-cover"
              />

              {/* Handwritten Note inside Bedroom Photo */}
              <div className="absolute top-4 left-5 handwriting-note -rotate-6 text-blue-600 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl drop-shadow-xs pointer-events-none">
                Your next home<br />
                is just a click away
                <span className="handwriting-heart">♡</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WHAT OUR USERS SAY (Testimonials with Carousel Arrows)                 */}
      {/* ========================================================================= */}
      <section className="space-y-6 text-left relative">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
            What Our Users Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real people. Real stories.
          </p>
        </div>

        {/* Carousel Container with Arrows */}
        <div className="relative">
          {/* Left Arrow Button */}
          <button
            aria-label="Previous testimonial"
            className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm items-center justify-center text-slate-500 hover:text-blue-600 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-[11px] text-slate-400">{t.role}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-1 text-amber-400 pt-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            aria-label="Next testimonial"
            className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm items-center justify-center text-slate-500 hover:text-blue-600 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SIMPLE, TRANSPARENT PRICING                                            */}
      {/* ========================================================================= */}
      <section id="pricing" className="space-y-6 scroll-mt-20 text-left relative">
        
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Choose a plan that fits your needs. Upgrade anytime.
          </p>
        </div>

        {/* Tenant / Landlord Switch */}
        <div className="inline-flex p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setPricingTab('tenant')}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition ${
              pricingTab === 'tenant'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Tenant
          </button>
          <button
            onClick={() => setPricingTab('landlord')}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition ${
              pricingTab === 'landlord'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Landlord
          </button>
        </div>

        {/* 3 Pricing Cards with Right Arrow */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Free */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">Rs. 0</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Everything in Free includes:</p>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" /> Search properties</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" /> Save favorites</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" /> Basic roommate matching</li>
                </ul>
              </div>
              <button
                onClick={() => handleOpenAuth('register')}
                className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Get Started
              </button>
            </div>

            {/* Card 2: Basic (Most Popular) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-blue-600 shadow-md flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                Most Popular
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basic</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">Rs. 299</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Everything in Free, plus:</p>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" /> Apply to properties</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" /> Better roommate matching</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" /> Priority support</li>
                </ul>
              </div>
              <button
                onClick={() => handleOpenAuth('register')}
                className="w-full py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition shadow-sm shadow-blue-600/25"
              >
                Get Started
              </button>
            </div>

            {/* Card 3: Pro */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">Rs. 799</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Everything in Premium, plus:</p>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" /> Advanced matching</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" /> Analytics & insights</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" /> Featured profile</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" /> 24/7 premium support</li>
                </ul>
              </div>
              <button
                onClick={() => handleOpenAuth('register')}
                className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Get Started
              </button>
            </div>

          </div>

          {/* Right pagination chevron button */}
          <button
            aria-label="Next plan"
            className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm items-center justify-center text-slate-500 hover:text-blue-600 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. PRE-FOOTER CTA BANNER (Replica with Mountain/Town Scenery)            */}
      {/* ========================================================================= */}
      <section>
        <div className="cta-banner-replica p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          {/* Left scenery illustration */}
          <div className="hidden md:block w-48 shrink-0 overflow-hidden rounded-xl shadow-xs opacity-90">
            <img
              src="/signup_illustration.jpg"
              alt="Town and mountain scenery"
              className="w-full h-28 object-cover"
            />
          </div>

          {/* Center Text & Button */}
          <div className="space-y-3 max-w-md mx-auto md:mx-0 text-center">
            <h3 className="text-xl sm:text-2xl font-bold font-display text-blue-950 dark:text-white">
              Ready to find your perfect home or roommate?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Join thousands of happy users and start your journey today.
            </p>
            <div className="pt-1">
              <button
                onClick={() => handleOpenAuth('register')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full text-xs sm:text-sm shadow-md shadow-blue-500/25 transition active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Sign Up Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right scenery illustration + handwritten script */}
          <div className="hidden md:flex flex-col items-center relative w-48 shrink-0">
            <div className="handwriting-note text-sm mb-1">
              Better homes<br />
              Better together
              <span className="handwriting-heart text-xs">♡</span>
            </div>
            <div className="w-full overflow-hidden rounded-xl shadow-xs opacity-90">
              <img
                src="/signup_illustration.jpg"
                alt="Town and mountain scenery"
                className="w-full h-24 object-cover object-bottom"
              />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;

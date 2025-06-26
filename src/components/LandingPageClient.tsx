// src/components/LandingPageClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ArrowRight,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

// Navigation Component with Mobile Menu
export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <FileText className="relative h-8 w-8 text-indigo-600" />
            </div>
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              GST Invoice Pro
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              onClick={closeMenu}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              onClick={closeMenu}
            >
              Pricing
            </a>
            <a 
              href="#testimonials" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              onClick={closeMenu}
            >
              Testimonials
            </a>
            <a 
              href="#faq" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              onClick={closeMenu}
            >
              FAQ
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 px-6 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <a
                href="#features"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                onClick={closeMenu}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                onClick={closeMenu}
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                onClick={closeMenu}
              >
                Testimonials
              </a>
              <a
                href="#faq"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                onClick={closeMenu}
              >
                FAQ
              </a>
              <div className="pt-4 border-t border-gray-200">
                <Link
                  href="/login"
                  className="block px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block mt-2 mx-3 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={closeMenu}
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Hero Section Call-to-Action Buttons
export function HeroCTAButtons() {
  const handleDemoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const demoSection = document.querySelector('#demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Link
        href="/register"
        className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
      >
        Start Free Trial
        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Link>
      <a
        href="#demo"
        onClick={handleDemoClick}
        className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
      >
        Watch Demo
      </a>
    </div>
  );
}

// Trust Badge Component
export function TrustBadge() {
  return (
    <div className="inline-flex items-center px-4 py-1.5 border border-indigo-200 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 mb-8">
      <Sparkles className="h-4 w-4 mr-2" />
      Trusted by 10,000+ Indian Businesses
    </div>
  );
}

// Footer CTA Section
export function FooterCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
          Ready to streamline your invoicing?
        </h2>
        <p className="mt-6 text-xl text-indigo-100">
          Join 10,000+ Indian businesses already using GST Invoice Pro
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-indigo-600 bg-white hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-white border-2 border-white hover:bg-white hover:text-indigo-600 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}

// Smooth Scroll Handler for Navigation Links
export function SmoothScrollHandler() {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return { handleSmoothScroll };
}
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: SparklesIcon,
    title: 'AI-Powered Intelligence',
    description: 'Smart document analysis with automatic field detection and ETA 2019 compliance checking.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: ShieldCheckIcon,
    title: 'ETA 2019 Compliant',
    description: 'Fully compliant with Namibia\'s Electronic Transactions Act 2019 and ready for CRAN accreditation.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Mobile-First Design',
    description: 'Optimized for African mobile usage patterns with offline capabilities and touch-friendly interfaces.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: GlobeAltIcon,
    title: 'SADC Ready',
    description: 'Cross-border signature recognition across SADC member states with regional compliance.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: DocumentCheckIcon,
    title: 'Multi-Party Workflows',
    description: 'AI-optimized signing workflows with real-time tracking and smart reminder scheduling.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    icon: ChartBarIcon,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption, PKI infrastructure, and comprehensive audit trails for compliance.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
];

const stats = [
  { label: 'Documents Processed', value: '50K+' },
  { label: 'Success Rate', value: '99.9%' },
  { label: 'Compliance Score', value: '94%' },
  { label: 'Active Users', value: '5K+' },
];

const testimonials = [
  {
    name: 'Sarah Mwandingi',
    role: 'Managing Director, NamBiz Solutions',
    content: 'BuffrSign has transformed how we handle contracts. The AI analysis catches compliance issues before they become problems.',
    avatar: '/api/placeholder/40/40',
  },
  {
    name: 'David Shipanga',
    role: 'Legal Counsel, Windhoek Consulting',
    content: 'Finally, a digital signature platform that understands Namibian law. The ETA 2019 compliance is spot-on.',
    avatar: '/api/placeholder/40/40',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-auto"
                  src="/api/placeholder/120/32"
                  alt="BuffrSign"
                />
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="#features" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Features
                  </a>
                  <a href="#pricing" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Pricing
                  </a>
                  <a href="#compliance" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Compliance
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-namibian opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                AI-Powered Digital Signatures for
                <span className="text-primary-600 block">Namibia & SADC</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                The first ETA 2019 compliant digital signature platform designed specifically for the Namibian and SADC regional market. 
                Secure, intelligent, and 60% more affordable than international alternatives.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Start Free Trial
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/app/documents/upload"
                  className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Try Demo
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for the African Market
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the power of locally-compliant digital signatures with AI-driven intelligence and mobile-first design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bgColor} mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section id="compliance" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Legally Compliant & Court Admissible
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                BuffrSign is the first digital signature platform to achieve full compliance with Namibia's Electronic Transactions Act 2019 
                and prepared for CRAN accreditation launching in February 2026.
              </p>

              <div className="space-y-4">
                {[
                  'ETA 2019 Section 13 Compliance',
                  'CRAN Accreditation Ready',
                  'SADC Cross-Border Recognition',
                  'Court-Admissible Signatures',
                  'Comprehensive Audit Trails',
                  'PKI Certificate Infrastructure',
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-secondary-600 mr-3" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-8">
                <div className="bg-white rounded-lg p-6 shadow-large">
                  <div className="flex items-center mb-4">
                    <ShieldCheckIcon className="h-8 w-8 text-secondary-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Compliance Score</h3>
                  </div>
                  <div className="text-4xl font-bold text-secondary-600 mb-2">94%</div>
                  <p className="text-gray-600 text-sm">
                    Real-time compliance monitoring against ETA 2019 requirements and SADC regional standards.
                  </p>
                  <div className="mt-6 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-secondary-400 to-secondary-600 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Namibian Businesses
            </h2>
            <p className="text-xl text-gray-600">
              See what local businesses are saying about BuffrSign
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-soft"
              >
                <p className="text-gray-700 italic mb-6">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full mr-4"
                    src={testimonial.avatar}
                    alt={testimonial.name}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of Namibian businesses already using BuffrSign for secure, compliant digital signatures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-colors"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img className="h-8 w-auto mb-4" src="/api/placeholder/120/32" alt="BuffrSign" />
              <p className="text-gray-400 text-sm">
                AI-powered digital signatures for Namibia and the SADC region.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#compliance" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/docs" className="hover:text-white">Documentation</a></li>
                <li><a href="/support" className="hover:text-white">Contact Support</a></li>
                <li><a href="/legal" className="hover:text-white">Legal</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/careers" className="hover:text-white">Careers</a></li>
                <li><a href="/press" className="hover:text-white">Press</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 BuffrSign. All rights reserved. Made with ❤️ for Namibia and SADC.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
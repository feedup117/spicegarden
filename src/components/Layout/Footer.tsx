import React from 'react';
import { MapPin, Clock, Phone, Mail, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Restaurant Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Spice Garden</h3>
            <p className="text-gray-300 mb-4">
              Your premier destination in Tanuku for authentic Indian cuisine 
              that brings families, friends, and food lovers together with 
              traditional flavors and modern dining experience.
            </p>
            <div className="flex items-center space-x-2 text-gray-300">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Open Daily: 11:30 AM – 11:30 PM</span>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2 text-gray-300">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span className="text-sm">
                  Sri Chaitanya School, Backside to,<br />
                  IKEA Nagar, Tanuku, Andhra Pradesh 534211
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+91 [Your Phone Number]</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="text-sm">spicegarden.tnk@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Instagram className="h-4 w-4" />
                <span className="text-sm">@spicegarden.tnk</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a href="/" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Home
              </a>
              <a href="/about" className="block text-gray-300 hover:text-white text-sm transition-colors">
                About Us
              </a>
              <a href="/contact" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Contact
              </a>
              <a href="/login" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Staff Login
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Spice Garden. All rights reserved. | Made with ❤️ in Tanuku
          </p>
        </div>
      </div>
    </footer>
  );
}
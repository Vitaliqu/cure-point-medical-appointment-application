import React from 'react';
import Link from 'next/link';
import { PhoneIcon, MailIcon, MapPinIcon } from 'lucide-react';
const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="text-blue-600 font-black text-xl">Cure Point</span>
            </Link>
            <p className="text-gray-600 mb-4">
              Connecting patients with quality healthcare through innovation and compassion.
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/home" className="text-gray-600 hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-600 hover:text-blue-600">
                  Services
                </Link>
              </li>
            </ul>
          </div>
          {/* Services */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">General Medicine</li>
              <li className="text-gray-600">Cardiology</li>
              <li className="text-gray-600">Pediatrics</li>
              <li className="text-gray-600">Dental Care</li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-600">
                <PhoneIcon className="h-5 w-5 text-blue-600" />
                <span>(347) 123-4567</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <MailIcon className="h-5 w-5 text-blue-600" />
                <span>contact@medconnect.com</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <MapPinIcon className="h-5 w-5 text-blue-600" />
                <span>
                  123 Medical Center Dr.
                  <br />
                  Healthcare City, HC 12345
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} CurePoint. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

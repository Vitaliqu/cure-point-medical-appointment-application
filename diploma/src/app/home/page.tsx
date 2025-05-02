'use server';
import { Stethoscope, Calendar, MessagesSquare, HeartPulseIcon, MoreHorizontalIcon } from 'lucide-react';
import Image from 'next/image';
import doctor1 from '../../../public/doctor_1.png';
import doctor2 from '../../../public/doctor_2.png';
import doctor3 from '../../../public/doctor_3.png';
import doctor4 from '../../../public/doctor_4.png';
import homeImage from '../../../public/homeImage.jpg';

import FeatureCard from '@/components/FeatureCard';
import ServiceCard from '@/components/ServiceCard';
import DentalIcon from '@/components/DentalIcon';
import DoctorCard from '@/components/DoctorCard';
import Link from 'next/link';
import Footer from '@/components/Footet';

const Home = () => {
  return (
    <div className="min-h-full w-full bg-white">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row py-8 px-3 gap-6 md:px-16 sm:px-4 bg-gradient-to-b from-blue-100 to-blue-50">
        <div className="flex-1 flex flex-col gap-y-3 lg:gap-y-6 items-start justify-center text-center md:text-start w-full">
          <h2 className="font-black text-4xl md:text-4xl lg:text-6xl w-full">Your Health, Our Priority</h2>
          <p className="text-blue-950 text-lg md:text-xl lg:text-2xl font-medium w-full">
            Connect with top healthcare professionals and book appointment with ease.
          </p>
          <div className="flex gap-x-4 w-full justify-center md:justify-start">
            <button className="bg-blue-600 relative hover:bg-blue-800 transition-colors text-white py-2 px-6 rounded-md font-bold">
              <Link className={'absolute h-full w-full'} href="/doctors"></Link>
              Find a Doctor
            </button>
            <button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors py-2 px-6 rounded-md font-bold">
              <Link className={'absolute h-full w-full'} href="/about"></Link>
              Learn More
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="relative aspect-square w-3/5 md:w-4/5 rounded-lg shadow">
            <Image src={homeImage} fill className="object-cover w-full h-full rounded-lg" alt="Medical professionals" />
          </div>
        </div>
      </section>
      {/* Why Choose Us */}
      <section className="flex flex-col items-center justify-center px-4 md:px-16 bg-white">
        <h3 className="text-2xl md:text-4xl font-black text-center py-8 md:py-12 lg:py-20 w-full">
          Why Choose CurePoint
        </h3>
        <div className="flex flex-col md:flex-row gap-4 md:gap-x-12 w-full max-w-[487px] md:max-w-full mb-8 md:mb-12 lg:mb-20">
          <FeatureCard
            icon={<Stethoscope className="text-blue-500 size-8" />}
            title="Expert Doctors"
            description="Access to certified healthcare professionals across all specialities"
          />
          <FeatureCard
            icon={<Calendar className="text-blue-500 size-8" />}
            title="Easy Schedule"
            description="Book appointment online 24/7 with just a few clicks."
          />
          <FeatureCard
            icon={<MessagesSquare className="text-blue-500 size-8" />}
            title="Virtual Consultation"
            description="Connect with doctors remotely."
          />
        </div>
      </section>
      {/* Services */}
      <section className="flex flex-col items-center px-4 justify-center md:px-16 bg-gradient-to-b from-blue-100 to-blue-50">
        <h3 className="text-2xl md:text-4xl font-black text-center py-8 md:py-12 lg:py-20 w-full">Our Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[487px] md:max-w-full mb-8 md:mb-12">
          <ServiceCard
            icon={<Stethoscope className="text-blue-500 size-8" />}
            title="General Medicine"
            description="Primary healthcare and routine check-ups."
          />
          <ServiceCard icon={<DentalIcon />} title="Dental Care" description="Complete dental treatment and care." />
          <ServiceCard
            icon={<HeartPulseIcon className="text-blue-500 size-8" />}
            title="Cardiology"
            description="Heart health and cardiovascular care."
          />
          <ServiceCard
            icon={<MoreHorizontalIcon className="text-blue-500 size-8" />}
            title="More"
            description="And a lot more."
          />
        </div>
        <Link href="/services" className="mb-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium">
            View All Services
          </button>
        </Link>
      </section>
      {/* Doctors */}
      <section className="flex flex-col items-center justify-center px-4 md:px-16 bg-white">
        <h3 className="text-2xl md:text-4xl font-black text-center py-8 md:py-12 lg:py-20 w-full">
          Meet Our Top Doctors
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[487px] md:max-w-full mb-8 md:mb-12">
          <DoctorCard image={doctor1} name="Dr. John Smith" specialty="Cardiologist" />
          <DoctorCard image={doctor2} name="Dr. Sarah Johnson" specialty="Neurologist" />
          <DoctorCard image={doctor3} name="Dr. Michael Chen" specialty="Pediatrician" />
          <DoctorCard image={doctor4} name="Dr. Emily Brown" specialty="Dentist" />
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;

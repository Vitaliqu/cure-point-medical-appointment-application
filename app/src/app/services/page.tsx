import React from 'react';
import { Stethoscope, HeartPulseIcon, Brain, Baby, Bone, Eye, Ear, Pill } from 'lucide-react';
import ServiceCard from '@/components/ServiceCard';
import DentalIcon from '@/components/DentalIcon';
import Footer from '@/components/Footet';
const ServicesPage = () => {
  return (
    <div className="min-h-full w-full bg-white">
      {/* Hero Section */}
      <section className="py-16 px-4 md:px-16 bg-gradient-to-b from-blue-100 to-blue-50 text-center">
        <h1 className="font-black text-4xl md:text-5xl mb-4">Our Services</h1>
        <p className="text-blue-950 text-lg md:text-xl max-w-3xl mx-auto">
          We offer a comprehensive range of medical services to meet all your healthcare needs.
        </p>
      </section>
      {/* Services List */}
      <section className="py-12 px-4 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ServiceCard
              icon={<Stethoscope className="text-blue-500 size-8" />}
              title="General Medicine"
              description="Comprehensive care for adults including preventive care, diagnosis and management of acute and chronic conditions."
            />
            <ServiceCard
              icon={<DentalIcon />}
              title="Dental Care"
              description="Complete dental services including check-ups, cleanings, fillings, crowns, and cosmetic procedures."
            />
            <ServiceCard
              icon={<HeartPulseIcon className="text-blue-500 size-8" />}
              title="Cardiology"
              description="Specialized care for heart conditions including diagnosis, treatment, and preventive care for heart disease."
            />
            <ServiceCard
              icon={<Brain className="text-blue-500 size-8" />}
              title="Neurology"
              description="Diagnosis and treatment of disorders of the nervous system including the brain, spinal cord, and peripheral nerves."
            />
            <ServiceCard
              icon={<Baby className="text-blue-500 size-8" />}
              title="Pediatrics"
              description="Specialized healthcare for children from birth through adolescence, focusing on development and disease prevention."
            />
            <ServiceCard
              icon={<Bone className="text-blue-500 size-8" />}
              title="Orthopedics"
              description="Treatment of conditions involving the musculoskeletal system, including joints, bones, muscles, ligaments, and tendons."
            />
            <ServiceCard
              icon={<Eye className="text-blue-500 size-8" />}
              title="Ophthalmology"
              description="Comprehensive eye care including routine exams, treatment of eye diseases, and surgical procedures."
            />
            <ServiceCard
              icon={<Ear className="text-blue-500 size-8" />}
              title="ENT"
              description="Diagnosis and treatment of conditions affecting the ears, nose, throat, and related structures of the head and neck."
            />
            <ServiceCard
              icon={<Pill className="text-blue-500 size-8" />}
              title="Pharmacy"
              description="Convenient access to prescribed medications with expert guidance from our licensed pharmacists."
            />
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-12 px-4 md:px-16 bg-blue-50 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Schedule an Appointment?</h2>
          <p className="text-lg mb-8">
            Our team of healthcare professionals is ready to provide you with the care you need.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium text-lg">
            Book Now
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default ServicesPage;

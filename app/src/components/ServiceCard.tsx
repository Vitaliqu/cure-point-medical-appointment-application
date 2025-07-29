import React, { ReactNode } from 'react';
interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}
const ServiceCard = ({ icon, title, description }: ServiceCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-start gap-4 hover:shadow-lg transition-shadow">
      <div className="bg-blue-50 p-3 rounded-lg">{icon}</div>
      <div>
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};
export default ServiceCard;

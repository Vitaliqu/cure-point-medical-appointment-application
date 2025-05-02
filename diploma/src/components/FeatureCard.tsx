import React, { ReactNode } from 'react';
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}
const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md flex-1">
      <div className="mb-4">{icon}</div>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
export default FeatureCard;

import { ReactNode } from 'react';

const ServiceCard = ({ icon, title, description }: { icon: ReactNode; title: string; description: string }) => (
  <div className="flex flex-col gap-y-2 p-6 bg-white rounded-md shadow flex-1">
    {icon}
    <strong className="text-xl">{title}</strong>
    <p>{description}</p>
  </div>
);
export default ServiceCard;

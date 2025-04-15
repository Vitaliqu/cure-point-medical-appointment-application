import Image, { StaticImageData } from 'next/image';

const DoctorCard = ({ image, name, specialty }: { image: StaticImageData; name: string; specialty: string }) => (
  <div className="flex flex-col bg-white rounded-md shadow overflow-hidden flex-1">
    <div className="relative w-full min-h-48">
      <Image src={image} fill className="object-cover" alt={name} />
    </div>
    <div className="p-6">
      <strong className="text-xl">{name}</strong>
      <p className="text-blue-500">{specialty}</p>
    </div>
  </div>
);
export default DoctorCard;

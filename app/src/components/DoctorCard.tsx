import Image, { StaticImageData } from 'next/image';
interface DoctorCardProps {
  image: StaticImageData;
  name: string;
  specialty: string;
}
const DoctorCard = ({ image, name, specialty }: DoctorCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex-1 min-w-[200px]">
      <Image src={image} width={192} height={192} alt={name} className="w-full object-cover" />
      <div className="p-4">
        <h4 className="font-bold text-lg">{name}</h4>
        <p className="text-blue-600">{specialty}</p>
      </div>
    </div>
  );
};
export default DoctorCard;

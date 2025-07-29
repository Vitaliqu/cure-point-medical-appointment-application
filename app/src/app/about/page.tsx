import Image from 'next/image';
import oficer1 from '../../../public/oficer_1.jpg';
import oficer2 from '../../../public/oficer_2.jpg';
import oficer3 from '../../../public/oficer_3.jpg';
import about from '../../../public/About.jpg';
import Footer from '@/components/Footet';
const AboutPage = () => {
  return (
    <div className="min-h-full w-full bg-white">
      {/* Hero Section */}
      <section className="py-16 px-4 md:px-16 bg-gradient-to-b from-blue-100 to-blue-50 text-center">
        <h1 className="font-black text-4xl md:text-5xl mb-4">About Cure Point</h1>
        <p className="text-blue-950 text-lg md:text-xl max-w-3xl mx-auto">
          Connecting patients with quality healthcare through innovation and compassion.
        </p>
      </section>
      {/* Our Mission */}
      <section className="py-12 px-4 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:flex-row gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4">
                At Cure Point, our mission is to make quality healthcare accessible to everyone. We believe in a
                patient-centered approach where technology enhances the human connection between healthcare providers
                and patients.
              </p>
              <p className="text-gray-700">
                We strive to simplify the healthcare journey by providing a seamless platform for booking appointments,
                consulting with doctors, and managing your health records.
              </p>
            </div>
            <div className="md:flex-1 h-[32rem] w-3/4 max-w-[24rem] relative rounded-lg overflow-hidden shadow-md">
              <Image src={about} alt="Healthcare professionals in a meeting" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>
      {/* Our Values */}
      <section className="py-12 px-4 md:px-16 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3 text-blue-600">Excellence</h3>
              <p className="text-gray-700">
                We are committed to excellence in every aspect of our service, from the quality of our platform to the
                healthcare professionals we partner with.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3 text-blue-600">Compassion</h3>
              <p className="text-gray-700">
                We understand that healthcare is deeply personal. Our approach is rooted in empathy and respect for each
                individual&apos;s unique needs.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3 text-blue-600">Innovation</h3>
              <p className="text-gray-700">
                We continuously strive to improve and innovate, leveraging technology to enhance the healthcare
                experience for both patients and providers.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Our Team */}
      <section className="py-12 px-4 md:px-16">
        <div className="max-w-7xl mb-16 mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center flex flex-col items-center ">
              <div className={' relative size-48'}>
                <Image fill src={oficer1} alt="CEO" className=" object-cover rounded-full mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-bold">Dr. Robert Williams</h3>
              <p className="text-blue-600">Chief Executive Officer</p>
            </div>
            <div className="text-center flex flex-col items-center ">
              <div className={' relative size-48'}>
                <Image fill src={oficer2} alt="CEO" className=" object-cover rounded-full mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-bold">Dr. Amanda Chen</h3>
              <p className="text-blue-600">Chief Medical Officer</p>
            </div>
            <div className="text-center flex flex-col items-center ">
              <div className={' relative size-48'}>
                <Image fill src={oficer3} alt="CEO" className=" object-cover rounded-full mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-bold">Michael Johnson</h3>
              <p className="text-blue-600">Chief Technology Officer</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default AboutPage;

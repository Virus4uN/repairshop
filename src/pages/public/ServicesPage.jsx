import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Monitor, Tablet, Printer, Cpu, ArrowRight, Clock, IndianRupee } from 'lucide-react';

const services = [
  {
    icon: Smartphone, name: 'Mobile Repair', img: '/images/mobile-repair.jpg',
    desc: 'Expert repair for all mobile brands including screen replacement, battery replacement, charging port repair, software issues, water damage recovery, and camera repairs.',
    time: '1-3 Hours', price: '₹499',
    items: ['Screen Replacement', 'Battery Replacement', 'Charging Port', 'Software Issues', 'Water Damage', 'Camera Repair'],
  },
  {
    icon: Laptop, name: 'Laptop Repair', img: '/images/laptop-repair.jpg',
    desc: 'Complete laptop repair services including screen replacement, keyboard repair, motherboard repair, RAM/SSD upgrades, hinge repair, and virus removal.',
    time: '2-24 Hours', price: '₹799',
    items: ['Screen Replacement', 'Keyboard Repair', 'Motherboard Fix', 'RAM/SSD Upgrade', 'Hinge Repair', 'Virus Removal'],
  },
  {
    icon: Monitor, name: 'Computer Repair', img: '/images/computer-repair.jpg',
    desc: 'Desktop computer repair and upgrades including hardware troubleshooting, component replacement, OS installation, network setup, and data recovery.',
    time: '2-24 Hours', price: '₹599',
    items: ['Hardware Repair', 'Component Upgrade', 'OS Installation', 'Network Setup', 'Data Recovery', 'Performance Tuning'],
  },
  {
    icon: Tablet, name: 'Tablet Repair', img: '/images/tablet-repair.jpg',
    desc: 'Professional tablet repair for iPad, Samsung Tab, and other brands. Screen replacement, battery replacement, charging issues, and software updates.',
    time: '1-4 Hours', price: '₹699',
    items: ['Screen Replacement', 'Battery Replacement', 'Charging Port', 'Button Repair', 'Software Update', 'Speaker Repair'],
  },
  {
    icon: Printer, name: 'Printer Repair', img: '/images/printer-repair.jpg',
    desc: 'Printer and scanner repair services including paper jam fixes, ink system repair, connectivity issues, print head cleaning, and hardware replacement.',
    time: '2-6 Hours', price: '₹499',
    items: ['Paper Jam Fix', 'Ink System Repair', 'Connectivity Issues', 'Print Head Cleaning', 'Roller Replacement', 'Drum Replacement'],
  },
  {
    icon: Cpu, name: 'Electronics Repair', img: '/images/electronics-repair.jpg',
    desc: 'Repair for other electronic devices including gaming consoles, smartwatches, routers, speakers, power banks, and home electronics.',
    time: '2-48 Hours', price: '₹399',
    items: ['Gaming Consoles', 'Smartwatches', 'Routers & Modems', 'Bluetooth Speakers', 'Power Banks', 'Home Electronics'],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-indigo-400 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Our Repair Services</h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">Professional repair solutions for all your electronic devices with warranty and transparent pricing</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {services.map((service, idx) => (
              <div key={service.name} className={`flex flex-col lg:flex-row gap-8 items-center ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Image */}
                <div className="w-full lg:w-1/2">
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img src={service.img} alt={service.name} className="w-full h-72 sm:h-80 object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{service.name}</h2>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">{service.desc}</p>

                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">{service.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <IndianRupee className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">Starting from {service.price}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {service.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/book-repair"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Book This Service <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

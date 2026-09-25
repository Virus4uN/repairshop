import { Users, Award, Clock, Wrench, Target, Heart } from 'lucide-react';

const stats = [
  { val: '10,000+', label: 'Devices Repaired' },
  { val: '15+', label: 'Expert Technicians' },
  { val: '98%', label: 'Customer Satisfaction' },
  { val: '5+', label: 'Years Experience' },
];

const values = [
  { icon: Target, title: 'Quality First', desc: 'We never compromise on repair quality, using only genuine parts and proven techniques.' },
  { icon: Clock, title: 'Fast Turnaround', desc: 'Most repairs completed within 24 hours with real-time status tracking.' },
  { icon: Heart, title: 'Customer Care', desc: 'Your satisfaction is our top priority. We treat every device like our own.' },
  { icon: Award, title: 'Certified Team', desc: 'Our technicians are certified professionals with years of hands-on experience.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full bg-blue-400 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">About Smart Hub Repair</h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">Your trusted partner for professional electronic device repair services since 2021</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-6">We Fix What Others Can't</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Smart Hub Repair was founded with a simple mission: to provide reliable, transparent, and affordable repair services for electronic devices. What started as a small workshop has grown into a full-service repair center trusted by thousands of customers.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our team of certified technicians specializes in repairing smartphones, laptops, computers, tablets, printers, and other electronic devices. We use genuine parts and the latest diagnostic tools to ensure every repair meets the highest standards.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We believe in complete transparency — from upfront pricing to real-time repair tracking. Every customer receives a unique Repair ID to monitor their device's repair journey from start to finish.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src="/images/about-workshop.jpg" alt="Our Workshop" className="w-full h-80 lg:h-96 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white">{stat.val}</p>
                <p className="text-blue-200 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Our Team</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Meet Our Expert Technicians</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">A dedicated team of certified professionals committed to excellence</p>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-xl max-w-4xl mx-auto">
            <img src="/images/about-team.jpg" alt="Our Team" className="w-full h-64 sm:h-80 lg:h-96 object-cover" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">What We Stand For</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

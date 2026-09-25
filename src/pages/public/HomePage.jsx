import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Award, Zap, CheckCircle2, Star, Smartphone, Laptop, Monitor, Tablet, Printer, Cpu, MapPin, Phone, Mail } from 'lucide-react';

const services = [
  { icon: Smartphone, name: 'Mobile Repair', desc: 'Screen replacement, battery, software fixes', img: '/images/mobile-repair.jpg' },
  { icon: Laptop, name: 'Laptop Repair', desc: 'Hardware upgrades, screen, keyboard repair', img: '/images/laptop-repair.jpg' },
  { icon: Monitor, name: 'Computer Repair', desc: 'Desktop troubleshooting & component repair', img: '/images/computer-repair.jpg' },
  { icon: Tablet, name: 'Tablet Repair', desc: 'Screen, battery & charging port fixes', img: '/images/tablet-repair.jpg' },
  { icon: Printer, name: 'Printer Repair', desc: 'Ink system, paper jam & hardware repair', img: '/images/printer-repair.jpg' },
  { icon: Cpu, name: 'Electronics Repair', desc: 'Gaming consoles, smartwatches & more', img: '/images/electronics-repair.jpg' },
];

const steps = [
  { num: '01', title: 'Book Repair', desc: 'Submit your repair request online with device details' },
  { num: '02', title: 'Device Inspection', desc: 'We receive and inspect your device thoroughly' },
  { num: '03', title: 'Diagnosis', desc: 'Our technicians diagnose the exact issue' },
  { num: '04', title: 'Repair', desc: 'Expert repair with genuine spare parts' },
  { num: '05', title: 'Quality Check', desc: 'Rigorous testing to ensure perfect working' },
  { num: '06', title: 'Pickup / Delivery', desc: 'Collect your device or get it delivered' },
];

const whyUs = [
  { icon: Shield, title: 'Warranty Protected', desc: 'All repairs come with service warranty for your peace of mind' },
  { icon: Clock, title: 'Quick Turnaround', desc: 'Most repairs completed within 24-48 hours' },
  { icon: Award, title: 'Certified Technicians', desc: 'Skilled and experienced repair professionals' },
  { icon: Zap, title: 'Transparent Pricing', desc: 'No hidden charges, upfront cost estimates' },
];

const reviews = [
  { name: 'Rahul Sharma', rating: 5, text: 'Excellent service! My laptop screen was replaced in just 3 hours. Very professional team.', device: 'Laptop Repair' },
  { name: 'Priya Patel', rating: 5, text: 'Best mobile repair service in the city. They fixed my phone battery and it works like new!', device: 'Mobile Repair' },
  { name: 'Amit Kumar', rating: 4, text: 'Good experience overall. The tracking system is very helpful to check repair progress.', device: 'Computer Repair' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero-repair.jpg" alt="Smart Hub Repair Workshop" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur rounded-full mb-6">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">Trusted by 10,000+ Customers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Reliable Repair Services for{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Your Devices
              </span>
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-lg">
              Fast • Professional • Transparent — Expert repairs for mobiles, laptops, computers, tablets and more with real-time tracking.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/book-repair"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
              >
                Book a Repair
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/track"
                className="px-8 py-4 bg-white/10 backdrop-blur text-white rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                Track Repair
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-12">
              {[
                { val: '10K+', label: 'Repairs Done' },
                { val: '4.9', label: 'Rating' },
                { val: '24hr', label: 'Turnaround' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.val}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Our Services</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">Expert Repair Solutions</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Professional repair services for all your electronic devices with warranty support</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.name} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="h-48 overflow-hidden">
                  <img src={service.img} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3 -mt-12 relative z-10 shadow-lg bg-white">
                    <service.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{service.desc}</p>
                  <Link
                    to="/book-repair"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 group/btn"
                  >
                    Book Service <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">Simple Repair Process</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Get your device repaired in 6 easy steps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative group">
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                  <span className="text-5xl font-black text-blue-100 group-hover:text-blue-200 transition-colors">{step.num}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
                {i < steps.length - 1 && i % 3 !== 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-blue-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-cyan-300 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-200 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2">What Makes Us Different</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-blue-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.name} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                    <p className="text-xs text-gray-500">{review.device}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Get in Touch</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">Contact Us</h2>
              <p className="text-gray-500 mb-8">Have questions? We're here to help. Visit our shop or reach us via phone or email.</p>

              <div className="space-y-4">
                {[
                  { icon: MapPin, text: '123 Repair Street, Tech City, India - 380001' },
                  { icon: Phone, text: '+91 98765 43210' },
                  { icon: Mail, text: 'support@smarthubrepair.com' },
                  { icon: Clock, text: 'Mon - Sat: 9 AM - 8 PM | Sun: 10 AM - 4 PM' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-gray-600 pt-2">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="font-bold text-xl text-gray-900 mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                  <input type="email" placeholder="Your Email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                </div>
                <input type="text" placeholder="Subject" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                <textarea rows="4" placeholder="Your Message" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none" />
                <button type="submit" className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Your Device Fixed?</h2>
          <p className="text-gray-400 mb-8">Book a repair today and experience hassle-free, professional service.</p>
          <Link
            to="/book-repair"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            Book a Repair Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

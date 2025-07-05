import { motion } from 'framer-motion';
import { Leaf, Clock, MapPin, Star, ChefHat, Users, Phone, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const features = [
    {
      icon: <Leaf className="h-8 w-8" />,
      title: "Fresh & Authentic",
      description: "Traditional Indian spices and fresh ingredients in every dish"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Quick Service", 
      description: "Fast preparation times without compromising on quality"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Family Friendly",
      description: "Perfect atmosphere for families, friends, and food lovers"
    },
    {
      icon: <ChefHat className="h-8 w-8" />,
      title: "Expert Chefs",
      description: "Experienced chefs bringing traditional flavors to every dish"
    }
  ];

  const testimonials = [
    {
      name: "Raj Kumar",
      text: "Amazing food quality and quick service! The biryani here is absolutely delicious.",
      rating: 5
    },
    {
      name: "Priya Sharma", 
      text: "Love the cozy atmosphere and student-friendly pricing. Highly recommended!",
      rating: 5
    },
    {
      name: "Venkat Reddy",
      text: "Best restaurant in Tanuku! The paneer butter masala is my favorite.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Back to Dashboard Button */}
      {profile?.role === 'manager' && (
        <div className="bg-gray-100 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-8xl mb-6"
            >
              🌿
            </motion.div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Spice Garden
            </h1>
            <p className="text-xl md:text-2xl mb-4 opacity-90">
              Authentic Indian Flavors, Modern Dining Experience
            </p>
            <p className="text-lg mb-8 opacity-80 max-w-2xl mx-auto">
              Your premier destination in Tanuku for traditional Indian cuisine with a contemporary twist
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/customer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Order Now 🚀
                </motion.button>
              </Link>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-2 text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <Clock className="h-4 w-4" />
                <span>Open: 11:30 AM – 11:30 PM</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Floating Food Icons */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 text-4xl opacity-30"
        >
          🍛
        </motion.div>
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 right-16 text-5xl opacity-20"
        >
          🥘
        </motion.div>
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-20 text-3xl opacity-25"
        >
          🍜
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Spice Garden?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to bringing you the best dining experience in Tanuku with authentic flavors, quality ingredients, and exceptional service.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact Section */}
      <section className="py-16 bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Visit Us Today!</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Our Location</p>
                    <p className="text-gray-600">
                      Sri Chaitanya School, Backside to,<br />
                      IKEA Nagar, Tanuku, Andhra Pradesh 534211
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Opening Hours</p>
                    <p className="text-gray-600">Daily: 11:30 AM – 11:30 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Contact Us</p>
                    <p className="text-gray-600">spicegarden.tnk@gmail.com</p>
                  </div>
                </div>
              </div>
              
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Get Directions
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Ready to Order?</h3>
              <div className="text-center space-y-4">
                <div className="text-6xl">📱</div>
                <p className="text-gray-600 mb-6">
                  Select your table and start browsing our delicious menu right away!
                </p>
                <Link to="/customer">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Ordering 🍽️
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Don't just take our word for it!</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-lg"
              >
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">- {testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
import { motion } from 'framer-motion';
import { Heart, Users, Award, Clock, ChefHat, MapPin } from 'lucide-react';

export function AboutPage() {
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Quality First",
      description: "We never compromise on the quality of our ingredients and preparation"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Focus",
      description: "Serving the Tanuku community with dishes that bring people together"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Excellence",
      description: "Striving for excellence in every dish, every service, every experience"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Reliability",
      description: "Consistent quality and service you can count on, every single time"
    }
  ];

  const stats = [
    { number: "500+", label: "Happy Customers Monthly" },
    { number: "25+", label: "Delicious Menu Items" },
    { number: "2+", label: "Years of Excellence" },
    { number: "15min", label: "Average Prep Time" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 text-white py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-6"
            >
              🏠
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Story</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Where passion for authentic Indian cuisine meets the heart of Tanuku community
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Welcome to Spice Garden</h2>
              <div className="prose prose-lg text-gray-700 space-y-4">
                <p>
                  Welcome to <span className="font-semibold text-green-600">Spice Garden</span>, your premier destination in Tanuku for authentic Indian cuisine that brings families, friends, and food lovers together through the magic of traditional flavors.
                </p>
                <p>
                  We serve a carefully curated selection of North and South Indian dishes, each prepared with the finest spices and fresh ingredients. Our mission is simple: to create an unforgettable dining experience that honors traditional recipes while embracing modern culinary techniques.
                </p>
                <p>
                  Located in the heart of IKEA Nagar, near Sri Chaitanya School, we've become a beloved gathering place for the local community. Whether you're a student looking for a satisfying meal, a family celebrating a special occasion, or friends sharing stories over delicious food, Spice Garden is your perfect destination.
                </p>
                <p>
                  Come visit us and discover why we're quickly becoming Tanuku's favorite dining spot for authentic Indian cuisine!
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-2xl p-8 text-white">
                <div className="text-center">
                  <ChefHat className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Our Kitchen Philosophy</h3>
                  <p className="text-lg opacity-90">
                    "Every dish is prepared with love, authentic spices, and traditional recipes passed down through generations, creating flavors that tell a story."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at Spice Garden
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Spice Garden by the Numbers</h2>
            <p className="text-xl opacity-90">
              Our commitment to excellence in every number
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Find Us in Tanuku</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Our Address</p>
                    <p className="text-gray-600">
                      Sri Chaitanya School, Backside to,<br />
                      IKEA Nagar, Tanuku, Andhra Pradesh 534211
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Opening Hours</p>
                    <p className="text-gray-600">Open Daily: 11:30 AM – 11:30 PM</p>
                  </div>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mt-8 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl"
              >
                <p className="text-gray-700 italic">
                  "Conveniently located in the heart of Tanuku's educational district, 
                  making us the perfect spot for students, families, and professionals!"
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-2xl p-8 text-white text-center"
            >
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-2xl font-bold mb-4">Easy to Find</h3>
              <p className="text-lg opacity-90 mb-6">
                Located behind Sri Chaitanya School in IKEA Nagar, we're easily accessible 
                and have become a landmark in our community.
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm opacity-90">
                  Look for our bright signage and the delicious aromas wafting from our kitchen!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
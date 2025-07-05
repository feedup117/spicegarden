import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  prep_time: number;
  category: string;
  image_url?: string;
  is_available: boolean;
}

const categories = [
  { id: 'all', name: 'All Items' },
  { id: 'starter', name: 'Starters' },
  { id: 'main', name: 'Main Course' },
  { id: 'dessert', name: 'Desserts' },
];

export function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { cart, addToCart, updateQuantity } = useStore();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const getQuantity = (itemId: string) => {
    return cart.find(item => item.id === itemId)?.quantity || 0;
  };

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      prep_time: item.prep_time,
    });
    toast.success(`${item.title} added to cart!`);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Menu</h2>
        <p className="text-gray-600">Discover our delicious selection of freshly prepared dishes</p>
      </motion.div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Image */}
            <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <span className="text-white text-6xl opacity-20">🍽️</span>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {item.prep_time} min
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-orange-600">₹{item.price}</span>
                
                {getQuantity(item.id) > 0 ? (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, getQuantity(item.id) - 1)}
                      className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-200 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-lg">{getQuantity(item.id)}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, getQuantity(item.id) + 1)}
                      className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-200 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No items found in this category.</p>
        </div>
      )}
    </div>
  );
}
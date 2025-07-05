import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface CartProps {
  onPlaceOrder: () => void;
}

export function Cart({ onPlaceOrder }: CartProps) {
  const { cart, updateQuantity, removeFromCart } = useStore();

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const maxPrepTime = cart.reduce((max, item) => Math.max(max, item.prep_time), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-500">Add some delicious items to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-orange-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Your Order</h2>
            </div>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
              {totalItems} items
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="p-6">
          <div className="space-y-4">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-orange-600 font-semibold">₹{item.price}</span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{item.prep_time} min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-lg w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-200 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated prep time:</span>
                <span className="font-medium">{maxPrepTime} minutes</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-orange-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPlaceOrder}
              className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Place Order
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
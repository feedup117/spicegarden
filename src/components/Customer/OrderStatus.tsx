import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Droplets, Receipt, ShoppingCart } from 'lucide-react';
import { supabase, WATER_BOTTLE_PRICE } from '../../lib/supabase';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

interface OrderItem {
  title: string;
  price: number;
  quantity: number;
  prep_time: number;
}

interface Order {
  id: string;
  table_id: number;
  device_id: string;
  items: { [key: string]: OrderItem };
  total_amount: number;
  max_prep_time: number;
  status: 'pending' | 'preparing' | 'served';
  created_at: string;
  updated_at: string;
}

interface OrderStatusProps {
  order: Order;
  onOrderMore: () => void;
}

interface WaterRequest {
  id: string;
  is_served: boolean;
  created_at: string;
}

export function OrderStatus({ order, onOrderMore }: OrderStatusProps) {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [waterRequests, setWaterRequests] = useState<WaterRequest[]>([]);
  const [showRequests, setShowRequests] = useState(false);
  const { selectedTable } = useStore();

  useEffect(() => {
    // Update current order when prop changes
    setCurrentOrder(order);
  }, [order]);

  useEffect(() => {
    if (!selectedTable || !currentOrder?.id) return;

    // Subscribe to order updates
    const orderSubscription = supabase
      .channel(`order-${currentOrder.id}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${currentOrder.id}`,
        },
        (payload: { new: Order }) => {
          // Merge items and update totals
          setCurrentOrder(prev => {
            const mergedItems = { ...prev.items };
            
            // Merge new items with existing ones
            Object.entries(payload.new.items).forEach(([id, item]) => {
              if (mergedItems[id]) {
                mergedItems[id] = {
                  ...item,
                  quantity: mergedItems[id].quantity + item.quantity
                };
              } else {
                mergedItems[id] = item;
              }
            });

            return {
              ...payload.new,
              items: mergedItems,
            };
          });
        }
      )
      .subscribe();

    // Fetch existing water requests
    const fetchWaterRequests = async () => {
      const { data, error } = await supabase
        .from('customer_requests')
        .select('*')
        .eq('table_id', selectedTable)
        .eq('request_type', 'water')
        .eq('is_served', false);

      if (!error && data) {
        setWaterRequests(data);
      }
    };

    // Subscribe to water request updates
    const waterRequestSubscription = supabase
      .channel(`water-${selectedTable}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_requests',
          filter: `table_id=eq.${selectedTable} AND request_type=eq.water`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setWaterRequests(prev => [...prev, payload.new as WaterRequest]);
          } else if (payload.eventType === 'UPDATE') {
            setWaterRequests(prev =>
              prev.map(req => req.id === payload.new.id ? payload.new as WaterRequest : req)
            );
          }
        }
      )
      .subscribe();

    fetchWaterRequests();

    return () => {
      orderSubscription.unsubscribe();
      waterRequestSubscription.unsubscribe();
    };
  }, [selectedTable, currentOrder?.id]);

  // Calculate totals
  const waterBottleCost = waterRequests.filter(r => !r.is_served).length * WATER_BOTTLE_PRICE;
  const foodTotal = currentOrder?.total_amount || 0;
  const totalAmount = foodTotal + waterBottleCost;

  const handleRequest = async (type: 'water' | 'bill' | 'order_more') => {
    if (!selectedTable) return;

    if (type === 'order_more') {
      onOrderMore();
      return;
    }

    try {
      const { error } = await supabase
        .from('customer_requests')
        .insert({
          table_id: selectedTable,
          request_type: type,
        });

      if (error) throw error;

      toast.success(`${type === 'water' ? 'Water bottle' : 'Bill'} request sent!`);
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Failed to send request');
    }
  };

  const getStatusIcon = () => {
    switch (currentOrder?.status) {
      case 'pending':
        return <Clock className="h-8 w-8 text-yellow-600" />;
      case 'preparing':
        return <Clock className="h-8 w-8 text-orange-600" />;
      case 'served':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      default:
        return <Clock className="h-8 w-8 text-gray-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (currentOrder?.status) {
      case 'pending':
        return 'Your order has been received';
      case 'preparing':
        return 'Your food is being prepared';
      case 'served':
        return 'Your order is ready!';
      default:
        return 'Processing your order...';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* Train Animation */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 text-center">
          <motion.div
            animate={{ x: [-20, 20, -20] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl mb-4"
          >
            🚂
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Your food is being prepared!</h2>
          <p className="text-lg opacity-90">
            Please wait approximately {currentOrder?.max_prep_time || 15} minutes
          </p>
        </div>

        {/* Order Status */}
        <div className="p-6">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {getStatusIcon()}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">{getStatusMessage()}</h3>
              <p className="text-gray-600 capitalize">Status: {currentOrder?.status || 'pending'}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
            <div className="space-y-2">
              {currentOrder?.items && Object.entries(currentOrder.items).map(([itemId, item]: [string, any]) => (
                <div key={itemId} className="flex justify-between text-sm">
                  <span>{item.title} x {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              {/* Water Bottles Section */}
              {waterRequests.filter(r => !r.is_served).length > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Water Bottles x {waterRequests.filter(r => !r.is_served).length}</span>
                  <span>₹{waterBottleCost.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Request Buttons */}
          <div className="text-center">
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Need Something?
            </button>

            {showRequests && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-3"
              >
                <button
                  onClick={() => handleRequest('water')}
                  className="w-full bg-cyan-500 text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-cyan-600 transition-colors"
                >
                  <Droplets className="h-5 w-5" />
                  <span>Order Water Bottle</span>
                </button>
                
                <button
                  onClick={() => handleRequest('bill')}
                  className="w-full bg-green-500 text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors"
                >
                  <Receipt className="h-5 w-5" />
                  <span>Ask for the Bill</span>
                </button>

                <button
                  onClick={() => handleRequest('order_more')}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-orange-600 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Order More Food</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSelection } from '../components/Customer/TableSelection';
import { Menu } from '../components/Customer/Menu';
import { Cart } from '../components/Customer/Cart';
import { OrderStatus } from '../components/Customer/OrderStatus';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../utils/deviceUtils';
import toast from 'react-hot-toast';
import { NotificationSound, orderStatusMessages } from '../utils/notifications';

type CustomerStep = 'table-selection' | 'menu' | 'cart' | 'order-status';

export function CustomerExperience() {
  const [currentStep, setCurrentStep] = useState<CustomerStep>('table-selection');
  const { selectedTable, cart, currentOrder, setCurrentOrder, clearCart } = useStore();

  useEffect(() => {
    // Check if user already has a table selected
    if (selectedTable) {
      setCurrentStep('menu');
    }

    // Check if user has an active order
    checkActiveOrder();
  }, [selectedTable]);

  const checkActiveOrder = async () => {
    const deviceId = getDeviceId();
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('device_id', deviceId)
        .in('status', ['pending', 'preparing'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setCurrentOrder(data[0]);
        setCurrentStep('order-status');
      }
    } catch (error) {
      console.error('Error checking active order:', error);
    }
  };

  const handleTableSelected = (_tableId: number) => {
    setCurrentStep('menu');
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    if (!selectedTable) {
      toast.error('Please select a table first');
      return;
    }

    const deviceId = getDeviceId();
    const cartItems = cart.reduce((acc, item) => {
      acc[item.id] = {
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        prep_time: item.prep_time
      };
      return acc;
    }, {} as any);

    try {
      if (currentOrder) {
        // Update existing order
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('items, total_amount, max_prep_time')
          .eq('id', currentOrder.id)
          .single();

        if (existingOrder) {
          const mergedItems = { ...existingOrder.items };
          let totalAmount = existingOrder.total_amount;
          let maxPrepTime = existingOrder.max_prep_time;

          // Merge new items with existing ones
          Object.entries(cartItems).forEach(([id, item]: [string, any]) => {
            if (mergedItems[id]) {
              mergedItems[id].quantity += item.quantity;
            } else {
              mergedItems[id] = item;
            }
            totalAmount += item.price * item.quantity;
            maxPrepTime = Math.max(maxPrepTime, item.prep_time);
          });

          const { data, error } = await supabase
            .from('orders')
            .update({
              items: mergedItems,
              total_amount: totalAmount,
              max_prep_time: maxPrepTime,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentOrder.id)
            .select()
            .single();

          if (error) throw error;
          setCurrentOrder(data);
        }
      } else {
        // Create new order
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const maxPrepTime = cart.reduce((max, item) => Math.max(max, item.prep_time), 0);

        const { data, error } = await supabase
          .from('orders')
          .insert({
            table_id: selectedTable,
            device_id: deviceId,
            items: cartItems,
            total_amount: totalAmount,
            max_prep_time: maxPrepTime,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;
        setCurrentOrder(data);
      }

      clearCart();
      setCurrentStep('order-status');
      toast.success(currentOrder ? 'Order updated successfully!' : 'Order placed successfully!');
      
    } catch (error) {
      console.error('Error placing/updating order:', error);
      toast.error('Failed to process order. Please try again.');
    }
  };

  const handleOrderMore = () => {
    setCurrentStep('menu');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'table-selection':
        return <TableSelection onTableSelected={handleTableSelected} />;
      case 'menu':
        return (
          <div>
            <Menu />
            {cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-4 right-4 z-50"
              >
                <button
                  onClick={() => setCurrentStep('cart')}
                  className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
                >
                  <span>View Cart ({cart.length})</span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                    ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                  </span>
                </button>
              </motion.div>
            )}
          </div>
        );
      case 'cart':
        return (
          <div>
            <Cart onPlaceOrder={handlePlaceOrder} />
            <div className="max-w-2xl mx-auto px-4 mt-4">
              <button
                onClick={() => setCurrentStep('menu')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        );
      case 'order-status':
        return currentOrder ? (
          <OrderStatus 
            order={currentOrder} 
            onOrderMore={handleOrderMore}
          />
        ) : null;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!selectedTable) return;

    // Initialize notification sound
    NotificationSound.init();

    // Subscribe to order status changes
    const channel = supabase
      .channel(`order-status-${selectedTable}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `table_number=eq.${selectedTable}`,
        },
        (payload) => {
          const oldStatus = payload.old.status;
          const newStatus = payload.new.status === 'served' ? 'order is ready' : payload.new.status as string;
          
          if (newStatus !== oldStatus) {
            // Play appropriate notification sound based on status
            if (newStatus === 'preparing') {
              NotificationSound.play('preparing');
            } else if (newStatus === 'order is ready') {
              NotificationSound.play('ready');
            } else {
              NotificationSound.play('notify');
            }
            
            // Show toast notification
            const message = orderStatusMessages[newStatus as keyof typeof orderStatusMessages] || `Order status: ${newStatus}`;
            toast(message, {
              icon: newStatus === 'order is ready' ? '🍽️' : '🔔',
              duration: 5000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '10px',
              },
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      channel.unsubscribe();
    };
  }, [selectedTable]);

  // Move useRef to the top-level of the component
  const prevStatusRef = useRef<string | undefined>(undefined);

  // Only initialize NotificationSound once per mount
  useEffect(() => {
    NotificationSound.init();
  }, []);

  // Listen for order status changes and play notification sounds
  useEffect(() => {
    if (!currentOrder?.id) return;

    // Set the initial previous status
    prevStatusRef.current = currentOrder.status;

    const channel = supabase
      .channel(`customer-order-status-${currentOrder.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${currentOrder.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          const prevStatus = prevStatusRef.current;

          if (prevStatus !== newStatus) {
            if (prevStatus === 'pending' && newStatus === 'preparing') {
              NotificationSound.play('preparing');
            }
            if (
              prevStatus === 'preparing' &&
              (newStatus === 'served' || newStatus === 'order is ready')
            ) {
              NotificationSound.play('ready');
            }
            prevStatusRef.current = newStatus;
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentOrder?.id, currentOrder?.status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Progress Indicator */}
      {currentStep !== 'table-selection' && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${currentStep === 'menu' || currentStep === 'cart' || currentStep === 'order-status' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-600">Menu</span>
                <div className={`w-3 h-3 rounded-full ${currentStep === 'cart' || currentStep === 'order-status' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-600">Cart</span>
                <div className={`w-3 h-3 rounded-full ${currentStep === 'order-status' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-600">Order Status</span>
              </div>
              {selectedTable && (
                <div className="text-sm text-gray-600">
                  Table: <span className="font-semibold text-orange-600">{selectedTable}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
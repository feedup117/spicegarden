import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Droplets, 
  Receipt,
  ChefHat,
  Bell,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { NotificationSound } from '../../utils/notifications';

interface Order {
  id: string;
  table_id: number;
  items: any;
  total_amount: number;
  status: string;
  created_at: string;
  max_prep_time: number;
}

interface CustomerRequest {
  id: string;
  table_id: number;
  request_type: 'water' | 'bill' | 'order_more';
  is_served: boolean;
  created_at: string;
}

export function ServantDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'requests'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize notification sounds
    NotificationSound.init();

    const initializeDashboard = async () => {
      await fetchData();
      const cleanup = setupRealtimeSubscriptions();
      return cleanup;
    };

    const cleanupPromise = initializeDashboard();
    
    return () => {
      cleanupPromise.then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, []);

  const fetchData = async () => {
    try {
      const [ordersResult, requestsResult] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .neq('status', 'order is ready')
          .order('created_at', { ascending: true }),
        supabase
          .from('customer_requests')
          .select('*')
          .eq('is_served', false)
          .order('created_at', { ascending: true })
      ]);

      if (ordersResult.data) setOrders(ordersResult.data);
      if (requestsResult.data) setRequests(requestsResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    try {
      // Subscribe to orders updates
      const ordersSubscription = supabase
        .channel('servant-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
          () => {
            fetchData();
            // Show notification for new orders
            toast.success('New order received!', {
              icon: '🔔'
            });
          })
        .subscribe();

      // Subscribe to requests updates
      const requestsSubscription = supabase
        .channel('servant-requests')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_requests' }, 
          () => {
            fetchData();
            // Show notification for new requests
            toast.success('New customer request!', {
              icon: '🔔'
            });
          })
        .subscribe();

      return () => {
        ordersSubscription.unsubscribe();
        requestsSubscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up realtime subscriptions:', error);
      return () => {}; // Return empty cleanup function on error
    }
  };

  const playStatusSound = (status: string) => {
    console.log('Playing sound for status:', status);
    try {
      if (status === 'preparing') {
        NotificationSound.play('preparing');
      } else if (status === 'order is ready') {
        NotificationSound.play('ready');
      }
    } catch (error) {
      console.error('Error playing status sound:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('Updating order status to:', newStatus);
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Play sound before showing toast and fetching data
      playStatusSound(newStatus);
      
      toast.success(`Order marked as ${newStatus}!`);
      await fetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleServeRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('customer_requests')
        .update({ 
          is_served: true,
          served_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Request completed successfully!');
      fetchData();
    } catch (error) {
      console.error('Error serving request:', error);
      toast.error('Failed to complete request');
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'order is ready':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeSinceOrder = (createdAt: string) => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 minute ago';
    return `${diffMinutes} minutes ago`;
  };

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'water':
        return <Droplets className="h-8 w-8 text-cyan-500" />;
      case 'bill':
        return <Receipt className="h-8 w-8 text-green-500" />;
      case 'order_more':
        return <ShoppingCart className="h-8 w-8 text-orange-500" />;
      default:
        return <AlertCircle className="h-8 w-8 text-gray-500" />;
    }
  };

  const getRequestTitle = (type: string) => {
    switch (type) {
      case 'water':
        return 'Water Bottle';
      case 'bill':
        return 'Bill Request';
      case 'order_more':
        return 'Order More Food';
      default:
        return 'Request';
    }
  };

  const getRequestDescription = (type: string) => {
    switch (type) {
      case 'water':
        return 'Customer needs a water bottle';
      case 'bill':
        return 'Customer is ready for the bill';
      case 'order_more':
        return 'Customer wants to order more food';
      default:
        return 'Customer request';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Servant Dashboard</h1>
          <p className="text-gray-600">Manage orders and customer requests</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Preparing</p>
                <p className="text-2xl font-bold text-blue-600">{preparingOrders.length}</p>
              </div>
              <ChefHat className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customer Requests</p>
                <p className="text-2xl font-bold text-orange-600">{requests.length}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Active</p>
                <p className="text-2xl font-bold text-green-600">{orders.length + requests.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Orders</span>
            {orders.length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                {orders.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'requests'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            <span>Requests</span>
            {requests.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {requests.length}
              </span>
            )}
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">No pending orders at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    {/* Header */}
                    <div className={`p-4 border-l-4 ${getOrderStatusColor(order.status)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Users className="h-6 w-6 text-gray-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Table {order.table_id}</h3>
                            <p className="text-sm text-gray-600">{getTimeSinceOrder(order.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">₹{order.total_amount}</p>
                          <p className="text-sm text-gray-600">{order.max_prep_time} min prep</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Order Items:</h4>
                      <div className="space-y-2">
                        {Object.entries(order.items).map(([itemId, item]: [string, any]) => (
                          <div key={itemId} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                            <span className="font-medium">{item.title}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">x{item.quantity}</span>
                              <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-gray-50 border-t">
                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                          >
                            <ChefHat className="h-4 w-4" />
                            <span>Start Preparing</span>
                          </button>
                        )}
                        
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'order is ready')}
                            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Mark as Ready</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {requests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests!</h3>
                <p className="text-gray-600">All customer requests have been handled.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className={`p-4 border-l-4 ${
                      request.request_type === 'water' ? 'border-cyan-400 bg-cyan-50' : 
                      request.request_type === 'bill' ? 'border-green-400 bg-green-50' :
                      'border-orange-400 bg-orange-50'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Users className="h-6 w-6 text-gray-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Table {request.table_id}</h3>
                            <p className="text-sm text-gray-600">{getTimeSinceOrder(request.created_at)}</p>
                          </div>
                        </div>
                        {getRequestIcon(request.request_type)}
                      </div>

                      <div className="mb-4">
                        <p className="text-lg font-medium text-gray-900">
                          {getRequestTitle(request.request_type)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {getRequestDescription(request.request_type)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleServeRequest(request.id)}
                        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors flex items-center justify-center space-x-2 ${
                          request.request_type === 'water' ? 'bg-cyan-500 hover:bg-cyan-600' : 
                          request.request_type === 'bill' ? 'bg-green-500 hover:bg-green-600' :
                          'bg-orange-500 hover:bg-orange-600'
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark Complete</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
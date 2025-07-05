import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Settings,
  Monitor,
  UserX
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  prep_time: number;
  category: string;
  is_available: boolean;
}

interface Order {
  id: string;
  table_id: number;
  items: any;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Table {
  id: number;
  table_number: number;
  status: 'free' | 'occupied';
  device_count?: number;
}

interface CustomerRequest {
  id: string;
  table_id: number;
  request_type: 'water' | 'bill' | 'order_more';
  is_served: boolean;
  created_at: string;
}

export function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'orders' | 'tables' | 'requests'>('overview');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for menu items
  const [menuForm, setMenuForm] = useState({
    title: '',
    description: '',
    price: '',
    prep_time: '',
    category: 'main'
  });

  // Form state for tables
  const [tableForm, setTableForm] = useState({
    table_number: ''
  });

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await fetchAllData();
        const cleanup = setupRealtimeSubscriptions();
        return cleanup;
      } catch (err) {
        console.error('Failed to initialize dashboard:', err);
        setError('Failed to initialize dashboard. Please check your connection and try again.');
      }
    };

    const cleanupPromise = initializeDashboard();
    
    return () => {
      cleanupPromise.then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, []);

  const fetchAllData = async () => {
    try {
      setError(null);
      const [menuResult, ordersResult, tablesResult, requestsResult] = await Promise.all([
        supabase.from('menu_items').select('*').order('category'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        fetchTablesWithDeviceCount(),
        supabase.from('customer_requests').select('*').eq('is_served', false).order('created_at', { ascending: false })
      ]);

      if (menuResult.error) throw menuResult.error;
      if (ordersResult.error) throw ordersResult.error;
      if (requestsResult.error) throw requestsResult.error;

      if (menuResult.data) setMenuItems(menuResult.data);
      if (ordersResult.data) setOrders(ordersResult.data);
      if (tablesResult) setTables(tablesResult);
      if (requestsResult.data) setRequests(requestsResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTablesWithDeviceCount = async () => {
    try {
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .order('table_number');

      if (tablesError) throw tablesError;

      // Get device counts for each table
      const tablesWithDeviceCount = await Promise.all(
        (tablesData || []).map(async (table) => {
          try {
            const { data: deviceData, error: deviceError } = await supabase
              .from('device_sessions')
              .select('device_id')
              .eq('table_id', table.id);

            if (deviceError) {
              console.error('Error fetching device count:', deviceError);
              return { ...table, device_count: 0 };
            }

            return { ...table, device_count: deviceData?.length || 0 };
          } catch (err) {
            console.error('Error processing table device count:', err);
            return { ...table, device_count: 0 };
          }
        })
      );

      return tablesWithDeviceCount;
    } catch (error) {
      console.error('Error fetching tables with device count:', error);
      return [];
    }
  };

  const setupRealtimeSubscriptions = () => {
    try {
      // Subscribe to orders updates
      const ordersSubscription = supabase
        .channel('orders-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
          () => fetchAllData())
        .subscribe();

      // Subscribe to requests updates
      const requestsSubscription = supabase
        .channel('requests-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_requests' }, 
          () => fetchAllData())
        .subscribe();

      // Subscribe to device sessions updates
      const sessionsSubscription = supabase
        .channel('sessions-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'device_sessions' }, 
          () => fetchAllData())
        .subscribe();

      return () => {
        ordersSubscription.unsubscribe();
        requestsSubscription.unsubscribe();
        sessionsSubscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up realtime subscriptions:', error);
      return () => {}; // Return empty cleanup function on error
    }
  };

  // Menu Management Functions
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .insert({
          title: menuForm.title,
          description: menuForm.description,
          price: parseFloat(menuForm.price),
          prep_time: parseInt(menuForm.prep_time),
          category: menuForm.category,
          is_available: true
        });

      if (error) throw error;

      toast.success('Menu item added successfully!');
      setShowAddMenuItem(false);
      setMenuForm({ title: '', description: '', price: '', prep_time: '', category: 'main' });
      fetchAllData();
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
    }
  };

  const handleUpdateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .update({
          title: menuForm.title,
          description: menuForm.description,
          price: parseFloat(menuForm.price),
          prep_time: parseInt(menuForm.prep_time),
          category: menuForm.category
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      toast.success('Menu item updated successfully!');
      setEditingItem(null);
      setMenuForm({ title: '', description: '', price: '', prep_time: '', category: 'main' });
      fetchAllData();
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Menu item deleted successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Menu item ${!currentStatus ? 'enabled' : 'disabled'} successfully!`);
      fetchAllData();
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability');
    }
  };

  // Table Management Functions
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('tables')
        .insert({
          table_number: parseInt(tableForm.table_number),
          status: 'free'
        });

      if (error) throw error;

      toast.success('Table added successfully!');
      setShowAddTable(false);
      setTableForm({ table_number: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error adding table:', error);
      toast.error('Failed to add table');
    }
  };

  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;

    try {
      const { error } = await supabase
        .from('tables')
        .update({
          table_number: parseInt(tableForm.table_number)
        })
        .eq('id', editingTable.id);

      if (error) throw error;

      toast.success('Table updated successfully!');
      setEditingTable(null);
      setTableForm({ table_number: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error updating table:', error);
      toast.error('Failed to update table');
    }
  };

  const handleDeleteTable = async (id: number) => {
    if (!confirm('Are you sure you want to delete this table? This will also delete all associated orders and sessions.')) return;

    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Table deleted successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error('Failed to delete table');
    }
  };

  const handleClearTable = async (tableId: number) => {
    if (!confirm('Are you sure you want to clear this table? This will remove all device sessions and mark the table as free.')) return;

    try {
      // Clear device sessions for this table
      const { error: sessionError } = await supabase
        .from('device_sessions')
        .delete()
        .eq('table_id', tableId);

      if (sessionError) throw sessionError;

      // Mark table as free
      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'free' })
        .eq('id', tableId);

      if (tableError) throw tableError;

      toast.success('Table cleared successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error clearing table:', error);
      toast.error('Failed to clear table');
    }
  };

  const handleToggleTableStatus = async (tableId: number, currentStatus: 'free' | 'occupied') => {
    const newStatus = currentStatus === 'free' ? 'occupied' : 'free';
    
    try {
      const { error } = await supabase
        .from('tables')
        .update({ status: newStatus })
        .eq('id', tableId);

      if (error) throw error;

      toast.success(`Table marked as ${newStatus}!`);
      fetchAllData();
    } catch (error) {
      console.error('Error updating table status:', error);
      toast.error('Failed to update table status');
    }
  };

  // Order Management Functions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order status updated successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Request Management Functions
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

      toast.success('Request marked as served!');
      fetchAllData();
    } catch (error) {
      console.error('Error serving request:', error);
      toast.error('Failed to serve request');
    }
  };

  // Helper Functions
  const startEditMenuItem = (item: MenuItem) => {
    setEditingItem(item);
    setMenuForm({
      title: item.title,
      description: item.description,
      price: item.price.toString(),
      prep_time: item.prep_time.toString(),
      category: item.category
    });
  };

  const startEditTable = (table: Table) => {
    setEditingTable(table);
    setTableForm({
      table_number: table.table_number.toString()
    });
  };

  const cancelEditMenuItem = () => {
    setEditingItem(null);
    setMenuForm({ title: '', description: '', price: '', prep_time: '', category: 'main' });
  };

  const cancelEditTable = () => {
    setEditingTable(null);
    setTableForm({ table_number: '' });
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
    occupiedTables: tables.filter(t => t.status === 'occupied').length
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchAllData();
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
          <p className="text-gray-600">Complete restaurant management system</p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-200 p-1 rounded-lg overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'menu', label: 'Menu Items', icon: ShoppingBag },
            { id: 'orders', label: 'Orders', icon: Clock },
            { id: 'tables', label: 'Tables', icon: Users },
            { id: 'requests', label: 'Requests', icon: AlertCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.id === 'requests' && requests.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenue Today</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Occupied Tables</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.occupiedTables}/{tables.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              </div>
              <div className="p-6">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">Table {order.table_id}</p>
                      <p className="text-sm text-gray-600">₹{order.total_amount}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
              <button
                onClick={() => setShowAddMenuItem(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Add/Edit Form */}
            {(showAddMenuItem || editingItem) && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <form onSubmit={editingItem ? handleUpdateMenuItem : handleAddMenuItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Item Title"
                      value={menuForm.title}
                      onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <select
                      value={menuForm.category}
                      onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="starter">Starter</option>
                      <option value="main">Main Course</option>
                      <option value="dessert">Dessert</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Description"
                    value={menuForm.description}
                    onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={menuForm.price}
                      onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      min="0"
                      step="0.01"
                    />
                    <input
                      type="number"
                      placeholder="Prep Time (minutes)"
                      value={menuForm.prep_time}
                      onChange={(e) => setMenuForm({ ...menuForm, prep_time: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      min="1"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMenuItem(false);
                        cancelEditMenuItem();
                      }}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Menu Items List */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6">
                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-green-600 font-semibold">₹{item.price}</span>
                              <span className="text-sm text-gray-500">{item.prep_time} min</span>
                              <span className="text-sm bg-gray-100 px-2 py-1 rounded">{item.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleAvailability(item.id, item.is_available)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.is_available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </button>
                        <button
                          onClick={() => startEditMenuItem(item)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
            
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6">
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">Table {order.table_id}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-green-600">₹{order.total_amount}</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="served">Served</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="font-medium text-gray-900 mb-2">Order Items:</h5>
                        <div className="space-y-1">
                          {Object.entries(order.items).map(([itemId, item]: [string, any]) => (
                            <div key={itemId} className="flex justify-between text-sm">
                              <span>{item.title} x {item.quantity}</span>
                              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Table Management</h2>
              <button
                onClick={() => setShowAddTable(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Table</span>
              </button>
            </div>

            {/* Add/Edit Table Form */}
            {(showAddTable || editingTable) && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingTable ? 'Edit Table' : 'Add New Table'}
                </h3>
                <form onSubmit={editingTable ? handleUpdateTable : handleAddTable} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Table Number"
                      value={tableForm.table_number}
                      onChange={(e) => setTableForm({ table_number: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                      min="1"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      {editingTable ? 'Update Table' : 'Add Table'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddTable(false);
                        cancelEditTable();
                      }}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.map((table) => (
                <motion.div
                  key={table.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    table.status === 'free'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="text-center">
                    <Users className={`h-8 w-8 mx-auto mb-2 ${
                      table.status === 'free' ? 'text-green-600' : 'text-red-600'
                    }`} />
                    <h3 className="text-lg font-semibold text-gray-900">Table {table.table_number}</h3>
                    
                    <div className="mt-2 space-y-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        table.status === 'free' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {table.status === 'free' ? 'Available' : 'Occupied'}
                      </span>
                      
                      {table.device_count !== undefined && (
                        <div className="flex items-center justify-center space-x-1 text-xs text-gray-600">
                          <Monitor className="h-3 w-3" />
                          <span>{table.device_count}/2 devices</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={() => handleToggleTableStatus(table.id, table.status)}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                          table.status === 'free'
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        Mark as {table.status === 'free' ? 'Occupied' : 'Free'}
                      </button>
                      
                      {table.status === 'occupied' && (
                        <button
                          onClick={() => handleClearTable(table.id)}
                          className="w-full bg-green-500 text-white py-2 rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                        >
                          <UserX className="h-3 w-3" />
                          <span>Clear Table</span>
                        </button>
                      )}
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => startEditTable(table)}
                          className="flex-1 p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4 mx-auto" />
                        </button>
                        <button
                          onClick={() => handleDeleteTable(table.id)}
                          className="flex-1 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">Customer Requests</h2>
              {requests.length > 0 && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                  {requests.length} pending
                </span>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6">
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900">Table {request.table_id}</h4>
                          <p className="text-sm text-gray-600 capitalize">
                            Requested: {request.request_type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.created_at).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleServeRequest(request.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Mark Served</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';
import { getDeviceId } from '../../utils/deviceUtils';
import toast from 'react-hot-toast';

interface Table {
  id: number;
  table_number: number;
  status: 'free' | 'occupied';
}

interface TableSelectionProps {
  onTableSelected: (tableId: number) => void;
}

export function TableSelection({ onTableSelected }: TableSelectionProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const { setSelectedTable, setDeviceId } = useStore();

  useEffect(() => {
    fetchTables();
    const deviceId = getDeviceId();
    setDeviceId(deviceId);
  }, [setDeviceId]);

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number');

      if (error) throw error;
      setTables(data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = async (table: Table) => {
    if (table.status === 'occupied') {
      toast.error('This table is currently occupied');
      return;
    }

    const deviceId = getDeviceId();
    
    try {
      // Check if this table already has 2 devices
      const { data: existingSessions, error: sessionError } = await supabase
        .from('device_sessions')
        .select('device_id')
        .eq('table_id', table.id);

      if (sessionError) throw sessionError;

      // Check if current device already has access to this table
      const hasAccess = existingSessions?.some(session => session.device_id === deviceId);
      
      if (!hasAccess && existingSessions && existingSessions.length >= 2) {
        toast.error('This table is already in use. Please use the original device to continue ordering.');
        return;
      }

      // Add device session if not exists
      if (!hasAccess) {
        const { error: insertError } = await supabase
          .from('device_sessions')
          .insert({
            table_id: table.id,
            device_id: deviceId,
          });

        if (insertError) throw insertError;

        // Mark table as occupied
        const { error: updateError } = await supabase
          .from('tables')
          .update({ status: 'occupied' })
          .eq('id', table.id);

        if (updateError) throw updateError;
      }

      setSelectedTable(table.id);
      setSelectedTableId(table.id);
      toast.success(`Table ${table.table_number} selected successfully!`);
      onTableSelected(table.id);
      
    } catch (error) {
      console.error('Error selecting table:', error);
      toast.error('Failed to select table');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your Table</h2>
        <p className="text-gray-600">Choose an available table to start ordering</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table, index) => (
          <motion.button
            key={table.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTableSelect(table)}
            disabled={table.status === 'occupied'}
            className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
              table.status === 'free'
                ? 'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100 cursor-pointer'
                : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
            } ${selectedTableId === table.id ? 'ring-4 ring-orange-300' : ''}`}
          >
            <div className="flex flex-col items-center space-y-2">
              <Users 
                className={`h-8 w-8 ${
                  table.status === 'free' ? 'text-green-600' : 'text-red-600'
                }`} 
              />
              <span className="text-lg font-semibold text-gray-900">
                {table.table_number}
              </span>
              <span 
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  table.status === 'free' 
                    ? 'text-green-700 bg-green-200' 
                    : 'text-red-700 bg-red-200'
                }`}
              >
                {table.status === 'free' ? 'Available' : 'Occupied'}
              </span>
            </div>

            {table.status === 'occupied' && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-75 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <div className="inline-flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span>Occupied</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
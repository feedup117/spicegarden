import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, UserCheck, ChefHat } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'manager' | 'servant' | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error('Please select your role first');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message);
        return;
      }

      if (!data.user) {
        throw new Error('User data is missing');
      }

      // Wait for profile data
      const profile = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile.error || profile.data?.role !== selectedRole) {
        toast.error('Invalid credentials for selected role');
        return;
      }

      // Success path
      const redirectPath = selectedRole === 'manager' ? '/dashboard' : '/servant';
      navigate(redirectPath);
      toast.success('Successfully signed in!');
      
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'manager' | 'servant') => {
    if (role === 'manager') {
      setEmail('admin@manager.com');
      setPassword('Hemanth');
    } else {
      setEmail('admin@servant.com');
      setPassword('Hello123');
    }
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <LogIn className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Staff Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select your role and sign in to continue
          </p>
        </div>

        {/* Role Selection */}
        {!selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
              Choose Your Role
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('manager')}
                className="flex items-center justify-center space-x-3 p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all"
              >
                <UserCheck className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Manager</div>
                  <div className="text-sm text-gray-600">Full restaurant management</div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('servant')}
                className="flex items-center justify-center space-x-3 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <ChefHat className="h-6 w-6 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Servant</div>
                  <div className="text-sm text-gray-600">Order & request management</div>
                </div>
              </motion.button>
            </div>

            {/* Quick Demo Login Buttons */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3 text-center">Quick Demo Login</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDemoLogin('manager')}
                  className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors"
                >
                  Demo Manager
                </button>
                <button
                  onClick={() => handleDemoLogin('servant')}
                  className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Demo Servant
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                {selectedRole === 'manager' ? (
                  <UserCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <ChefHat className="h-5 w-5 text-blue-600" />
                )}
                <span className="font-medium text-gray-900 capitalize">
                  {selectedRole} Login
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setEmail('');
                  setPassword('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Change Role
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder={`Enter your ${selectedRole} email`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use format: username@{selectedRole}.com
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedRole === 'manager'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  `Sign In as ${selectedRole}`
                )}
              </motion.button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Manager:</strong> admin@manager.com / Hemanth</p>
                <p><strong>Servant:</strong> admin@servant.com / Hello123</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDemoLogin('manager')}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200 transition-colors"
                >
                  Fill Manager
                </button>
                <button
                  onClick={() => handleDemoLogin('servant')}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                >
                  Fill Servant
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
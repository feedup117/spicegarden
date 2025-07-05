import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  title: string;
  price: number;
  prep_time: number;
  quantity: number;
}

interface StoreState {
  // Customer state
  selectedTable: number | null;
  deviceId: string;
  cart: CartItem[];
  currentOrder: any | null;
  
  // Actions
  setSelectedTable: (table: number | null) => void;
  setDeviceId: (id: string) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCurrentOrder: (order: any) => void;
}

// Generate device ID
const generateDeviceId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      selectedTable: null,
      deviceId: generateDeviceId(),
      cart: [],
      currentOrder: null,

      setSelectedTable: (table) => set({ selectedTable: table }),
      
      setDeviceId: (id) => set({ deviceId: id }),

      addToCart: (item) => {
        const cart = get().cart;
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
          set({
            cart: cart.map(cartItem =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            ),
          });
        } else {
          set({
            cart: [...cart, { ...item, quantity: 1 }],
          });
        }
      },

      removeFromCart: (id) => {
        set({
          cart: get().cart.filter(item => item.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        
        set({
          cart: get().cart.map(item =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ cart: [] }),
      
      setCurrentOrder: (order) => set({ currentOrder: order }),
    }),
    {
      name: 'restaurant-store',
      partialize: (state) => ({
        selectedTable: state.selectedTable,
        deviceId: state.deviceId,
        cart: state.cart,
        currentOrder: state.currentOrder,
      }),
    }
  )
);
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sale, CartItem, CashRegister, DailySummary, RegisterClosing } from '../types';
import { useAuth } from './AuthContext';
import { format } from 'date-fns';
import {
  getSales,
  deleteRegisterClosing as deleteRegisterClosingService,
  updateRegisterClosingAmount as updateRegisterClosingAmountService,
  addSale,
  getCurrentRegister,
  openRegister as openRegisterService,
  closeRegister as closeRegisterService,
  updateRegisterSales,
  getRegisterClosings,
  addRegisterClosing
} from '../firebase/services';

interface SalesContextType {
  sales: Sale[];
  currentRegister: CashRegister | null;
  registerClosings: RegisterClosing[];
  cart: CartItem[];
  loading: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  completeSale: (amountPaid: number, customerName: string) => Promise<Sale | null>;
  openRegister: (initialAmount: number) => Promise<void>;
  closeRegister: (finalAmount: number) => Promise<void>;
  getDailySummary: (days: number) => DailySummary[];
  getTotalSales: () => number;
  getSaleCount: () => number;
  deleteRegisterClosing: (id: string) => void;
  updateRegisterClosingAmount: (id: string, newFinalAmount: number) => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(null);
  const [registerClosings, setRegisterClosings] = useState<RegisterClosing[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load sales, register, and closings from Firestore
  useEffect(() => {
    const loadData = async () => {
      try {
        const salesData = await getSales();
        const registerData = await getCurrentRegister();
        const closingsData = await getRegisterClosings();
        
        setSales(salesData);
        setCurrentRegister(registerData);
        setRegisterClosings(closingsData);
      } catch (error) {
        console.error('Error loading sales data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const addToCart = (item: CartItem) => {
    const existingItemIndex = cart.findIndex(
      cartItem => cartItem.product.id === item.product.id
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += item.quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, item]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const completeSale = async (amountPaid: number, customerName: string = ''): Promise<Sale | null> => {
    if (!currentUser) {
      throw new Error('No user is logged in');
    }

    if (!currentRegister) {
      throw new Error('Register is not open');
    }

    const total = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity, 
      0
    );

    const newSale: Omit<Sale, 'id'> = {
      items: [...cart],
      total,
      amountPaid,
      change: amountPaid - total,
      timestamp: new Date(),
      cashierId: currentUser.id,
      customerName
    };

    try {
      // Add sale to Firestore
      const savedSale = await addSale(newSale);
      
      if (savedSale) {
        // Update sales state
        const updatedSales = [...sales, savedSale];
        setSales(updatedSales);
        
        // Update current register with the new sale
        await updateRegisterSales(currentRegister.id, savedSale);
        
        const updatedRegister = {
          ...currentRegister,
          sales: [...currentRegister.sales, savedSale]
        };
        setCurrentRegister(updatedRegister);
        
        // Clear the cart after completing the sale
        clearCart();
        
        return savedSale;
      }
      
      return null;
    } catch (error) {
      console.error('Error completing sale:', error);
      return null;
    }
  };

  const openRegister = async (initialAmount: number) => {
    if (!currentUser) {
      throw new Error('No user is logged in');
    }

    try {
      const newRegister = await openRegisterService(initialAmount, currentUser.id);
      
      if (newRegister) {
        setCurrentRegister(newRegister);
      }
    } catch (error) {
      console.error('Error opening register:', error);
    }
  };

  const closeRegister = async (finalAmount: number) => {
    if (!currentRegister) {
      throw new Error('No register is currently open');
    }

    if (!currentUser) {
      throw new Error('No user is logged in');
    }

    try {
      const closingTime = new Date();
      const totalSales = getTotalSales();
      const expectedAmount = currentRegister.initialAmount + totalSales;
      const difference = finalAmount - expectedAmount;
      
      // Close register in Firestore
      await closeRegisterService(currentRegister.id, finalAmount);
      
      // Create a register closing record
      const newClosing: Omit<RegisterClosing, 'id'> = {
        registerId: currentRegister.id,
        openedAt: currentRegister.openedAt,
        closedAt: closingTime,
        initialAmount: currentRegister.initialAmount,
        finalAmount,
        expectedAmount,
        difference,
        totalSales,
        salesCount: currentRegister.sales.length,
        cashierId: currentUser.id
      };
      
      // Add register closing to Firestore
      const savedClosing = await addRegisterClosing(newClosing);
      
      if (savedClosing) {
        // Update register closings state
        const updatedClosings = [...registerClosings, savedClosing];
        setRegisterClosings(updatedClosings);
      }
      
      // Clear current register
      setCurrentRegister(null);
    } catch (error) {
      console.error('Error closing register:', error);
    }
  };

  const getDailySummary = (days: number): DailySummary[] => {
    const summary: Record<string, DailySummary> = {};
    
    // Initialize the last 'days' days with zero values
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      summary[dateStr] = {
        date: dateStr,
        totalSales: 0,
        salesCount: 0
      };
    }
    
    // Fill in actual sales data
    sales.forEach(sale => {
      const dateStr = format(new Date(sale.timestamp), 'yyyy-MM-dd');
      if (summary[dateStr]) {
        summary[dateStr].totalSales += sale.total;
        summary[dateStr].salesCount += 1;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(summary).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
  };

  const getTotalSales = (): number => {
    if (!currentRegister) return 0;
    return currentRegister.sales.reduce((sum, sale) => sum + sale.total, 0);
  };

  const getSaleCount = (): number => {
    if (!currentRegister) return 0;
    return currentRegister.sales.length;
  };

  const deleteRegisterClosing = (id: string) => {
    try {
      deleteRegisterClosingService(id);
      setRegisterClosings(prev => prev.filter(closing => closing.id !== id));
    } catch (error) {
      console.error('Error deleting register closing:', error);
    }
  };

  const updateRegisterClosingAmount = (id: string, newFinalAmount: number) => {
    try {
      updateRegisterClosingAmountService(id, newFinalAmount);
      setRegisterClosings(prev => prev.map(closing => {
        if (closing.id === id) {
          const newDifference = newFinalAmount - (closing.initialAmount + closing.totalSales);
          return {
            ...closing,
            finalAmount: newFinalAmount,
            difference: newDifference
          };
        }
        return closing;
      }));
    } catch (error) {
      console.error('Error updating register closing amount:', error);
    }
  };

  return (
    <SalesContext.Provider 
      value={{ 
        sales, 
        currentRegister,
        registerClosings,
        cart,
        loading,
        addToCart, 
        removeFromCart, 
        updateCartItemQuantity,
        clearCart, 
        completeSale,
        openRegister,
        closeRegister,
        getDailySummary,
        getTotalSales,
        getSaleCount,
        deleteRegisterClosing,
        updateRegisterClosingAmount
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = (): SalesContextType => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
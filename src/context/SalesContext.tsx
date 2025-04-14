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

// Tipo de contexto para las operaciones de ventas
interface SalesContextType {
  sales: Sale[];
  currentRegister: CashRegister | null;
  registerClosings: RegisterClosing[];
  cart: CartItem[];
  loading: boolean;
  getSales: () => Promise<void>;
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

// Proveedor que gestiona el estado global de las ventas
export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(null);
  const [registerClosings, setRegisterClosings] = useState<RegisterClosing[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Carga las ventas desde la base de datos
  const loadSales = async () => {
    try {
      const salesData = await getSales();
      setSales(salesData);
    } catch (error) {
      console.error('Error loading sales data:', error);
    }
  };

  // Carga las ventas, el registro y los cierres de caja desde Firestore al iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadSales();
        const registerData = await getCurrentRegister();
        const closingsData = await getRegisterClosings();
        
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

  // Agrega un artículo al carrito. Si ya existe, solo actualiza la cantidad
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

  // Elimina un artículo del carrito por su ID de producto
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Actualiza la cantidad de un artículo en el carrito
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

  // Limpia el carrito de compras
  const clearCart = () => {
    setCart([]);
  };

  // Completa la venta: crea una venta, actualiza el registro de caja y limpia el carrito
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
      // Agrega la venta a la base de datos
      const savedSale = await addSale(newSale);
      
      if (savedSale) {
        // Actualiza las ventas en el estado
        const updatedSales = [...sales, savedSale];
        setSales(updatedSales);
        
        // Actualiza el registro de caja con la nueva venta
        await updateRegisterSales(currentRegister.id, savedSale);
        
        const updatedRegister = {
          ...currentRegister,
          sales: [...currentRegister.sales, savedSale]
        };
        setCurrentRegister(updatedRegister);
        
        // Limpia el carrito después de completar la venta
        clearCart();
        
        return savedSale;
      }
      
      return null;
    } catch (error) {
      console.error('Error completing sale:', error);
      return null;
    }
  };

  // Abre el registro de caja con un monto inicial
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

  // Cierra el registro de caja, crea un cierre de caja y actualiza el estado
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
      
      // Cierra el registro de caja en Firestore
      await closeRegisterService(currentRegister.id, finalAmount);
      
      // Crea un registro de cierre de caja
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
      
      // Agrega el cierre de caja a Firestore
      const savedClosing = await addRegisterClosing(newClosing);
      
      if (savedClosing) {
        // Actualiza el estado de los cierres de caja
        const updatedClosings = [...registerClosings, savedClosing];
        setRegisterClosings(updatedClosings);
      }
      
      // Limpia el registro de caja actual
      setCurrentRegister(null);
    } catch (error) {
      console.error('Error closing register:', error);
    }
  };

  // Obtiene el resumen diario de ventas para los últimos días
  const getDailySummary = (days: number): DailySummary[] => {
    const summary: Record<string, DailySummary> = {};
    
    // Inicializa los últimos 'days' días con valores en cero
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
    
    // Rellena con los datos de ventas reales
    sales.forEach(sale => {
      const dateStr = format(new Date(sale.timestamp), 'yyyy-MM-dd');
      if (summary[dateStr]) {
        summary[dateStr].totalSales += sale.total;
        summary[dateStr].salesCount += 1;
      }
    });
    
    // Convierte el objeto a array y lo ordena por fecha
    return Object.values(summary).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
  };

  // Obtiene el total de ventas del registro actual
  const getTotalSales = (): number => {
    if (!currentRegister) return 0;
    return currentRegister.sales.reduce((sum, sale) => sum + sale.total, 0);
  };

  // Obtiene el número de ventas realizadas en el registro actual
  const getSaleCount = (): number => {
    if (!currentRegister) return 0;
    return currentRegister.sales.length;
  };

  // Elimina un cierre de caja por su ID
  const deleteRegisterClosing = (id: string) => {
    try {
      deleteRegisterClosingService(id);
      setRegisterClosings(prev => prev.filter(closing => closing.id !== id));
    } catch (error) {
      console.error('Error deleting register closing:', error);
    }
  };

  // Actualiza el monto final de un cierre de caja
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
        getSales: loadSales,
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

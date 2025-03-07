import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { Product, Category, Sale, CashRegister, RegisterClosing, User } from '../types';
import { COLLECTIONS, DEFAULTS } from './settings';

// User Services
export const getUserByPin = async (pin: string): Promise<User | null> => {
  try {
    const q = query(collection(db, COLLECTIONS.USERS), where('pin', '==', pin));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userData = querySnapshot.docs[0].data();
    return {
      id: querySnapshot.docs[0].id,
      name: userData.name,
      pin: userData.pin,
      role: userData.role
    } as User;
  } catch (error) {
    console.error('Error getting user by PIN:', error);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        pin: data.pin,
        role: data.role
      } as User;
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

export const updateUserPin = async (userId: string, newPin: string): Promise<boolean> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      pin: newPin
    });
    return true;
  } catch (error) {
    console.error('Error updating user PIN:', error);
    return false;
  }
};

// Initialize demo users if they don't exist
export const initializeDemoUsers = async (): Promise<void> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    
    if (querySnapshot.empty) {
      // Add demo admin user
      await setDoc(doc(db, COLLECTIONS.USERS, '1'), DEFAULTS.ADMIN_USER);
      
      // Add demo cashier user
      await setDoc(doc(db, COLLECTIONS.USERS, '2'), DEFAULTS.CASHIER_USER);
      
      console.log('Demo users initialized');
    }
  } catch (error) {
    console.error('Error initializing demo users:', error);
  }
};

// Product Services
export const getProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        price: data.price,
        categoryId: data.categoryId,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Product;
    });
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const addProduct = async (name: string, price: number, categoryId?: string): Promise<Product | null> => {
  try {
    const productData = {
      name,
      price,
      categoryId: categoryId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), productData);
    
    return {
      id: docRef.id,
      name,
      price,
      categoryId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
};

export const updateProduct = async (id: string, name: string, price: number, categoryId?: string): Promise<boolean> => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, id);
    await updateDoc(productRef, {
      name,
      price,
      categoryId: categoryId || null,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

// Category Services
export const getCategories = async (): Promise<Category[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Category;
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const addCategory = async (name: string): Promise<Category | null> => {
  try {
    const categoryData = {
      name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), categoryData);
    
    return {
      id: docRef.id,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error adding category:', error);
    return null;
  }
};

export const updateCategory = async (id: string, name: string): Promise<boolean> => {
  try {
    const categoryRef = doc(db, COLLECTIONS.CATEGORIES, id);
    await updateDoc(categoryRef, {
      name,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating category:', error);
    return false;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    // Check if there are products using this category
    const q = query(collection(db, COLLECTIONS.PRODUCTS), where('categoryId', '==', id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return false; // Can't delete category with products
    }
    
    await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id));
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};

// Initialize demo categories and products if they don't exist
export const initializeDemoData = async (): Promise<void> => {
  try {
    // Check if categories exist
    const categoriesSnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    
    if (categoriesSnapshot.empty) {
      // Add demo categories
      const categoryPromises = DEFAULTS.DEMO_CATEGORIES.map(category => 
        addDoc(collection(db, COLLECTIONS.CATEGORIES), {
          ...category,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      );
      
      const categoryRefs = await Promise.all(categoryPromises);
      
      // Check if products exist
      const productsSnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      
      if (productsSnapshot.empty) {
        // Add demo products
        const productPromises = DEFAULTS.DEMO_PRODUCTS.map(product => 
          addDoc(collection(db, COLLECTIONS.PRODUCTS), {
            name: product.name,
            price: product.price,
            categoryId: categoryRefs[product.categoryIndex].id,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        );
        
        await Promise.all(productPromises);
      }
      
      console.log('Demo data initialized');
    }
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
};

// Sales Services
export const getSales = async (): Promise<Sale[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.SALES));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        items: data.items,
        total: data.total,
        amountPaid: data.amountPaid,
        change: data.change,
        timestamp: data.timestamp.toDate(),
        cashierId: data.cashierId,
        customerName: data.customerName || ''
      } as Sale;
    });
  } catch (error) {
    console.error('Error getting sales:', error);
    return [];
  }
};

export const addSale = async (sale: Omit<Sale, 'id'>): Promise<Sale | null> => {
  try {
    const saleData = {
      ...sale,
      timestamp: Timestamp.fromDate(sale.timestamp)
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.SALES), saleData);
    
    return {
      ...sale,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error adding sale:', error);
    return null;
  }
};

// Register Services
export const getCurrentRegister = async (): Promise<CashRegister | null> => {
  try {
    const q = query(collection(db, COLLECTIONS.REGISTERS), where('closedAt', '==', null));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const data = querySnapshot.docs[0].data();
    return {
      id: querySnapshot.docs[0].id,
      openedAt: data.openedAt.toDate(),
      closedAt: null,
      initialAmount: data.initialAmount,
      finalAmount: null,
      sales: data.sales || [],
      cashierId: data.cashierId
    } as CashRegister;
  } catch (error) {
    console.error('Error getting current register:', error);
    return null;
  }
};

export const openRegister = async (initialAmount: number, cashierId: string): Promise<CashRegister | null> => {
  try {
    const registerData = {
      openedAt: serverTimestamp(),
      closedAt: null,
      initialAmount,
      finalAmount: null,
      sales: [],
      cashierId
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.REGISTERS), registerData);
    
    return {
      id: docRef.id,
      openedAt: new Date(),
      closedAt: null,
      initialAmount,
      finalAmount: null,
      sales: [],
      cashierId
    };
  } catch (error) {
    console.error('Error opening register:', error);
    return null;
  }
};

export const updateRegisterSales = async (registerId: string, sale: Sale): Promise<boolean> => {
  try {
    const registerRef = doc(db, COLLECTIONS.REGISTERS, registerId);
    const registerDoc = await getDoc(registerRef);
    
    if (!registerDoc.exists()) {
      return false;
    }
    
    const registerData = registerDoc.data();
    const sales = registerData.sales || [];
    
    await updateDoc(registerRef, {
      sales: [...sales, sale]
    });
    
    return true;
  } catch (error) {
    console.error('Error updating register sales:', error);
    return false;
  }
};

export const closeRegister = async (registerId: string, finalAmount: number): Promise<boolean> => {
  try {
    const registerRef = doc(db, COLLECTIONS.REGISTERS, registerId);
    await updateDoc(registerRef, {
      closedAt: serverTimestamp(),
      finalAmount
    });
    return true;
  } catch (error) {
    console.error('Error closing register:', error);
    return false;
  }
};

// Register Closings Services
export const getRegisterClosings = async (): Promise<RegisterClosing[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.REGISTER_CLOSINGS));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        registerId: data.registerId,
        openedAt: data.openedAt.toDate(),
        closedAt: data.closedAt.toDate(),
        initialAmount: data.initialAmount,
        finalAmount: data.finalAmount,
        expectedAmount: data.expectedAmount,
        difference: data.difference,
        totalSales: data.totalSales,
        salesCount: data.salesCount,
        cashierId: data.cashierId
      } as RegisterClosing;
    });
  } catch (error) {
    console.error('Error getting register closings:', error);
    return [];
  }
};

export const addRegisterClosing = async (closing: Omit<RegisterClosing, 'id'>): Promise<RegisterClosing | null> => {
  try {
    const closingData = {
      ...closing,
      openedAt: Timestamp.fromDate(closing.openedAt),
      closedAt: Timestamp.fromDate(closing.closedAt)
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.REGISTER_CLOSINGS), closingData);
    
    return {
      ...closing,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error adding register closing:', error);
    return null;
  }
};
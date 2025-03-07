import { v4 as uuidv4 } from 'uuid';
import { Product, Category, Sale, CashRegister, RegisterClosing, User } from '../types';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SALES: 'sales',
  CURRENT_REGISTER: 'currentRegister',
  REGISTER_CLOSINGS: 'registerClosings'
};

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setItem = (key: string, value: any): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize demo users if they don't exist
export const initializeDemoUsers = (): void => {
  const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
  
  if (users.length === 0) {
    const demoUsers: User[] = [
      {
        id: '1',
        name: 'Admin',
        pin: '1234',
        role: 'admin'
      },
      {
        id: '2',
        name: 'Cajero',
        pin: '5678',
        role: 'cashier'
      }
    ];
    
    setItem(STORAGE_KEYS.USERS, demoUsers);
  }
};

// Initialize demo data
export const initializeDemoData = (): void => {
  const categories = getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  
  if (categories.length === 0 && products.length === 0) {
    const demoCategories: Category[] = [
      {
        id: uuidv4(),
        name: 'Bebidas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Comidas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Postres',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    setItem(STORAGE_KEYS.CATEGORIES, demoCategories);
    
    const demoProducts: Product[] = [
      {
        id: uuidv4(),
        name: 'Café Americano',
        price: 2.50,
        categoryId: demoCategories[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Sandwich de Jamón y Queso',
        price: 4.75,
        categoryId: demoCategories[1].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Jugo de Naranja',
        price: 3.00,
        categoryId: demoCategories[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    setItem(STORAGE_KEYS.PRODUCTS, demoProducts);
  }
};

// User Services
export const getUserByPin = (pin: string): User | null => {
  const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
  return users.find(user => user.pin === pin) || null;
};

export const getAllUsers = (): User[] => {
  return getItem<User[]>(STORAGE_KEYS.USERS, []);
};

export const updateUserPin = (userId: string, newPin: string): void => {
  const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
  const updatedUsers = users.map(user =>
    user.id === userId ? { ...user, pin: newPin } : user
  );
  setItem(STORAGE_KEYS.USERS, updatedUsers);
};

// Product Services
export const getProducts = (): Product[] => {
  return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
};

export const addProduct = (name: string, price: number, categoryId?: string): Product => {
  const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const newProduct: Product = {
    id: uuidv4(),
    name,
    price,
    categoryId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  products.push(newProduct);
  setItem(STORAGE_KEYS.PRODUCTS, products);
  return newProduct;
};

export const updateProduct = (id: string, name: string, price: number, categoryId?: string): boolean => {
  const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const updatedProducts = products.map(product =>
    product.id === id
      ? { ...product, name, price, categoryId, updatedAt: new Date() }
      : product
  );
  setItem(STORAGE_KEYS.PRODUCTS, updatedProducts);
  return true;
};

export const deleteProduct = (id: string): boolean => {
  const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const filteredProducts = products.filter(product => product.id !== id);
  setItem(STORAGE_KEYS.PRODUCTS, filteredProducts);
  return true;
};

// Category Services
export const getCategories = (): Category[] => {
  return getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
};

export const addCategory = (name: string): Category => {
  const categories = getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const newCategory: Category = {
    id: uuidv4(),
    name,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  categories.push(newCategory);
  setItem(STORAGE_KEYS.CATEGORIES, categories);
  return newCategory;
};

export const updateCategory = (id: string, name: string): boolean => {
  const categories = getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const updatedCategories = categories.map(category =>
    category.id === id
      ? { ...category, name, updatedAt: new Date() }
      : category
  );
  setItem(STORAGE_KEYS.CATEGORIES, updatedCategories);
  return true;
};

export const deleteCategory = (id: string): boolean => {
  const products = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const hasProducts = products.some(product => product.categoryId === id);
  
  if (hasProducts) {
    return false;
  }
  
  const categories = getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const filteredCategories = categories.filter(category => category.id !== id);
  setItem(STORAGE_KEYS.CATEGORIES, filteredCategories);
  return true;
};

// Sales Services
export const getSales = (): Sale[] => {
  return getItem<Sale[]>(STORAGE_KEYS.SALES, []);
};

export const addSale = (sale: Omit<Sale, 'id'>): Sale => {
  const sales = getItem<Sale[]>(STORAGE_KEYS.SALES, []);
  const newSale: Sale = {
    ...sale,
    id: uuidv4()
  };
  
  sales.push(newSale);
  setItem(STORAGE_KEYS.SALES, sales);
  return newSale;
};

// Register Services
export const getCurrentRegister = (): CashRegister | null => {
  return getItem<CashRegister | null>(STORAGE_KEYS.CURRENT_REGISTER, null);
};

export const openRegister = (initialAmount: number, cashierId: string): CashRegister => {
  const newRegister: CashRegister = {
    id: uuidv4(),
    openedAt: new Date(),
    closedAt: null,
    initialAmount,
    finalAmount: null,
    sales: [],
    cashierId
  };
  
  setItem(STORAGE_KEYS.CURRENT_REGISTER, newRegister);
  return newRegister;
};

export const updateRegisterSales = (registerId: string, sale: Sale): boolean => {
  const currentRegister = getItem<CashRegister | null>(STORAGE_KEYS.CURRENT_REGISTER, null);
  
  if (!currentRegister || currentRegister.id !== registerId) {
    return false;
  }
  
  const updatedRegister = {
    ...currentRegister,
    sales: [...currentRegister.sales, sale]
  };
  
  setItem(STORAGE_KEYS.CURRENT_REGISTER, updatedRegister);
  return true;
};

export const closeRegister = (registerId: string, finalAmount: number): boolean => {
  const currentRegister = getItem<CashRegister | null>(STORAGE_KEYS.CURRENT_REGISTER, null);
  
  if (!currentRegister || currentRegister.id !== registerId) {
    return false;
  }
  
  const closedRegister = {
    ...currentRegister,
    closedAt: new Date(),
    finalAmount
  };
  
  setItem(STORAGE_KEYS.CURRENT_REGISTER, null);
  return true;
};

// Register Closings Services
export const getRegisterClosings = (): RegisterClosing[] => {
  return getItem<RegisterClosing[]>(STORAGE_KEYS.REGISTER_CLOSINGS, []);
};

export const addRegisterClosing = (closing: Omit<RegisterClosing, 'id'>): RegisterClosing => {
  const closings = getItem<RegisterClosing[]>(STORAGE_KEYS.REGISTER_CLOSINGS, []);
  const newClosing: RegisterClosing = {
    ...closing,
    id: uuidv4()
  };
  
  closings.push(newClosing);
  setItem(STORAGE_KEYS.REGISTER_CLOSINGS, closings);
  return newClosing;
};
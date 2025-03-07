import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { 
  getProducts,
  getCategories,
  addProduct as addProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  addCategory as addCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
  initializeDemoData
} from '../firebase/services';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  loading: boolean;
  addProduct: (name: string, price: number, categoryId?: string) => Promise<void>;
  updateProduct: (id: string, name: string, price: number, categoryId?: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<boolean>;
  getProductsByCategory: (categoryId?: string) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize demo data if needed
        await initializeDemoData();
        
        // Load products and categories
        const productsData = await getProducts();
        const categoriesData = await getCategories();
        
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading product data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const addProduct = async (name: string, price: number, categoryId?: string) => {
    try {
      const newProduct = await addProductService(name, price, categoryId);
      if (newProduct) {
        setProducts([...products, newProduct]);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (id: string, name: string, price: number, categoryId?: string) => {
    try {
      const success = await updateProductService(id, name, price, categoryId);
      if (success) {
        setProducts(
          products.map(product => 
            product.id === id 
              ? { ...product, name, price, categoryId, updatedAt: new Date() } 
              : product
          )
        );
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const success = await deleteProductService(id);
      if (success) {
        setProducts(products.filter(product => product.id !== id));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const addCategory = async (name: string) => {
    try {
      const newCategory = await addCategoryService(name);
      if (newCategory) {
        setCategories([...categories, newCategory]);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const updateCategory = async (id: string, name: string) => {
    try {
      const success = await updateCategoryService(id, name);
      if (success) {
        setCategories(
          categories.map(category => 
            category.id === id 
              ? { ...category, name, updatedAt: new Date() } 
              : category
          )
        );
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteCategoryService(id);
      if (success) {
        setCategories(categories.filter(category => category.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  };

  const getProductsByCategory = (categoryId?: string): Product[] => {
    if (!categoryId) {
      return products.filter(product => !product.categoryId);
    }
    return products.filter(product => product.categoryId === categoryId);
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      categories,
      loading,
      addProduct, 
      updateProduct, 
      deleteProduct, 
      getProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      getProductsByCategory
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
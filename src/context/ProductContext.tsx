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
  products: Product[]; // Lista de productos disponibles
  categories: Category[]; // Lista de categorías disponibles
  loading: boolean; // Estado que indica si los datos están cargando
  addProduct: (name: string, price: number, categoryId?: string) => Promise<void>; // Función para agregar un producto
  updateProduct: (id: string, name: string, price: number, categoryId?: string) => Promise<void>; // Función para actualizar un producto existente
  deleteProduct: (id: string) => Promise<void>; // Función para eliminar un producto
  getProduct: (id: string) => Product | undefined; // Función para obtener un producto por su ID
  addCategory: (name: string) => Promise<void>; // Función para agregar una categoría
  updateCategory: (id: string, name: string) => Promise<void>; // Función para actualizar una categoría
  deleteCategory: (id: string) => Promise<boolean>; // Función para eliminar una categoría
  getProductsByCategory: (categoryId?: string) => Product[]; // Función para obtener productos por categoría
}

// Creación del contexto para manejar productos y categorías
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Componente proveedor que envuelve la aplicación y proporciona el contexto de productos
export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]); // Estado para la lista de productos
  const [categories, setCategories] = useState<Category[]>([]); // Estado para la lista de categorías
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    // Función para cargar los datos iniciales (productos y categorías) desde la base de datos
    const loadData = async () => {
      try {
        // Inicializa los datos demo si es necesario
        await initializeDemoData();
        
        // Carga los productos y las categorías
        const productsData = await getProducts();
        const categoriesData = await getCategories();
        
        setProducts(productsData); // Establece los productos en el estado
        setCategories(categoriesData); // Establece las categorías en el estado
      } catch (error) {
        console.error('Error loading product data:', error); // Manejo de errores al cargar los datos
      } finally {
        setLoading(false); // Marca que los datos ya se han cargado
      }
    };
    
    loadData(); // Llama a la función para cargar los datos
  }, []); // Solo se ejecuta una vez al montar el componente

  // Función para agregar un producto a la base de datos
  const addProduct = async (name: string, price: number, categoryId?: string) => {
    try {
      // Verifica si ya existe un producto con el mismo nombre
      const normalizedNewName = name.trim().toLowerCase();
      const existingProduct = products.find(
        p => p.name.trim().toLowerCase() === normalizedNewName
      );
      
      if (existingProduct) {
        throw new Error('Ya existe un producto con este nombre'); // Error si el producto ya existe
      }
      
      const newProduct = await addProductService(name, price, categoryId); // Llama al servicio para agregar el producto
      if (newProduct) {
        setProducts([...products, newProduct]); // Agrega el nuevo producto al estado
      }
    } catch (error) {
      throw error; // Lanza el error si ocurre algún problema
    }
  };

  // Función para actualizar un producto en la base de datos
  const updateProduct = async (id: string, name: string, price: number, categoryId?: string) => {
    try {
      // Verifica si ya existe otro producto con el mismo nombre (excluyendo el producto actual)
      const normalizedNewName = name.trim().toLowerCase();
      const existingProduct = products.find(
        p => p.id !== id && p.name.trim().toLowerCase() === normalizedNewName
      );
      
      if (existingProduct) {
        throw new Error('Ya existe un producto con este nombre'); // Error si el producto ya existe
      }
      
      const success = await updateProductService(id, name, price, categoryId); // Llama al servicio para actualizar el producto
      if (success) {
        // Actualiza el producto en el estado si la actualización fue exitosa
        setProducts(
          products.map(product => 
            product.id === id 
              ? { ...product, name, price, categoryId, updatedAt: new Date() } 
              : product
          )
        );
      }
    } catch (error) {
      throw error; // Lanza el error si ocurre algún problema
    }
  };

  // Función para eliminar un producto de la base de datos
  const deleteProduct = async (id: string) => {
    try {
      const success = await deleteProductService(id); // Llama al servicio para eliminar el producto
      if (success) {
        // Filtra el producto eliminado del estado
        setProducts(products.filter(product => product.id !== id));
      }
    } catch (error) {
      console.error('Error deleting product:', error); // Manejo de errores al eliminar el producto
    }
  };

  // Función para obtener un producto por su ID
  const getProduct = (id: string) => {
    return products.find(product => product.id === id); // Busca el producto con el ID dado
  };

  // Función para agregar una categoría a la base de datos
  const addCategory = async (name: string) => {
    try {
      const newCategory = await addCategoryService(name); // Llama al servicio para agregar la categoría
      if (newCategory) {
        setCategories([...categories, newCategory]); // Agrega la nueva categoría al estado
      }
    } catch (error) {
      console.error('Error adding category:', error); // Manejo de errores al agregar la categoría
    }
  };

  // Función para actualizar una categoría en la base de datos
  const updateCategory = async (id: string, name: string) => {
    try {
      const success = await updateCategoryService(id, name); // Llama al servicio para actualizar la categoría
      if (success) {
        // Actualiza la categoría en el estado si la actualización fue exitosa
        setCategories(
          categories.map(category => 
            category.id === id 
              ? { ...category, name, updatedAt: new Date() } 
              : category
          )
        );
      }
    } catch (error) {
      console.error('Error updating category:', error); // Manejo de errores al actualizar la categoría
    }
  };

  // Función para eliminar una categoría de la base de datos
  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteCategoryService(id); // Llama al servicio para eliminar la categoría
      if (success) {
        // Filtra la categoría eliminada del estado
        setCategories(categories.filter(category => category.id !== id));
        return true; // Devuelve true si la eliminación fue exitosa
      }
      return false; // Devuelve false si no se pudo eliminar la categoría
    } catch (error) {
      console.error('Error deleting category:', error); // Manejo de errores al eliminar la categoría
      return false; // Devuelve false si ocurrió un error
    }
  };

  // Función para obtener productos por categoría
  const getProductsByCategory = (categoryId?: string): Product[] => {
    if (!categoryId) {
      return products.filter(product => !product.categoryId); // Devuelve productos sin categoría si no se proporciona un ID
    }
    return products.filter(product => product.categoryId === categoryId); // Devuelve los productos que coinciden con la categoría proporcionada
  };

  return (
    // Proveedor del contexto que envuelve los hijos y proporciona los datos y funciones de productos y categorías
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
      {children} {/* Los hijos del proveedor recibirán el contexto */}
    </ProductContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de productos
export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext); // Obtiene el contexto de productos

  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider'); // Error si el hook se usa fuera del proveedor
  }

  return context; // Devuelve el contexto con los valores y funciones disponibles
};

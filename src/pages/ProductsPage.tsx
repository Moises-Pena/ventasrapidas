import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';
import CategoryList from '../components/CategoryList';
import CategoryForm from '../components/CategoryForm';
import { Product, Category } from '../types';
import { Plus, Tag, Package } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductsPage: React.FC = () => {
  const { 
    products, 
    categories,
    loading,
    addProduct, 
    updateProduct, 
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory
  } = useProducts();
  
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState({
    name: '',
    categoryId: ''
  });

  const filteredProducts = products.filter(product => {
    const matchesName = product.name.toLowerCase().includes(searchParams.name.toLowerCase());
    const matchesCategory = !searchParams.categoryId || product.categoryId === searchParams.categoryId;
    return matchesName && matchesCategory;
  });

  // Product handlers
  const handleAddProduct = async (name: string, price: number, categoryId?: string) => {
    try {
      await addProduct(name, price, categoryId);
      setShowProductForm(false);
      setFormError(undefined);
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Error al agregar el producto');
      }
    }
  };

  const handleUpdateProduct = async (name: string, price: number, categoryId?: string) => {
    if (editingProduct) {
      try {
        await updateProduct(editingProduct.id, name, price, categoryId);
        setEditingProduct(undefined);
        setShowProductForm(false);
      } catch (error) {
        throw error;
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      await deleteProduct(id);
    }
  };

  const handleCancelProductForm = () => {
    setEditingProduct(undefined);
    setShowProductForm(false);
  };

  // Category handlers
  const handleAddCategory = async (name: string) => {
    await addCategory(name);
    setShowCategoryForm(false);
  };

  const handleUpdateCategory = async (name: string) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, name);
      setEditingCategory(undefined);
      setShowCategoryForm(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      const success = await deleteCategory(id);
      if (!success) {
        alert('No se puede eliminar la categoría porque hay productos asociados a ella.');
      }
    }
  };

  const handleCancelCategoryForm = () => {
    setEditingCategory(undefined);
    setShowCategoryForm(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-medium text-gray-900">Gestión de Productos y Categorías</h1>
            {activeTab === 'products' && !showProductForm && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchParams.name}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={searchParams.categoryId}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={showProductForm}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo Producto
                </button>
              </div>
            )}
            {activeTab === 'products' ? (
              !showProductForm && null
            ) : (
              <button
                onClick={() => setShowCategoryForm(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={showCategoryForm}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nueva Categoría
              </button>
            )}
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Package className="h-4 w-4 mr-2" />
                Productos
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Tag className="h-4 w-4 mr-2" />
                Categorías
              </button>
            </nav>
          </div>
        </div>
        
        {activeTab === 'products' ? (
          showProductForm ? (
            <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
              <ProductForm
                onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                product={editingProduct}
                categories={categories}
                onCancel={handleCancelProductForm}
                error={formError}
              />
            </div>
          ) : (
            <ProductList
              products={filteredProducts}
              categories={categories}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          )
        ) : (
          showCategoryForm ? (
            <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
              <CategoryForm
                onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
                category={editingCategory}
                onCancel={handleCancelCategoryForm}
              />
            </div>
          ) : (
            <CategoryList
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
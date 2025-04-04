import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useSales } from '../context/SalesContext';
import { CartItem, Product, Sale } from '../types';
import Cart from '../components/Cart';
import PaymentForm from '../components/PaymentForm';
import Receipt from '../components/Receipt';
import RegisterControl from '../components/RegisterControl';
import LoadingSpinner from '../components/LoadingSpinner';
import { DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SalesPage: React.FC = () => {
  const { products, categories, loading: productsLoading } = useProducts();
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartItemQuantity, 
    completeSale,
    currentRegister,
    loading: salesLoading
  } = useSales();
  
  const [showPayment, setShowPayment] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showRegisterControl, setShowRegisterControl] = useState(false);
  const navigate = useNavigate();

  const loading = productsLoading || salesLoading;

  // Set showRegisterControl based on currentRegister when loading is complete
  useEffect(() => {
    if (!loading) {
      setShowRegisterControl(!currentRegister);
    }
  }, [loading, currentRegister]);

  const handleAddToCart = (product: Product) => {
    addToCart({ product, quantity: 1 });
  };

  const handleCompleteSale = async (amountPaid: number, customerName: string) => {
    const sale = await completeSale(amountPaid, customerName);
    if (sale) {
      setCompletedSale(sale);
      setShowPayment(false);
    }
  };

  const handleCloseReceipt = () => {
    setCompletedSale(null);
  };

  const handleRegisterComplete = () => {
    setShowRegisterControl(false);
  };

  const handleCloseRegister = () => {
    setShowRegisterControl(true);
  };

  // Get product background color based on category
  const getProductBackgroundColor = (categoryId?: string): string => {
    if (!categoryId) return "bg-white";
    
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return "bg-white";
    
    switch (category.name) {
      case "Platos":
        return "bg-orange-100 bg-opacity-85";
      case "Comidas":
        return "bg-orange-100 bg-opacity-85";
      case "Bebidas":
        return "bg-blue-100 bg-opacity-85";
      case "Extras":
        return "bg-green-100 bg-opacity-85";
      case "Postres":
        return "bg-purple-100 bg-opacity-85";
      default:
        return "bg-white";
    }
  };

  // Group products by category
  const getProductsByCategory = () => {
    // First, get products without category
    const uncategorizedProducts = products.filter(product => !product.categoryId);
    
    // Then, get products for each category
    let categorizedProducts = categories.map(category => {
      return {
        category,
        products: products.filter(product => product.categoryId === category.id)
      };
    });
    
    // Sort categories to ensure "Platos" comes first, then "Comidas", then "Bebidas"
    categorizedProducts = categorizedProducts.sort((a, b) => {
      if (a.category.name === "Platos") return -1;
      if (b.category.name === "Platos") return 1;
      if (a.category.name === "Comidas") return -1;
      if (b.category.name === "Comidas") return 1;
      if (a.category.name === "Bebidas" && b.category.name !== "Comidas") return -1;
      if (b.category.name === "Bebidas" && a.category.name !== "Comidas") return 1;
      return a.category.name.localeCompare(b.category.name);
    });
    
    return {
      uncategorized: uncategorizedProducts,
      categorized: categorizedProducts
    };
  };

  const groupedProducts = getProductsByCategory();

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (showRegisterControl) {
    return <RegisterControl onComplete={handleRegisterComplete} />;
  }

  return (
    <div className="container mx-auto">
      {currentRegister && (
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">Caja abierta</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              Monto inicial: ${currentRegister.initialAmount.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleCloseRegister}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Cerrar Caja
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Productos</h2>
            
            <div className="space-y-8">
              {/* Categorized Products */}
              {groupedProducts.categorized.map(({ category, products }) => (
                products.length > 0 && (
                  <div key={category.id} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-gray-700 mb-3">{category.name}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {products.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleAddToCart(product)}
                          className={`${getProductBackgroundColor(product.categoryId)} border border-gray-200 rounded-lg p-3 text-center hover:bg-opacity-100 hover:border-blue-200 transition-colors h-auto min-h-[80px] flex flex-col justify-between`}
                        >
                          <p className="font-medium text-gray-900 mb-1 text-sm break-words">{product.name}</p>
                          <p className="text-blue-600">${product.price.toFixed(2)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ))}
              
              {/* Uncategorized Products */}
              {groupedProducts.uncategorized.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Sin categoría</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {groupedProducts.uncategorized.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleAddToCart(product)}
                        className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:bg-blue-50 hover:border-blue-200 transition-colors h-auto min-h-[80px] flex flex-col justify-between"
                      >
                        <p className="font-medium text-gray-900 mb-1 text-sm break-words">{product.name}</p>
                        <p className="text-blue-600">${product.price.toFixed(2)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {products.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay productos registrados
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="md:col-span-1">
          <Cart
            items={cart}
            onUpdateQuantity={updateCartItemQuantity}
            onRemove={removeFromCart}
          />
          
          {cart.length > 0 && (
            <button
              onClick={() => setShowPayment(true)}
              className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Proceder al Pago
            </button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            <PaymentForm
              cartItems={cart}
              onComplete={handleCompleteSale}
              onCancel={() => setShowPayment(false)}
            />
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {completedSale && (
        <Receipt sale={completedSale} onClose={handleCloseReceipt} />
      )}
    </div>
  );
};

export default SalesPage;
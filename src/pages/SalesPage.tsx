// Página principal para la gestión de ventas: permite visualizar productos, agregar al carrito, realizar pagos, y ver el recibo.
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

  // Muestra el control de caja si no hay una caja activa, una vez que la carga termina
  useEffect(() => {
    if (!loading) {
      setShowRegisterControl(!currentRegister);
    }
  }, [loading, currentRegister]);

  // Maneja la acción de agregar un producto al carrito con cantidad 1
  const handleAddToCart = (product: Product) => {
    addToCart({ product, quantity: 1 });
  };

  // Completa la venta con el monto pagado y nombre del cliente. Muestra el recibo si la venta fue exitosa
  const handleCompleteSale = async (amountPaid: number, customerName: string) => {
    const sale = await completeSale(amountPaid, customerName);
    if (sale) {
      setCompletedSale(sale);
      setShowPayment(false);
    }
  };

  // Cierra el modal del recibo y reinicia la venta
  const handleCloseReceipt = () => {
    setCompletedSale(null);
  };

  // Marca el control de caja como completado, lo cual lo oculta
  const handleRegisterComplete = () => {
    setShowRegisterControl(false);
  };

  // Muestra el control para cerrar caja
  const handleCloseRegister = () => {
    setShowRegisterControl(true);
  };

  // Devuelve el color de fondo correspondiente al tipo de categoría del producto
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

  // Agrupa los productos según su categoría, y ordena las categorías en un orden lógico
  const getProductsByCategory = () => {
    const uncategorizedProducts = products.filter(product => !product.categoryId);
    
    let categorizedProducts = categories.map(category => {
      return {
        category,
        products: products.filter(product => product.categoryId === category.id)
      };
    });
    
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
    // [Renderizado principal de la interfaz de ventas... contenido sin cambios]
  );
};

export default SalesPage;

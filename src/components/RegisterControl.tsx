import React, { useState } from 'react';
import { useSales } from '../context/SalesContext';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';
import { useNavigate } from 'react-router-dom';

interface RegisterControlProps {
  onComplete: () => void;
}

// Componente principal para manejar la apertura y cierre de caja
const RegisterControl: React.FC<RegisterControlProps> = ({ onComplete }) => {
  const { currentRegister, openRegister, closeRegister, getTotalSales, loading } = useSales();
  const [amount, setAmount] = useState(''); // Estado para el monto ingresado
  const [error, setError] = useState(''); // Estado para mostrar mensajes de error
  const [isProcessing, setIsProcessing] = useState(false); // Estado que indica si el proceso está en ejecución
  const [showSummary, setShowSummary] = useState(false); // Estado para mostrar el resumen del cierre
  const [closingDetails, setClosingDetails] = useState<{
    initialAmount: number;
    salesTotal: number;
    expectedAmount: number;
    finalAmount: number;
    difference: number;
    timestamp: Date;
  } | null>(null); // Estado con los detalles del cierre de caja
  const [showConfirmation, setShowConfirmation] = useState(false); // Estado para mostrar la confirmación de cierre
  const navigate = useNavigate();

  // Maneja el submit del formulario de apertura o cierre de caja
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    setIsProcessing(true);
    try {
      if (!currentRegister) {
        // Si no hay un registro abierto, abre la caja con el monto proporcionado
        await openRegister(numAmount);
        onComplete();
      } else {
        // Si ya hay un registro abierto, procede a cerrar la caja
        const salesTotal = getTotalSales();
        const expectedAmount = currentRegister.initialAmount + salesTotal;
        const difference = numAmount - expectedAmount;
        
        // Establece los detalles del cierre
        setClosingDetails({
          initialAmount: currentRegister.initialAmount,
          salesTotal,
          expectedAmount,
          finalAmount: numAmount,
          difference,
          timestamp: new Date()
        });
        
        setShowConfirmation(true);
      }
      
      setAmount(''); // Reinicia el monto
      setError(''); // Reinicia los errores
    } catch (error) {
      console.error('Error processing register operation:', error);
      setError('Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false); // Finaliza el proceso
    }
  };

  // Maneja la confirmación para cerrar la caja
  const handleConfirmClose = async () => {
    if (closingDetails) {
      setIsProcessing(true);
      try {
        await closeRegister(closingDetails.finalAmount); // Cierra la caja con el monto final
        setShowConfirmation(false); // Oculta la confirmación
        setShowSummary(true); // Muestra el resumen
      } catch (error) {
        console.error('Error closing register:', error);
        setError('Ocurrió un error al cerrar la caja');
      } finally {
        setIsProcessing(false); // Finaliza el proceso
      }
    }
  };

  // Cancela el proceso de cierre de caja
  const handleCancelClose = () => {
    setShowConfirmation(false); // Oculta la confirmación
    setClosingDetails(null); // Reinicia los detalles del cierre
  };

  // Finaliza el proceso de cierre de caja y redirige al login
  const handleFinishClosing = () => {
    setShowSummary(false); // Oculta el resumen
    navigate('/login'); // Redirige al login
  };

  // Regresa al proceso de ventas
  const handleGoBack = () => {
    onComplete();
  };

  // Si el sistema está cargando, muestra un spinner de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Si se está mostrando la confirmación de cierre de caja
  if (showConfirmation && closingDetails) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Confirmar Cierre de Caja</h2>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Monto inicial:</span>
              <span className="font-medium">${closingDetails.initialAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Total ventas:</span>
              <span className="font-medium">${closingDetails.salesTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-gray-700">Monto esperado:</span>
              <span>${closingDetails.expectedAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-gray-700">Monto final:</span>
              <span>${closingDetails.finalAmount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
              <span>Diferencia:</span>
              <span className={closingDetails.difference === 0 
                ? 'text-green-600' 
                : closingDetails.difference > 0 
                  ? 'text-blue-600' 
                  : 'text-red-600'
              }>
                ${closingDetails.difference.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancelClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmClose}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? <LoadingSpinner size="small" color="text-white" /> : 'Confirmar Cierre'}
          </button>
        </div>
      </div>
    );
  }

  // Si se muestra el resumen del cierre de caja
  if (showSummary && closingDetails) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Resumen de Cierre de Caja</h2>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-500 mb-1">Fecha y hora: {format(closingDetails.timestamp, 'dd/MM/yyyy HH:mm:ss')}</p>
          
          <div className="mt-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Monto inicial:</span>
              <span className="font-medium">${closingDetails.initialAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Total ventas:</span>
              <span className="font-medium">${closingDetails.salesTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-gray-700">Monto esperado:</span>
              <span>${closingDetails.expectedAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-gray-700">Monto final:</span>
              <span>${closingDetails.finalAmount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
              <span>Diferencia:</span>
              <span className={closingDetails.difference === 0 
                ? 'text-green-600' 
                : closingDetails.difference > 0 
                  ? 'text-blue-600' 
                  : 'text-red-600'
              }>
                ${closingDetails.difference.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleFinishClosing}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Aceptar
        </button>
      </div>
    );
  }

  // Si no hay un registro de caja, permite abrir o cerrar la caja esto en caso de clickear el boton de cerrar caja por error.
  return (
    <div>
      {currentRegister && (
        <div className="mb-4">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            ← Volver a ventas
          </button>
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">
          {!currentRegister ? 'Abrir Caja' : 'Cerrar Caja'}
        </h2>
      
        {currentRegister && (
          <div className="mb-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-gray-600">Monto inicial: ${currentRegister.initialAmount.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Ventas del día: ${getTotalSales().toFixed(2)}</p>
            <p className="font-medium text-gray-800">Total esperado en caja: ${(currentRegister.initialAmount + getTotalSales()).toFixed(2)}</p>
          </div>
        )}
      
        <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            {!currentRegister ? 'Monto inicial en caja:' : 'Monto final en caja:'}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="amount"
              id="amount"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isProcessing}
            />
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !currentRegister ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            !currentRegister ? 'focus:ring-blue-500' : 'focus:ring-green-500'
          } ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <LoadingSpinner size="small" color="text-white" />
          ) : (
            !currentRegister ? 'Abrir Caja' : 'Cerrar Caja'
          )}
        </button>
      </form>
    </div>
    </div>
  );
};

export default RegisterControl;

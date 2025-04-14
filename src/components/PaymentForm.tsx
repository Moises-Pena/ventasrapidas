import React, { useState } from 'react';
import { CartItem } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface PaymentFormProps {
  cartItems: CartItem[];
  onComplete: (amountPaid: number, customerName: string) => void;
  onCancel: () => void;
}

// Componente que gestiona el formulario de pago, incluyendo validación, cálculo de cambio y envío del formulario.
const PaymentForm: React.FC<PaymentFormProps> = ({ cartItems, onComplete, onCancel }) => {
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const [amountPaid, setAmountPaid] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [errors, setErrors] = useState({ amountPaid: '', customerName: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Valida el formulario antes de enviar: asegura que se haya ingresado un monto válido y suficiente.
  const validate = (): boolean => {
    const newErrors = { amountPaid: '', customerName: '' };
    let isValid = true;

    const amount = parseFloat(amountPaid);
    if (!amountPaid.trim()) {
      newErrors.amountPaid = 'El monto recibido es obligatorio';
      isValid = false;
    } else if (isNaN(amount)) {
      newErrors.amountPaid = 'Por favor ingresa un monto válido';
      isValid = false;
    } else if (amount < total) {
      newErrors.amountPaid = 'El monto pagado debe ser mayor o igual al total';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Maneja el envío del formulario. Valida la entrada, y si es válida, llama a onComplete.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      setIsProcessing(true);
      try {
        onComplete(parseFloat(amountPaid), customerName);
      } catch (error) {
        console.error('Error completing payment:', error);
        setIsProcessing(false);
      }
    }
  };

  const change = parseFloat(amountPaid) - total;
  const isValidAmount = !isNaN(parseFloat(amountPaid)) && parseFloat(amountPaid) >= total;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Completar Pago</h2>

      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Subtotal:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-medium text-gray-900">
          <span>Total a pagar:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Cliente
          </label>
          <input
            type="text"
            name="customerName"
            id="customerName"
            className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
              errors.customerName ? 'border-red-300 ring-red-500' : ''
            }`}
            placeholder="Ingrese el nombre del cliente"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              if (errors.customerName) {
                setErrors({ ...errors, customerName: '' });
              }
            }}
            disabled={isProcessing}
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-1">
            Monto recibido <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="amountPaid"
              id="amountPaid"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${
                errors.amountPaid ? 'border-red-300 ring-red-500' : ''
              }`}
              placeholder="0.00"
              step="0.01"
              min={total}
              value={amountPaid}
              onChange={(e) => {
                setAmountPaid(e.target.value);
                if (errors.amountPaid) {
                  setErrors({ ...errors, amountPaid: '' });
                }
              }}
              required
              disabled={isProcessing}
            />
          </div>
          {errors.amountPaid && (
            <p className="mt-1 text-sm text-red-600">{errors.amountPaid}</p>
          )}
        </div>

        {isValidAmount && (
          <div className="mb-4 p-3 bg-green-50 rounded-md">
            <div className="flex justify-between font-medium text-green-800">
              <span>Cambio a devolver:</span>
              <span>${change.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isProcessing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isProcessing ? (
              <LoadingSpinner size="small" color="text-white" />
            ) : (
              'Completar Venta'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;

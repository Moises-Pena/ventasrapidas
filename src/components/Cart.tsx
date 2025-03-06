import React from 'react';
import { CartItem } from '../types';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onRemove }) => {
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Carrito de Compra</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {items.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No hay productos en el carrito
          </div>
        ) : (
          items.map((item) => (
            <div key={item.product.id} className="px-4 py-3 flex justify-between items-center">
              <div className="flex-1 pr-2">
                <h4 className="text-sm font-medium text-gray-900 break-words">{item.product.name}</h4>
                <p className="text-sm text-gray-500">${item.product.price.toFixed(2)} x {item.quantity}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-gray-700 w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onRemove(item.product.id)}
                  className="p-1 rounded-full text-red-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <p>Total</p>
          <p>${total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
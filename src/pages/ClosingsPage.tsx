import React, { useState } from 'react';
import { useSales } from '../context/SalesContext'; 
import { format } from 'date-fns'; 
import { RegisterClosing } from '../types'; 
import { ChevronDown, ChevronUp, Pencil, Save, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ClosingsPage: React.FC = () => {
  const { sales, registerClosings, loading, updateRegisterClosingAmount, getSales } = useSales();
  const [pageSize, setPageSize] = useState(10);
  const [expandedClosing, setExpandedClosing] = useState<string | null>(null);
  const [editingClosing, setEditingClosing] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await getSales();
    } finally {
      setRefreshing(false);
    }
  };

  // Get sales for a specific register closing
  const getSalesForClosing = (closing: RegisterClosing): any[] => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      const openDate = new Date(closing.openedAt);
      const closeDate = new Date(closing.closedAt);
      
      return saleDate >= openDate && saleDate <= closeDate;
    });
  };

  const toggleClosingDetails = (closingId: string) => {
    if (expandedClosing === closingId) {
      setExpandedClosing(null);
    } else {
      setExpandedClosing(closingId);
    }
  };

  const handleEditAmount = (closing: RegisterClosing) => {
    setEditingClosing(closing.id);
    setNewAmount(closing.finalAmount.toString());
  };

  const handleSaveAmount = (closingId: string) => {
    const amount = parseFloat(newAmount);
    if (!isNaN(amount) && amount >= 0) {
      updateRegisterClosingAmount(closingId, amount);
      setEditingClosing(null);
      setNewAmount('');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end items-center mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <option value={10}>10 cierres</option>
            <option value={25}>25 cierres</option>
            <option value={50}>50 cierres</option>
            <option value={100}>100 cierres</option>
          </select>
        </div>
      </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inicial
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ventas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diferencia
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalles
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registerClosings.slice().reverse().slice(0, pageSize).map((closing) => {
                  const closingSales = getSalesForClosing(closing);
                  return (
                    <React.Fragment key={closing.id}>
                      <tr className={expandedClosing === closing.id ? "bg-blue-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(closing.closedAt), 'dd/MM/yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${closing.initialAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[120px]">
                          ${closing.totalSales.toFixed(2)} ({closing.salesCount})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingClosing === closing.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm"
                                step="0.01"
                                min="0"
                              />
                              <button
                                onClick={() => handleSaveAmount(closing.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            `$${closing.finalAmount.toFixed(2)}`
                          )}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          closing.difference === 0 
                            ? 'text-green-600' 
                            : closing.difference > 0 
                              ? 'text-blue-600' 
                              : 'text-red-600'
                        }`}>
                          ${closing.difference.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button 
                            onClick={() => toggleClosingDetails(closing.id)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            {expandedClosing === closing.id ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Ver
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditAmount(closing)}
                              className="text-blue-600 hover:text-blue-800"
                              disabled={editingClosing === closing.id}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedClosing === closing.id && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                              <h3 className="text-sm font-medium text-gray-900 mb-2">
                                Detalle de Ventas
                              </h3>
                              <div className="text-xs text-gray-500 mb-2">
                                <p>Apertura: {format(new Date(closing.openedAt), 'dd/MM/yyyy HH:mm')}</p>
                                <p>Cierre: {format(new Date(closing.closedAt), 'dd/MM/yyyy HH:mm')}</p>
                              </div>
                              
                              {closingSales.length > 0 ? (
                                <div className="mt-3 overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Hora
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          ID
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Cliente
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Productos
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Total
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {closingSales.map((sale) => (
                                        <tr key={sale.id}>
                                          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                            {format(new Date(sale.timestamp), 'HH:mm:ss')}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                            {sale.id.substring(0, 8)}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                            {sale.customerName || '-'}
                                          </td>
                                          <td className="px-4 py-2 text-xs text-gray-500">
                                            <ul className="list-disc list-inside">
                                              {sale.items.map((item, idx) => (
                                                <li key={idx}>
                                                  {item.quantity}x {item.product.name} (${item.product.price.toFixed(2)})
                                                </li>
                                              ))}
                                            </ul>
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                                            ${sale.total.toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                      <tr>
                                        <td colSpan={4} className="px-4 py-2 text-xs font-medium text-gray-700 text-right">
                                          Total de ventas:
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                                          ${closing.totalSales.toFixed(2)}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No se registraron ventas durante este período.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {registerClosings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay cierres de caja registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {registerClosings.length > pageSize && (
              <div className="mt-4 text-sm text-gray-500 text-center">
                Mostrando {Math.min(pageSize, registerClosings.length)} de {registerClosings.length} cierres
              </div>
            )}
          </div>
    </div>
  );
};

export default ClosingsPage;
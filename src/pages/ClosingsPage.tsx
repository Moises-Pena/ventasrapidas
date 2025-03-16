import React, { useState } from 'react';
import { useSales } from '../context/SalesContext';
import { format } from 'date-fns';
import { RegisterClosing } from '../types';
import { ChevronDown, ChevronUp, Pencil, Trash2, Save, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ClosingsPage: React.FC = () => {
  const { sales, registerClosings, loading, deleteRegisterClosing, updateRegisterClosingAmount, getSales } = useSales();
  const [expandedClosing, setExpandedClosing] = useState<string | null>(null);
  const [selectedClosings, setSelectedClosings] = useState<string[]>([]);
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

  const handleDeleteSelected = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar los reportes seleccionados?')) {
      selectedClosings.forEach(id => deleteRegisterClosing(id));
      setSelectedClosings([]);
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

  const toggleClosingSelection = (closingId: string) => {
    setSelectedClosings(prev => 
      prev.includes(closingId) 
        ? prev.filter(id => id !== closingId)
        : [...prev, closingId]
    );
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
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-medium text-gray-900">Cierres de Caja</h1>
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
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClosings(registerClosings.map(c => c.id));
                        } else {
                          setSelectedClosings([]);
                        }
                      }}
                      checked={selectedClosings.length === registerClosings.length && registerClosings.length > 0}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
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
              {selectedClosings.length > 0 && (
                <thead className="bg-gray-100">
                  <tr>
                    <td colSpan={8} className="px-6 py-3">
                      <button
                        onClick={handleDeleteSelected}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Eliminar seleccionados ({selectedClosings.length})
                      </button>
                    </td>
                  </tr>
                </thead>
              )}
              <tbody className="bg-white divide-y divide-gray-200">
                {registerClosings.slice().reverse().map((closing) => {
                  const closingSales = getSalesForClosing(closing);
                  return (
                    <React.Fragment key={closing.id}>
                      <tr className={expandedClosing === closing.id ? "bg-blue-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedClosings.includes(closing.id)}
                            onChange={() => toggleClosingSelection(closing.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
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
                            <button
                              onClick={() => {
                                if (window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
                                  deleteRegisterClosing(closing.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosingsPage;
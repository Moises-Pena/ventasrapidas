import React, { useState } from 'react';
import { useSales } from '../context/SalesContext';
import { format } from 'date-fns';
import { RegisterClosing } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ReportsPage: React.FC = () => {
  const { sales, registerClosings, loading } = useSales();
  const [expandedClosing, setExpandedClosing] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-lg font-medium text-gray-900">Historial de Cierres de Caja</h1>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registerClosings.slice().reverse().map((closing) => {
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${closing.totalSales.toFixed(2)} ({closing.salesCount})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${closing.finalAmount.toFixed(2)}
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
                      </tr>
                      {expandedClosing === closing.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4">
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
                                          <td className="px-4 py-2 text-xs text-gray-500">
                                            <ul className="list-disc list-inside">
                                              {sale.items.map((item: any, idx: number) => (
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
                                        <td colSpan={2} className="px-4 py-2 text-xs font-medium text-gray-700 text-right">
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
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
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

export default ReportsPage;
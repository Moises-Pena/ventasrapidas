import React, { useState } from 'react';
import { useSales } from '../context/SalesContext';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import { Receipt, Printer } from 'lucide-react';

const ReceiptsPage: React.FC = () => {
  const { sales, loading } = useSales();
  const [searchParams, setSearchParams] = useState({
    customerName: '',
    receiptId: '',
    date: ''
  });
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([]);

  const filteredSales = sales.filter(sale => {
    const matchesName = sale.customerName.toLowerCase().includes(searchParams.customerName.toLowerCase());
    const searchId = searchParams.receiptId.toLowerCase();
    const saleId = sale.id.toLowerCase();
    const matchesId = saleId.includes(searchId);
    const matchesDate = !searchParams.date || isWithinInterval(
      new Date(sale.timestamp),
      {
        start: startOfDay(parseISO(searchParams.date)),
        end: endOfDay(parseISO(searchParams.date))
      }
    );
    
    return matchesName && matchesId && matchesDate;
  });

  const handlePrintSelected = () => {
    // TODO: Implement printing functionality for selected receipts
    console.log('Print selected receipts:', selectedReceipts);
  };

  const toggleReceiptSelection = (saleId: string) => {
    setSelectedReceipts(prev => 
      prev.includes(saleId) 
        ? prev.filter(id => id !== saleId)
        : [...prev, saleId]
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
            <h1 className="text-lg font-medium text-gray-900 flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-blue-500" />
              Búsqueda de Facturas
            </h1>
            {selectedReceipts.length > 0 && (
              <button
                onClick={handlePrintSelected}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Printer className="h-4 w-4 mr-1.5" />
                Reimprimir ({selectedReceipts.length})
              </button>
            )}
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                Nombre en la Factura
              </label>
              <input
                type="text"
                id="customerName"
                value={searchParams.customerName}
                onChange={(e) => setSearchParams(prev => ({ ...prev, customerName: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Nombre del cliente"
              />
            </div>
            <div>
              <label htmlFor="receiptId" className="block text-sm font-medium text-gray-700">
                ID de Factura
              </label>
              <input
                type="text"
                id="receiptId"
                value={searchParams.receiptId}
                onChange={(e) => setSearchParams(prev => ({ ...prev, receiptId: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="ID de la factura"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Fecha
              </label>
              <input
                type="date"
                id="date"
                value={searchParams.date}
                onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReceipts(filteredSales.map(sale => sale.id));
                        } else {
                          setSelectedReceipts([]);
                        }
                      }}
                      checked={selectedReceipts.length === filteredSales.length && filteredSales.length > 0}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron facturas
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedReceipts.includes(sale.id)}
                          onChange={() => toggleReceiptSelection(sale.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(sale.timestamp), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.customerName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <ul className="list-disc list-inside">
                          {sale.items.map((item, idx) => (
                            <li key={idx}>
                              {item.quantity}x {item.product.name}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${sale.total.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptsPage;
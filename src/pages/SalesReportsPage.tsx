import React, { useState } from 'react';
import { useSales } from '../context/SalesContext';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import LoadingSpinner from '../components/LoadingSpinner';

const SalesReportsPage: React.FC = () => {
  const { sales, loading, getSales } = useSales();
  const [refreshing, setRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState({ startDate: '', endDate: '' });
  const [selectedSales, setSelectedSales] = useState<string[]>([]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await getSales();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredSalesByDateRange = sales.slice().reverse().filter(sale => {
    if (!searchParams.startDate && !searchParams.endDate) {
      return true;
    }
    
    const saleDate = new Date(sale.timestamp);
    return isWithinInterval(saleDate, {
      start: searchParams.startDate ? startOfDay(parseISO(searchParams.startDate)) : startOfDay(new Date(0)),
      end: searchParams.endDate ? endOfDay(parseISO(searchParams.endDate)) : endOfDay(new Date())
    });
  });

  const displayedSales = filteredSalesByDateRange.slice(0, pageSize);

  const generatePDF = (salesToInclude: Sale[]) => {
    const doc = new jsPDF();
    
    const totalAmount = salesToInclude.reduce((sum, sale) => sum + sale.total, 0);
    const title = 'Reporte de Ventas';
    const period = searchParams.startDate && searchParams.endDate
      ? `Período: ${format(parseISO(searchParams.startDate), 'dd/MM/yyyy')} - ${format(parseISO(searchParams.endDate), 'dd/MM/yyyy')}`
      : 'Período: Todas las ventas';
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    // Add period
    doc.setFontSize(12);
    doc.text(period, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
    
    // Prepare table data
    const tableData = salesToInclude.map(sale => [
      format(new Date(sale.timestamp), 'dd/MM/yyyy HH:mm'),
      sale.customerName || '-',
      sale.items.map(item => `${item.quantity}x ${item.product.name}`).join('\n'),
      `$${sale.total.toFixed(2)}`
    ]);
    
    // Add table
    (doc as any).autoTable({
      startY: 40,
      head: [['Fecha', 'Cliente', 'Productos', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 30, halign: 'right' }
      }
    });
    
    // Add summary
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(11);
    doc.text(`Total de Ventas: $${totalAmount.toFixed(2)}`, doc.internal.pageSize.getWidth() - 20, finalY + 10, { align: 'right' });
    doc.text(`Cantidad de Ventas: ${salesToInclude.length}`, doc.internal.pageSize.getWidth() - 20, finalY + 20, { align: 'right' });
    
    // Save the PDF
    doc.save(`reporte-ventas-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const handleDownloadAll = () => {
    generatePDF(filteredSalesByDateRange);
  };

  const handleDownloadSelected = () => {
    const selectedSalesData = filteredSalesByDateRange.filter(sale => selectedSales.includes(sale.id));
    generatePDF(selectedSalesData);
  };

  const toggleSaleSelection = (saleId: string) => {
    setSelectedSales(prev => 
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
            <option value={10}>10 reportes</option>
            <option value={25}>25 reportes</option>
            <option value={50}>50 reportes</option>
            <option value={100}>100 reportes</option>
          </select>
        </div>
        {selectedSales.length > 0 && (
          <div className="ml-2">
            <button
              onClick={handleDownloadSelected}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Descargar ({selectedSales.length})
            </button>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Fecha Inicial
            </label>
            <input
              type="date"
              id="startDate"
              value={searchParams.startDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Fecha Final
            </label>
            <input
              type="date"
              id="endDate"
              value={searchParams.endDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
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
                      setSelectedSales(filteredSalesByDateRange.map(sale => sale.id));
                    } else {
                      setSelectedSales([]);
                    }
                  }}
                  checked={selectedSales.length === filteredSalesByDateRange.length && filteredSalesByDateRange.length > 0}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
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
            {displayedSales.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron ventas en el período seleccionado
                </td>
              </tr>
            ) : (
              displayedSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedSales.includes(sale.id)}
                      onChange={() => toggleSaleSelection(sale.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(sale.timestamp), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.customerName || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <ul className="list-disc list-inside">
                      {sale.items.map((item, idx) => (
                        <li key={idx}>
                          {item.quantity}x {item.product.name} (${item.product.price.toFixed(2)})
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
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={4} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                Total:
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${filteredSalesByDateRange.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {filteredSalesByDateRange.length > pageSize && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Mostrando {displayedSales.length} de {filteredSalesByDateRange.length} reportes
        </div>
      )}
    </div>
  );
};

export default SalesReportsPage;
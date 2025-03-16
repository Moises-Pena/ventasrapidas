import React, { useState } from 'react';
import { useSales } from '../context/SalesContext';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO, subDays } from 'date-fns';
import { RegisterClosing, Sale } from '../types';
import { ChevronDown, ChevronUp, FileText, Printer, Download, Pencil, Trash2, Save } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import LoadingSpinner from '../components/LoadingSpinner';

type TabType = 'closings' | 'reports';

const ReportsPage: React.FC = () => {
  const { sales, registerClosings, loading, deleteRegisterClosing, updateRegisterClosingAmount } = useSales();
  const [expandedClosing, setExpandedClosing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('closings');
  const [selectedClosings, setSelectedClosings] = useState<string[]>([]);
  const [editingClosing, setEditingClosing] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState<string>('');

  const [searchParams, setSearchParams] = useState({
    customerName: '',
    receiptId: '',
    date: '',
    startDate: '',
    endDate: ''
  });
  const [selectedSales, setSelectedSales] = useState<string[]>([]);

  const filteredSalesByDateRange = sales.filter(sale => {
    if (!searchParams.startDate && !searchParams.endDate) {
      return true;
    }
    
    const saleDate = new Date(sale.timestamp);
    return isWithinInterval(saleDate, {
      start: searchParams.startDate ? startOfDay(parseISO(searchParams.startDate)) : startOfDay(new Date(0)),
      end: searchParams.endDate ? endOfDay(parseISO(searchParams.endDate)) : endOfDay(new Date())
    });
  });

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

  const filteredSales = sales.filter(sale => {
    const matchesName = sale.customerName.toLowerCase().includes(searchParams.customerName.toLowerCase());
    // Allow searching by partial ID (case insensitive)
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-medium text-gray-900">Reportes</h1>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('closings')}
                className={`${
                  activeTab === 'closings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Cierres de Caja
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Reporte de Ventas
              </button>
            </nav>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {activeTab === 'reports' ? (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between">
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
              </div>
              
              {selectedSales.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={handleDownloadSelected}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    Descargar Seleccionados ({selectedSales.length})
                  </button>
                </div>
              )}
              
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
                    {filteredSalesByDateRange.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No se encontraron ventas en el período seleccionado
                        </td>
                      </tr>
                    ) : (
                      filteredSalesByDateRange.map((sale) => (
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
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
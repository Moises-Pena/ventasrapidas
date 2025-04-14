import React, { useState } from 'react';
import { FileText, ClipboardList, Receipt } from 'lucide-react';
import ClosingsPage from './ClosingsPage';
import SalesReportsPage from './SalesReportsPage';
import ReceiptsPage from './ReceiptsPage';

// Tipo que define las posibles pestañas: 'closings', 'sales', o 'receipts'.
type TabType = 'closings' | 'sales' | 'receipts';

const ReportsPage: React.FC = () => {
  // Estado que maneja la pestaña activa, con valor inicial 'closings'.
  const [activeTab, setActiveTab] = useState<TabType>('closings');

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-medium text-gray-900">Reportes</h1>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {/* Botón para seleccionar la pestaña de Cierres de Caja */}
              <button
                onClick={() => setActiveTab('closings')}
                className={`${
                  activeTab === 'closings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Cierres de Caja
              </button>
              
              {/* Botón para seleccionar la pestaña de Reportes de Ventas */}
              <button
                onClick={() => setActiveTab('sales')}
                className={`${
                  activeTab === 'sales'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Reportes de Ventas
              </button>
              
              {/* Botón para seleccionar la pestaña de Búsqueda de Facturas */}
              <button
                onClick={() => setActiveTab('receipts')}
                className={`${
                  activeTab === 'receipts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Búsqueda de Facturas
              </button>
            </nav>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {/* Renderiza el componente correspondiente según la pestaña activa */}
          {activeTab === 'closings' ? (
            <ClosingsPage />
          ) : activeTab === 'sales' ? (
            <SalesReportsPage />
          ) : (
            <ReceiptsPage />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

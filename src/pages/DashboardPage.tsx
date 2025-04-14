import React, { useState } from 'react';
import { useSales } from '../context/SalesContext';
import SalesChart from '../components/SalesChart';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage: React.FC = () => {
  // Desestructura los valores necesarios desde el contexto de ventas (sales context)
  const { getDailySummary, sales, loading } = useSales();
  
  // Estado para manejar el período seleccionado por el usuario
  const [period, setPeriod] = useState('7d');
  
  // Ordena las ventas de manera descendente por la fecha de la venta
  const sortedSales = sales.slice().sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  /**
   * Función para determinar cuántos días incluir en el período seleccionado.
   * @param selectedPeriod - El período seleccionado por el usuario.
   * @returns El número de días para el período.
   */
  const getDaysForPeriod = (selectedPeriod: string): number => {
    switch (selectedPeriod) {
      case '7d':
        return 7; // Últimos 7 días
      case '14d':
        return 14; // Últimos 14 días
      case '30d':
        return 30; // Últimos 30 días
      case '12m':
        // Para los últimos 12 meses, calcula la cantidad de días desde hace 12 meses hasta hoy
        const today = new Date();
        const twelveMonthsAgo = subMonths(today, 12);
        return Math.ceil((today.getTime() - twelveMonthsAgo.getTime()) / (1000 * 60 * 60 * 24));
      default:
        return 7; // Valor por defecto es 7 días
    }
  };
  
  // Obtiene el resumen de ventas diarias basado en el período seleccionado
  const dailySummary = getDailySummary(getDaysForPeriod(period));
  
  // Calcula el total de ventas sumando todas las ventas en el resumen diario
  const totalSales = dailySummary.reduce((sum, day) => sum + day.totalSales, 0);
  
  // Calcula el total de transacciones sumando todas las transacciones del resumen diario
  const totalTransactions = dailySummary.reduce((sum, day) => sum + day.salesCount, 0);
  
  // Calcula el ticket promedio dividiendo el total de ventas entre el número de transacciones
  const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Si los datos están en carga, muestra el spinner de carga
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
          <h1 className="text-lg font-medium text-gray-900">Dashboard de Ventas</h1>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4">
            <label htmlFor="period" className="block text-sm font-medium text-gray-700">
              Período
            </label>
            <select
              id="period"
              value={period}
              // Cambia el estado 'period' cuando el usuario selecciona un nuevo período
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="14d">Últimos 14 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="12m">Últimos 12 meses</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Ventas Totales</p>
              <p className="text-2xl font-bold text-blue-900">${totalSales.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Transacciones</p>
              <p className="text-2xl font-bold text-green-900">{totalTransactions}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Ticket Promedio</p>
              <p className="text-2xl font-bold text-purple-900">${averageTicket.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {period === '12m' ? 'Ventas por Mes' : 'Ventas por Día'}
            </h2>
            {/* Renderiza el gráfico de ventas basado en el período seleccionado */}
            <SalesChart data={dailySummary} />
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Últimas Ventas</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
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
                  {/* Mapea las últimas ventas, mostrando los detalles de cada venta */}
                  {sortedSales.slice(0, 10).map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(sale.timestamp), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.customerName || 'Venta al contado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${sale.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {/* Si no hay ventas, muestra un mensaje indicando que no hay ventas registradas */}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay ventas registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

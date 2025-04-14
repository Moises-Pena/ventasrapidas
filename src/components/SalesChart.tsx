import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DailySummary } from '../types';
import { format, getTime } from 'date-fns';

interface SalesChartProps {
  data: DailySummary[]; // Propiedad que recibe un arreglo de datos de resumen diario de ventas
}

// Componente que renderiza un gráfico de barras con los datos de ventas diarios.
const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      {/* Contenedor responsivo que ajusta el tamaño del gráfico */}
      <ResponsiveContainer width="100%" height="100%">
        {/* Componente BarChart que crea el gráfico de barras */}
        <BarChart 
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }} 
        >
          {/* Cuadrícula de fondo para mejorar la visualización */}
          <CartesianGrid strokeDasharray="3 3" />
          
          {/* Eje X que muestra las fechas, y formatea la fecha dependiendo de la cantidad de datos */}
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => {
              const date = new Date(value);
              // Si tenemos más de 31 días de datos, se muestra solo el mes
              if (data.length > 31) {
                return format(date, 'MMM');
              }
              return format(date, 'dd/MM');
            }}
          />
          
          {/* Eje Y que muestra el valor de las ventas */}
          <YAxis />
          
          {/* Tooltip que se muestra al pasar el ratón sobre el gráfico y muestra las ventas con formato */}
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ventas']}
            labelFormatter={(label) => {
              const date = new Date(label);
              // Si tenemos más de 31 días de datos, se muestra el mes y el año
              if (data.length > 31) {
                return format(date, 'MMMM yyyy');
              }
              return format(date, 'dd/MM/yyyy');
            }}
          />
          
          {/* Barra de ventas, donde se muestra el total de ventas con un color específico */}
          <Bar 
            dataKey="totalSales" 
            fill="#3b82f6" 
            name="Ventas"
            // Se añade una clave única basada en el timestamp para evitar problemas de renderizado
            key={`sales-bar-${getTime(new Date())}`}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;

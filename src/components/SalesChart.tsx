import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DailySummary } from '../types';
import { format, getTime } from 'date-fns';

interface SalesChartProps {
  data: DailySummary[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }} 
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => {
              const date = new Date(value);
              // If we have more than 31 days of data, show month names
              if (data.length > 31) {
                return format(date, 'MMM');
              }
              return format(date, 'dd/MM');
            }}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ventas']}
            labelFormatter={(label) => {
              const date = new Date(label);
              // If we have more than 31 days of data, show month and year
              if (data.length > 31) {
                return format(date, 'MMMM yyyy');
              }
              return format(date, 'dd/MM/yyyy');
            }}
          />
          <Bar 
            dataKey="totalSales" 
            fill="#3b82f6" 
            name="Ventas"
            // Add unique key based on timestamp
            key={`sales-bar-${getTime(new Date())}`}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
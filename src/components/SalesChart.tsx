import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DailySummary } from '../types';

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
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ventas']}
            labelFormatter={(label) => {
              const date = new Date(label);
              return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            }}
          />
          <Bar dataKey="totalSales" fill="#3b82f6" name="Ventas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
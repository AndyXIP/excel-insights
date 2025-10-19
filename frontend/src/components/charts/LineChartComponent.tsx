import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6C3BAA', '#8B5BD9', '#A47CE5', '#BD9DF0', '#D6BEFB'];

interface LineChartComponentProps {
  data: any[];
  numericColumns: string[];
}

export const LineChartComponent = memo(({ 
  data, 
  numericColumns 
}: LineChartComponentProps) => (
  <div className="chart-card">
    <h4>Trends Over Time</h4>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {numericColumns.slice(0, 3).map((col, idx) => (
          <Line 
            key={col} 
            type="monotone" 
            dataKey={col} 
            stroke={COLORS[idx % COLORS.length]} 
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
));

LineChartComponent.displayName = 'LineChartComponent';

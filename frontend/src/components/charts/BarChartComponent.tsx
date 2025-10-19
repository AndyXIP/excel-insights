import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartComponentProps {
  data: Array<{ name: string; value: number }>;
  selectedColumn: string;
  numericColumns: string[];
  onColumnChange: (col: string) => void;
}

export const BarChartComponent = memo(({ 
  data, 
  selectedColumn, 
  numericColumns, 
  onColumnChange 
}: BarChartComponentProps) => (
  <div className="chart-card">
    <div className="chart-header">
      <h4>Bar Chart</h4>
      <select 
        value={selectedColumn} 
        onChange={(e) => onColumnChange(e.target.value)}
        className="chart-selector"
      >
        {numericColumns.map((col: string) => (
          <option key={col} value={col}>{col}</option>
        ))}
      </select>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#6C3BAA" />
      </BarChart>
    </ResponsiveContainer>
  </div>
));

BarChartComponent.displayName = 'BarChartComponent';

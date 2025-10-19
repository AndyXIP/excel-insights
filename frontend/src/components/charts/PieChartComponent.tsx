import { memo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#6C3BAA', '#8B5BD9', '#A47CE5', '#BD9DF0', '#D6BEFB'];

interface PieChartComponentProps {
  data: Array<{ name: string; value: number }>;
  selectedColumn: string;
  categoricalColumns: string[];
  onColumnChange: (col: string) => void;
}

export const PieChartComponent = memo(({ 
  data, 
  selectedColumn, 
  categoricalColumns, 
  onColumnChange 
}: PieChartComponentProps) => (
  <div className="chart-card">
    <div className="chart-header">
      <h4>Distribution - Pie Chart</h4>
      <select 
        value={selectedColumn} 
        onChange={(e) => onColumnChange(e.target.value)}
        className="chart-selector"
      >
        {categoricalColumns.map((col: string) => (
          <option key={col} value={col}>{col}</option>
        ))}
      </select>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) => {
            const name = props?.name as string;
            const percent = Number(props?.percent ?? 0);
            return `${name}: ${(percent * 100).toFixed(0)}%`;
          }}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
));

PieChartComponent.displayName = 'PieChartComponent';

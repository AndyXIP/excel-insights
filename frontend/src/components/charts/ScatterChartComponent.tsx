import { memo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6C3BAA', '#8B5BD9', '#A47CE5', '#BD9DF0', '#D6BEFB'];

interface ScatterChartComponentProps {
  data: Array<{ x: number; y: number; name: string }>;
  selectedX: string;
  selectedY: string;
  numericColumns: string[];
  onXChange: (col: string) => void;
  onYChange: (col: string) => void;
}

export const ScatterChartComponent = memo(({ 
  data, 
  selectedX, 
  selectedY, 
  numericColumns, 
  onXChange, 
  onYChange 
}: ScatterChartComponentProps) => (
  <div className="chart-card">
    <div className="chart-header">
      <h4>Scatter Chart</h4>
      <div className="scatter-selectors">
        <select 
          value={selectedX} 
          onChange={(e) => onXChange(e.target.value)}
          className="chart-selector"
        >
          {numericColumns.map((col: string) => (
            <option key={col} value={col}>{col} (X)</option>
          ))}
        </select>
        <select 
          value={selectedY} 
          onChange={(e) => onYChange(e.target.value)}
          className="chart-selector"
        >
          {numericColumns.map((col: string) => (
            <option key={col} value={col}>{col} (Y)</option>
          ))}
        </select>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" name={selectedX} />
        <YAxis dataKey="y" name={selectedY} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Legend />
        <Scatter 
          name="Data Points" 
          data={data} 
          fill={COLORS[0]}
        />
      </ScatterChart>
    </ResponsiveContainer>
  </div>
));

ScatterChartComponent.displayName = 'ScatterChartComponent';

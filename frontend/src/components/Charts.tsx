import { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ParsedData } from '../types';
import './Charts.css';

interface ChartsProps {
  data: ParsedData;
}

const COLORS = ['#6C3BAA', '#8B5BD9', '#A47CE5', '#BD9DF0', '#D6BEFB'];

export function Charts({ data }: ChartsProps) {
  const [selectedBarColumn, setSelectedBarColumn] = useState<string>('');
  const [selectedPieColumn, setSelectedPieColumn] = useState<string>('');
  const [selectedScatterX, setSelectedScatterX] = useState<string>('');
  const [selectedScatterY, setSelectedScatterY] = useState<string>('');

  const analysis = useMemo(() => {
    const columns = data.columns;
    const rows = data.data;

    // Find numeric columns
    const numericColumns: string[] = [];
    const categoricalColumns: string[] = [];

    columns.forEach((col: string) => {
      const values = rows.map((row: Record<string, unknown>) => row[col]);
      const numericValues = values.filter((v: unknown) => v != null && v !== '' && !isNaN(Number(v as any)));
      
      if (numericValues.length > values.length * 0.7) {
        numericColumns.push(col);
      } else {
        categoricalColumns.push(col);
      }
    });

    // Find time-series columns (dates or sequential values)
    const timeColumns = columns.filter((col: string) => {
      const val = rows[0]?.[col as any] as any;
      if (!val) return false;
      const str = String(val).toLowerCase();
      return str.includes('date') || str.includes('time') || str.includes('year') || str.includes('month') || str.includes('day');
    });

    // Calculate trends for numeric columns
    const trends: Record<string, { direction: 'increasing' | 'decreasing' | 'stable'; change: number }> = {};
    numericColumns.forEach((col: string) => {
      const values = rows.map((row: Record<string, unknown>) => Number(row[col] as any)).filter((v: number) => !isNaN(v));
      if (values.length > 1) {
        const first = values[0];
        const last = values[values.length - 1];
        const change = first === 0 ? 0 : ((last - first) / first) * 100;
        
        trends[col] = {
          direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
          change: Math.round(change * 10) / 10
        };
      }
    });

    // Prepare data for charts
    const barCol = selectedBarColumn || numericColumns[0];
    const barChartData = barCol ? rows.slice(0, 10).map((row: Record<string, any>, idx: number) => ({
      name: row[columns[0]] || `Row ${idx + 1}`,
      value: Number(row[barCol]) || 0
    })) : [];

    const lineChartData = numericColumns.length > 0 ? rows.slice(0, 20).map((row: Record<string, any>, idx: number) => {
      const point: any = { name: row[columns[0]] || `Row ${idx + 1}` };
      numericColumns.slice(0, 3).forEach((col: string) => {
        point[col] = Number(row[col]) || 0;
      });
      return point;
    }) : [];

    // Pie chart: aggregate selected or first categorical column
    const pieCol = selectedPieColumn || categoricalColumns[0];
    let pieChartData: Array<{ name: string; value: number }> = [];
    if (pieCol) {
      const counts: Record<string, number> = {};
      rows.forEach((row: Record<string, any>) => {
        const val = String(row[pieCol] || 'Unknown');
        counts[val] = (counts[val] || 0) + 1;
      });
      pieChartData = Object.entries(counts)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));
    }

    // Scatter chart: relationship between selected or first two numeric columns
    const scatterX = selectedScatterX || numericColumns[0];
    const scatterY = selectedScatterY || numericColumns[1];
    let scatterChartData: Array<{ x: number; y: number; name: string }> = [];
    if (scatterX && scatterY) {
      scatterChartData = rows.slice(0, 50).map((row: Record<string, any>, idx: number) => ({
        x: Number(row[scatterX]) || 0,
        y: Number(row[scatterY]) || 0,
        name: row[columns[0]] || `Point ${idx + 1}`
      }));
    }

    return {
      numericColumns,
      categoricalColumns,
      timeColumns,
      trends,
      barChartData,
      lineChartData,
      pieChartData,
      scatterChartData,
      barCol,
      pieCol,
      scatterX,
      scatterY
    };
  }, [data, selectedBarColumn, selectedPieColumn, selectedScatterX, selectedScatterY]);

  if (analysis.numericColumns.length === 0) {
    return (
      <div className="charts-container">
        <div className="no-charts-message">
          <p>No numeric data found to visualize. Upload a file with numeric columns to see charts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-container">
      <h2>Data Visualization</h2>

      {/* Trends Section */}
      {Object.keys(analysis.trends).length > 0 && (
        <div className="trends-section">
          <h3>Trends Detected</h3>
          <div className="trends-grid">
            {Object.entries(analysis.trends).map(([col, trend]) => (
              <div key={col} className={`trend-card trend-${trend.direction}`}>
                <div className="trend-info">
                  <div className="trend-label">{col}</div>
                  <div className="trend-value">
                    {trend.change > 0 ? '+' : ''}{trend.change}%
                  </div>
                  <div className="trend-direction">{trend.direction}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Bar Chart */}
        {analysis.barChartData.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h4>Bar Chart</h4>
              <select 
                value={selectedBarColumn || analysis.barCol} 
                onChange={(e) => setSelectedBarColumn(e.target.value)}
                className="chart-selector"
              >
                {analysis.numericColumns.map((col: string) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6C3BAA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Line Chart */}
        {analysis.lineChartData.length > 0 && (
          <div className="chart-card">
            <h4>Trends Over Time</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analysis.lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {analysis.numericColumns.slice(0, 3).map((col, idx) => (
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
        )}

        {/* Pie Chart */}
        {analysis.pieChartData.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h4>Distribution - Pie Chart</h4>
              <select 
                value={selectedPieColumn || analysis.pieCol} 
                onChange={(e) => setSelectedPieColumn(e.target.value)}
                className="chart-selector"
              >
                {analysis.categoricalColumns.map((col: string) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysis.pieChartData}
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
                  {analysis.pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Scatter Chart */}
        {analysis.scatterChartData.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h4>Scatter Chart</h4>
              <div className="scatter-selectors">
                <select 
                  value={selectedScatterX || analysis.scatterX} 
                  onChange={(e) => setSelectedScatterX(e.target.value)}
                  className="chart-selector"
                >
                  {analysis.numericColumns.map((col: string) => (
                    <option key={col} value={col}>{col} (X)</option>
                  ))}
                </select>
                <select 
                  value={selectedScatterY || analysis.scatterY} 
                  onChange={(e) => setSelectedScatterY(e.target.value)}
                  className="chart-selector"
                >
                  {analysis.numericColumns.map((col: string) => (
                    <option key={col} value={col}>{col} (Y)</option>
                  ))}
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name={analysis.scatterX} />
                <YAxis dataKey="y" name={analysis.scatterY} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter 
                  name="Data Points" 
                  data={analysis.scatterChartData} 
                  fill={COLORS[0]}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

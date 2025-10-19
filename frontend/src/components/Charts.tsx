import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ParsedData } from '../types';
import './Charts.css';

interface ChartsProps {
  data: ParsedData;
}

const COLORS = ['#6C3BAA', '#8B5BD9', '#A47CE5', '#BD9DF0', '#D6BEFB'];

export function Charts({ data }: ChartsProps) {
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
    const barChartData = numericColumns.slice(0, 1).map((col: string) => {
      return rows.slice(0, 10).map((row: Record<string, any>, idx: number) => ({
        name: row[columns[0]] || `Row ${idx + 1}`,
        value: Number(row[col]) || 0
      }));
    })[0] || [];

    const lineChartData = numericColumns.length > 0 ? rows.slice(0, 20).map((row: Record<string, any>, idx: number) => {
      const point: any = { name: row[columns[0]] || `Row ${idx + 1}` };
      numericColumns.slice(0, 3).forEach((col: string) => {
        point[col] = Number(row[col]) || 0;
      });
      return point;
    }) : [];

    // Pie chart: aggregate first categorical column
    let pieChartData: Array<{ name: string; value: number }> = [];
    if (categoricalColumns.length > 0) {
      const catCol = categoricalColumns[0];
      const counts: Record<string, number> = {};
      rows.forEach((row: Record<string, any>) => {
        const val = String(row[catCol] || 'Unknown');
        counts[val] = (counts[val] || 0) + 1;
      });
      pieChartData = Object.entries(counts)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));
    }

    return {
      numericColumns,
      categoricalColumns,
      timeColumns,
      trends,
      barChartData,
      lineChartData,
      pieChartData
    };
  }, [data]);

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
      <h2>📊 Data Visualization</h2>

      {/* Trends Section */}
      {Object.keys(analysis.trends).length > 0 && (
        <div className="trends-section">
          <h3>🔍 Trends Detected</h3>
          <div className="trends-grid">
            {Object.entries(analysis.trends).map(([col, trend]) => (
              <div key={col} className={`trend-card trend-${trend.direction}`}>
                <div className="trend-icon">
                  {trend.direction === 'increasing' && '📈'}
                  {trend.direction === 'decreasing' && '📉'}
                  {trend.direction === 'stable' && '➡️'}
                </div>
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
            <h4>{analysis.numericColumns[0]} - Bar Chart</h4>
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
            <h4>{analysis.categoricalColumns[0]} - Distribution</h4>
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
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <h3>💡 Quick Insights</h3>
        <ul>
          <li>Total rows: <strong>{data.rowCount}</strong></li>
          <li>Numeric columns: <strong>{analysis.numericColumns.join(', ')}</strong></li>
          {analysis.categoricalColumns.length > 0 && (
            <li>Categorical columns: <strong>{analysis.categoricalColumns.join(', ')}</strong></li>
          )}
          {analysis.timeColumns.length > 0 && (
            <li>Time-based columns detected: <strong>{analysis.timeColumns.join(', ')}</strong></li>
          )}
        </ul>
      </div>
    </div>
  );
}

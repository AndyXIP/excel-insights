import { useMemo, useState } from 'react';
import type { ParsedData } from '../types';
import { BarChartComponent, LineChartComponent, PieChartComponent, ScatterChartComponent } from './charts/index';
import './ChartsContainer.css';

interface ChartsProps {
  data: ParsedData;
}

export function Charts({ data }: ChartsProps) {
  const [selectedBarColumn, setSelectedBarColumn] = useState<string>('');
  const [selectedPieColumn, setSelectedPieColumn] = useState<string>('');
  const [selectedScatterX, setSelectedScatterX] = useState<string>('');
  const [selectedScatterY, setSelectedScatterY] = useState<string>('');

  // Analyze column types once (only depends on data)
  const columnAnalysis = useMemo(() => {
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

    return {
      numericColumns,
      categoricalColumns,
      timeColumns,
      trends,
      columns,
      rows
    };
  }, [data]);

  // Bar chart data (only recalculates when bar column selection changes)
  const barChartData = useMemo(() => {
    const barCol = selectedBarColumn || columnAnalysis.numericColumns[0];
    if (!barCol) return { data: [], column: '' };
    
    return {
      data: columnAnalysis.rows.slice(0, 10).map((row: Record<string, any>, idx: number) => ({
        name: row[columnAnalysis.columns[0]] || `Row ${idx + 1}`,
        value: Number(row[barCol]) || 0
      })),
      column: barCol
    };
  }, [columnAnalysis, selectedBarColumn]);

  // Line chart data (only depends on data, not on any selection)
  const lineChartData = useMemo(() => {
    if (columnAnalysis.numericColumns.length === 0) return [];
    
    return columnAnalysis.rows.slice(0, 20).map((row: Record<string, any>, idx: number) => {
      const point: any = { name: row[columnAnalysis.columns[0]] || `Row ${idx + 1}` };
      columnAnalysis.numericColumns.slice(0, 3).forEach((col: string) => {
        point[col] = Number(row[col]) || 0;
      });
      return point;
    });
  }, [columnAnalysis]);

  // Pie chart data (only recalculates when pie column selection changes)
  const pieChartData = useMemo(() => {
    const pieCol = selectedPieColumn || columnAnalysis.categoricalColumns[0];
    if (!pieCol) return { data: [], column: '' };
    
    const counts: Record<string, number> = {};
    columnAnalysis.rows.forEach((row: Record<string, any>) => {
      const val = String(row[pieCol] || 'Unknown');
      counts[val] = (counts[val] || 0) + 1;
    });
    
    return {
      data: Object.entries(counts)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value })),
      column: pieCol
    };
  }, [columnAnalysis, selectedPieColumn]);

  // Scatter chart data (only recalculates when scatter selections change)
  const scatterChartData = useMemo(() => {
    const scatterX = selectedScatterX || columnAnalysis.numericColumns[0];
    const scatterY = selectedScatterY || columnAnalysis.numericColumns[1];
    if (!scatterX || !scatterY) return { data: [], xColumn: '', yColumn: '' };
    
    return {
      data: columnAnalysis.rows.slice(0, 50).map((row: Record<string, any>, idx: number) => ({
        x: Number(row[scatterX]) || 0,
        y: Number(row[scatterY]) || 0,
        name: row[columnAnalysis.columns[0]] || `Point ${idx + 1}`
      })),
      xColumn: scatterX,
      yColumn: scatterY
    };
  }, [columnAnalysis, selectedScatterX, selectedScatterY]);

  if (columnAnalysis.numericColumns.length === 0) {
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
      {Object.keys(columnAnalysis.trends).length > 0 && (
        <div className="trends-section">
          <h3>Trends Detected</h3>
          <div className="trends-grid">
            {Object.entries(columnAnalysis.trends).map(([col, trend]) => (
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
        {barChartData.data.length > 0 && (
          <BarChartComponent
            data={barChartData.data}
            selectedColumn={selectedBarColumn || barChartData.column}
            numericColumns={columnAnalysis.numericColumns}
            onColumnChange={setSelectedBarColumn}
          />
        )}

        {/* Line Chart */}
        {lineChartData.length > 0 && (
          <LineChartComponent
            data={lineChartData}
            numericColumns={columnAnalysis.numericColumns}
          />
        )}

        {/* Pie Chart */}
        {pieChartData.data.length > 0 && (
          <PieChartComponent
            data={pieChartData.data}
            selectedColumn={selectedPieColumn || pieChartData.column}
            categoricalColumns={columnAnalysis.categoricalColumns}
            onColumnChange={setSelectedPieColumn}
          />
        )}

        {/* Scatter Chart */}
        {scatterChartData.data.length > 0 && (
          <ScatterChartComponent
            data={scatterChartData.data}
            selectedX={selectedScatterX || scatterChartData.xColumn}
            selectedY={selectedScatterY || scatterChartData.yColumn}
            numericColumns={columnAnalysis.numericColumns}
            onXChange={setSelectedScatterX}
            onYChange={setSelectedScatterY}
          />
        )}
      </div>
    </div>
  );
}

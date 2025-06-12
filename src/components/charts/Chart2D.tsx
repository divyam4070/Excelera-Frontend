import React from 'react';
import { ChartType } from '@/types';
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  AreaChart,
  ScatterChart,
  Bar,
  Line,
  Area,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Chart2DProps {
  data: Record<string, any>[];
  xAxis: string;
  yAxis: string;
  chartType: ChartType;
  colorScheme?: string[];
  animationSpeed?: number;
}

const Chart2D: React.FC<Chart2DProps> = ({
  data,
  xAxis,
  yAxis,
  chartType,
  colorScheme = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'],
  animationSpeed = 0.5
}) => {
  // Convert yAxis to array if it's a string
  const yAxes = Array.isArray(yAxis) ? yAxis : [yAxis];

  // Validate data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Process and optimize data for large datasets
  const processData = () => {
    const maxDataPoints = 50; // Maximum number of data points to display
    let processedData = data.map(item => {
      if (!item || typeof item !== 'object') return null;
      
      const xValue = item[xAxis];
      if (xValue === undefined || xValue === null) return null;

      const yValues = yAxes.reduce((acc, axis) => {
        const value = item[axis];
        acc[axis] = !isNaN(Number(value)) ? Number(value) : value;
        return acc;
      }, {} as Record<string, any>);

      return {
        [xAxis]: xValue,
        ...yValues
      };
    }).filter(Boolean);

    // If data is too large, sample it
    if (processedData.length > maxDataPoints) {
      const step = Math.ceil(processedData.length / maxDataPoints);
      processedData = processedData.filter((_, index) => index % step === 0);
    }

    return processedData;
  };

  const processedData = processData();

  // Common chart configuration
  const commonProps = {
    data: processedData,
    margin: { top: 20, right: 30, left: 40, bottom: 40 } // Increased margins for better label visibility
  };

  const commonAxisProps = {
    tick: { 
      fill: '#333333',
      fontSize: 12,
      fontWeight: 'bold'
    },
    tickLine: { stroke: '#666666', strokeWidth: 1 },
    axisLine: { stroke: '#666666', strokeWidth: 2 },
    label: {
      fill: '#333333',
      fontSize: 14,
      fontWeight: 'bold',
      offset: 0
    },
    interval: 0,
    tickMargin: 12,
    angle: processedData.length > 20 ? -45 : 0,
    textAnchor: processedData.length > 20 ? 'end' : 'middle'
  };

  // Process data for pie chart
  const processPieData = () => {
    const yAxisValue = yAxes[0];
    const rawData = data
      .map(item => ({
        name: String(item[xAxis]),
        value: Math.abs(Number(item[yAxisValue]) || 0)
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // Limit to top 8 slices, combine the rest into "Others"
    if (rawData.length > 8) {
      const topSlices = rawData.slice(0, 7);
      const otherSlices = rawData.slice(7);
      const othersValue = otherSlices.reduce((sum, item) => sum + item.value, 0);
      
      return [...topSlices, {
        name: 'Others',
        value: othersValue
      }];
    }

    return rawData;
  };

  // Process data for scatter plot
  const processScatterData = () => {
    const yAxisValue = yAxes[0];
    return processedData.map(item => ({
      x: Number(item[xAxis]) || 0,
      y: Number(item[yAxisValue]) || 0,
      name: String(item[xAxis])
    }));
  };

  // Render appropriate chart based on type
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis 
              dataKey={xAxis} 
              {...commonAxisProps}
              height={60}
              label={{ value: xAxis, position: 'bottom', offset: 40 }}
            />
            <YAxis 
              {...commonAxisProps}
              width={80}
              label={{ value: yAxis, angle: -90, position: 'left', offset: 20 }}
              tickFormatter={value => {
                if (Math.abs(value) >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                } else if (Math.abs(value) >= 1000) {
                  return `${(value / 1000).toFixed(1)}K`;
                }
                return value;
              }}
            />
            <Tooltip
              formatter={(value: any, name: string) => [
                typeof value === 'number' ? value.toLocaleString() : value,
                name
              ]}
              labelStyle={{ fontWeight: 'bold' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
            />
            <Legend verticalAlign="top" height={36} />
            {yAxes.map((axis, index) => (
              <Bar
                key={axis}
                dataKey={axis}
                name={axis}
                fill={colorScheme[index % colorScheme.length]}
                maxBarSize={50}
                isAnimationActive={true}
                animationDuration={2000 / animationSpeed}
              />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis 
              dataKey={xAxis} 
              {...commonAxisProps}
              height={60}
              label={{ value: xAxis, position: 'bottom', offset: 40 }}
            />
            <YAxis 
              {...commonAxisProps}
              width={80}
              label={{ value: yAxis, angle: -90, position: 'left', offset: 20 }}
              tickFormatter={value => {
                if (Math.abs(value) >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                } else if (Math.abs(value) >= 1000) {
                  return `${(value / 1000).toFixed(1)}K`;
                }
                return value;
              }}
            />
            <Tooltip
              formatter={(value: any, name: string) => [
                typeof value === 'number' ? value.toLocaleString() : value,
                name
              ]}
              labelStyle={{ fontWeight: 'bold' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
            />
            <Legend verticalAlign="top" height={36} />
            {yAxes.map((axis, index) => (
              <Line
                key={axis}
                type="monotone"
                dataKey={axis}
                name={axis}
                stroke={colorScheme[index % colorScheme.length]}
                strokeWidth={2}
                dot={{ r: 3, fill: colorScheme[index % colorScheme.length] }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
                animationDuration={2000 / animationSpeed}
              />
            ))}
          </LineChart>
        );

      case 'pie':
        const pieData = processPieData();
        return (
          <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
            <Pie
              data={pieData}
              nameKey="name"
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius="0%"
              outerRadius="75%"
              paddingAngle={2}
              label={({ name, value, percent }) => 
                `${name.length > 12 ? name.substring(0, 9) + '...' : name} (${(percent * 100).toFixed(1)}%)`
              }
              labelLine={{ strokeWidth: 1, stroke: '#888' }}
              isAnimationActive={true}
              animationDuration={2000 / animationSpeed}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colorScheme[index % colorScheme.length]}
                  stroke={colorScheme[index % colorScheme.length]}
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [value.toLocaleString(), 'Value']}
            />
            <Legend 
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value, entry: any) => (
                <span className="text-sm">
                  {value.length > 20 ? value.substring(0, 17) + '...' : value}
                </span>
              )}
            />
          </PieChart>
        );

      case 'scatter':
        const scatterData = processScatterData();
        return (
          <ScatterChart margin={{ top: 20, right: 30, left: 80, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
            <XAxis 
              type="number"
              dataKey="x"
              name={xAxis}
              {...commonAxisProps}
              height={60}
              domain={['auto', 'auto']}
              label={{ value: xAxis, position: 'bottom', offset: 40 }}
            />
            <YAxis 
              type="number"
              dataKey="y"
              name={yAxes[0]}
              {...commonAxisProps}
              width={80}
              domain={['auto', 'auto']}
              label={{ value: yAxis, angle: -90, position: 'left', offset: 20 }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: any) => [value.toLocaleString(), yAxis]}
              labelStyle={{ fontWeight: 'bold' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Scatter
              name={`${xAxis} vs ${yAxes[0]}`}
              data={scatterData}
              fill={colorScheme[0]}
              animationDuration={2000 / animationSpeed}
            />
          </ScatterChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Unsupported chart type: {chartType}</p>
          </div>
        );
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={400}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

export default Chart2D;

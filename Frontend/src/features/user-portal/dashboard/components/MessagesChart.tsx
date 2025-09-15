import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchMessagesSentPerType } from '../slices/analyticsSlice';
import type { RootState } from '@/store';
import type { AppDispatch } from '@/store';
import type { MessageTypeChartDataPoint } from '../types/analytics.types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MessagesChartProps {
  className?: string;
}

const MessagesChart: React.FC<MessagesChartProps> = ({ className }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.analytics.messagesPerType
  );
  const { startDate, endDate } = useSelector(
    (state: RootState) => state.analytics.dateRange
  );

  useEffect(() => {
    const query: { startDate?: string; endDate?: string } = {};
    if (startDate) query.startDate = startDate;
    if (endDate) query.endDate = endDate;
    
    dispatch(fetchMessagesSentPerType(query));
  }, [dispatch, startDate, endDate]);

  // Process data for chart
  const dates = [...new Set(data.map((item: MessageTypeChartDataPoint) => item.date))].sort();
  const textData = dates.map((date) => {
    const item = data.find((d: MessageTypeChartDataPoint) => d.date === date && d.type === 'Text');
    return item ? item.count : 0;
  });
  const textImageData = dates.map((date) => {
    const item = data.find((d: MessageTypeChartDataPoint) => d.date === date && d.type === 'Text & Image');
    return item ? item.count : 0;
  });

  const chartData = {
    labels: dates.map((date) => {
      const dateObj = new Date(date as string);
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }),
    datasets: [
      {
        label: 'Text Messages',
        data: textData,
        borderColor: '#64ffda',
        backgroundColor: 'rgba(100, 255, 218, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#64ffda',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Text & Image Messages',
        data: textImageData,
        borderColor: '#7fdbff',
        backgroundColor: 'rgba(127, 219, 255, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#7fdbff',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e7e0e0',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'Messages Sent Per Type',
        color: '#e7e0e0',
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: 600,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(35, 34, 50, 0.9)',
        titleColor: '#64ffda',
        bodyColor: '#e7e0e0',
        borderColor: '#64ffda',
        borderWidth: 1,
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(231, 224, 224, 0.1)',
        },
        ticks: {
          color: '#e7e0e0',
          font: {
            family: 'Inter, sans-serif',
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(231, 224, 224, 0.1)',
        },
        ticks: {
          color: '#e7e0e0',
          font: {
            family: 'Inter, sans-serif',
            size: 11,
          },
          stepSize: 1,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  if (loading) {
    return (
      <div className={`messages-chart ${className || ''}`}>
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading messages data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`messages-chart ${className || ''}`}>
        <div className="chart-error">
          <p>Error loading messages data: {error}</p>
          <button 
            onClick={() => dispatch(fetchMessagesSentPerType())}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`messages-chart ${className || ''}`}>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MessagesChart;
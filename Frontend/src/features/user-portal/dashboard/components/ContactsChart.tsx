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
import { fetchContactsReachedPerDay } from '../slices/analyticsSlice';
import type { RootState } from '@/store';
import type { AppDispatch } from '@/store';
import type { ChartDataPoint } from '../types/analytics.types';

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

interface ContactsChartProps {
  className?: string;
}

const ContactsChart: React.FC<ContactsChartProps> = ({ className }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.analytics.contactsReached
  );
  const { startDate, endDate } = useSelector(
    (state: RootState) => state.analytics.dateRange
  );

  useEffect(() => {
    const query: { startDate?: string; endDate?: string } = {};
    if (startDate) query.startDate = startDate;
    if (endDate) query.endDate = endDate;
    
    dispatch(fetchContactsReachedPerDay(query));
  }, [dispatch, startDate, endDate]);

  const chartData = {
    labels: data.map((item: ChartDataPoint) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }),
    datasets: [
      {
        label: 'Contacts Reached',
        data: data.map((item: ChartDataPoint) => item.count),
        borderColor: '#00b4d8',
        backgroundColor: 'rgba(0, 180, 216, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00b4d8',
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
        },
      },
      title: {
        display: true,
        text: 'Daily Contacts Reached',
        color: '#e7e0e0',
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: 600,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(35, 34, 50, 0.9)',
        titleColor: '#00b4d8',
        bodyColor: '#e7e0e0',
        borderColor: '#00b4d8',
        borderWidth: 1,
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
    elements: {
      point: {
        hoverBackgroundColor: '#7fdbff',
      },
    },
  };

  if (loading) {
    return (
      <div className={`contacts-chart ${className || ''}`}>
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading contacts data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`contacts-chart ${className || ''}`}>
        <div className="chart-error">
          <p>Error loading contacts data: {error}</p>
          <button 
            onClick={() => dispatch(fetchContactsReachedPerDay())}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`contacts-chart ${className || ''}`}>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ContactsChart;
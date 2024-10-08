// src/components/BarChart.jsx
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { fetchBarChartData } from '../api';
import { months } from '../constants';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ selectedMonth }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        const loadChartData = async () => {
            try {
                const data = await fetchBarChartData(selectedMonth);
                const labels = data.map(item => item.priceRange);
                const counts = data.map(item => item.count);

                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Number of Items',
                            data: counts,
                            backgroundColor: 'rgba(76, 175, 80, 0.6)',
                            borderColor: 'rgba(76, 175, 80, 1)',
                            borderWidth: 1,
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching bar chart data:', error);
            }
        };

        loadChartData();
    }, [selectedMonth]);

    const monthName = months.find(month => month.value === selectedMonth)?.label || 'Unknown';

    return (
      <div className="chart-container">
      <h2>Bar Chart Stats - {monthName}</h2>
      <div className="bar-chart-wrapper">
        <Bar 
          data={chartData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Items',
                },
              },
              x: {
                title: {
                  display: true,
                  text: 'Price Range',
                },
                ticks: {
                  autoSkip: false,
                  maxRotation: 0,
                  minRotation: 0,
                },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => {
                    return `${context.dataset.label}: ${context.raw}`;
                  }
                }
              }
            },
          }} 
        />
      </div>
    </div>
    );
};

BarChart.propTypes = {
    selectedMonth: PropTypes.number.isRequired,
};

export default BarChart;

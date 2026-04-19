import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js';
import tourismData from '../data/mauiTourism.json';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ArrivalChart({ island }) {
  const islandKey = island === 'Maui' ? 'Maui' : 'Oahu';
  const data = tourismData.arrivals[islandKey] || tourismData.arrivals['Maui'];

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [{
      label: `${island} Visitor Arrivals (2021)`,
      data: data.map(d => d.visitors),
      backgroundColor: 'rgba(44, 122, 75, 0.7)',
      borderColor: '#2c7a4b',
      borderWidth: 2,
      borderRadius: 6,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Monthly Visitor Arrivals — ${island}`, font: { size: 14 } }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { callback: v => (v / 1000).toFixed(0) + 'K' }
      }
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

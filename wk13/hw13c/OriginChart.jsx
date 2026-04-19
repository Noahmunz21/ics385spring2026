import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import tourismData from '../data/mauiTourism.json';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OriginChart({ island }) {
  const islandKey = island === 'Maui' ? 'Maui' : 'Oahu';
  const origin = tourismData.origin[islandKey] || tourismData.origin['Maui'];

  const chartData = {
    labels: Object.keys(origin),
    datasets: [{
      data: Object.values(origin),
      backgroundColor: ['#2c7a4b', '#52b788', '#95d5b2', '#b7e4c7'],
      borderColor: 'white',
      borderWidth: 3,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: `Visitor Origin — ${island}`, font: { size: 14 } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } }
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '400px', margin: '0 auto' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

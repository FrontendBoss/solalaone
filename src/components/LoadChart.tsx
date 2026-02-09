import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface LoadChartProps {
  loads: {
    lights: any[];
    tvs: any[];
    fans: any[];
    refrigerators: any[];
    freezers: any[];
    washingMachines: any[];
    waterPumps: any[];
    airConditioners: any[];
    laptops: any[];
    routers: any[];
    cctvCameras: any[];
  };
}

export default function LoadChart({ loads }: LoadChartProps) {
  const calculateCategoryLoad = (items: any[]) => {
    return items.reduce((sum, item) => {
      const wattage = item.horsepower ? item.horsepower * 746 : item.wattage;
      return sum + (item.quantity * wattage);
    }, 0);
  };

  const categories = [
    { name: 'Lights', items: loads.lights },
    { name: 'TVs', items: loads.tvs },
    { name: 'Fans', items: loads.fans },
    { name: 'Refrigerators', items: loads.refrigerators },
    { name: 'Freezers', items: loads.freezers },
    { name: 'Washing Machines', items: loads.washingMachines },
    { name: 'Water Pumps', items: loads.waterPumps },
    { name: 'Air Conditioners', items: loads.airConditioners },
    { name: 'Laptops', items: loads.laptops },
    { name: 'Routers', items: loads.routers },
    { name: 'CCTV Cameras', items: loads.cctvCameras },
  ];

  const categoryData = categories.map(cat => ({
    name: cat.name,
    load: calculateCategoryLoad(cat.items),
  })).filter(cat => cat.load > 0);

  const doughnutData = {
    labels: categoryData.map(c => c.name),
    datasets: [
      {
        label: 'Load Distribution (W)',
        data: categoryData.map(c => c.load),
        backgroundColor: [
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(201, 203, 207, 0.8)',
          'rgba(100, 181, 246, 0.8)',
          'rgba(255, 99, 71, 0.8)',
          'rgba(144, 238, 144, 0.8)',
          'rgba(221, 160, 221, 0.8)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(201, 203, 207, 1)',
          'rgba(100, 181, 246, 1)',
          'rgba(255, 99, 71, 1)',
          'rgba(144, 238, 144, 1)',
          'rgba(221, 160, 221, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: categoryData.map(c => c.name),
    datasets: [
      {
        label: 'Power Consumption (W)',
        data: categoryData.map(c => c.load),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()}W (${percentage}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Load: ${context.parsed.y.toLocaleString()}W`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString() + 'W';
          },
        },
      },
    },
  };

  if (categoryData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500 text-center py-8">Add loads to see charts</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Load Distribution</h3>
        <div className="h-80">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Power Consumption by Category</h3>
        <div className="h-80">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}

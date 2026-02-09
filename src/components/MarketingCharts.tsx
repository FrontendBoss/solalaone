import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MarketingChartsProps {
  savings: {
    annualSavings: number;
    monthlySavings: number;
    federalCredit: number;
    stateCredit: number;
    stateRebate: number;
    totalIncentives: number;
    netCost: number;
    paybackYears: string;
    twentyFiveYearSavings: number;
    co2Offset: string;
    treesEquivalent: number;
    solarProduction: number;
  };
  formData: {
    installationCost: number;
    systemSize: number;
  };
}

export default function MarketingCharts({ savings, formData }: MarketingChartsProps) {
  const years = Array.from({ length: 26 }, (_, i) => i);
  const cumulativeSavingsData = years.map((year) => {
    if (year === 0) return -formData.installationCost + savings.totalIncentives;
    return (savings.annualSavings * year) - formData.installationCost + savings.totalIncentives;
  });

  const cumulativeSavingsChartData = {
    labels: years.map(y => `Year ${y}`),
    datasets: [
      {
        label: 'Cumulative Savings',
        data: cumulativeSavingsData,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyProductionData = months.map((_, idx) =>
    formData.systemSize * (80 + Math.sin(idx * Math.PI / 6) * 40)
  );

  const monthlyProductionChartData = {
    labels: months,
    datasets: [
      {
        label: 'Solar Production (kWh)',
        data: monthlyProductionData,
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
      },
    ],
  };

  const monthlySavingsData = months.map((_, idx) => {
    const seasonalVariation = 0.8 + (Math.sin(idx * Math.PI / 6) * 0.4);
    return savings.monthlySavings * seasonalVariation;
  });

  const monthlySavingsChartData = {
    labels: months,
    datasets: [
      {
        label: 'Monthly Savings ($)',
        data: monthlySavingsData,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
    ],
  };

  const twentyYears = Array.from({ length: 20 }, (_, i) => i + 1);
  const degradationRate = 0.005;
  const energyCostIncrease = 0.022;
  const yearlySavingsData = twentyYears.map((year) => {
    const systemEfficiency = 1 - (degradationRate * year);
    const energyPriceMultiplier = Math.pow(1 + energyCostIncrease, year);
    return savings.annualSavings * systemEfficiency * energyPriceMultiplier;
  });

  const yearlySavingsChartData = {
    labels: twentyYears.map(y => `Year ${y}`),
    datasets: [
      {
        label: 'Annual Savings',
        data: yearlySavingsData,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  };

  const incentiveBreakdownData = {
    labels: ['Federal Tax Credit', 'State Credit', 'State Rebate', 'Out of Pocket'],
    datasets: [
      {
        label: 'Cost Breakdown',
        data: [
          savings.federalCredit,
          savings.stateCredit,
          savings.stateRebate,
          savings.netCost,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: $${Math.round(context.parsed.y).toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
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
            return `${context.parsed.y.toFixed(0)} kWh`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString() + ' kWh';
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const savingsBarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `$${Math.round(context.parsed.y).toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
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
            size: 12,
          },
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label}: $${value.toLocaleString()}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
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
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Cumulative Savings Over 25 Years</h3>
        <div className="h-80">
          <Line data={cumulativeSavingsChartData} options={lineOptions} />
        </div>
        <p className="text-sm text-gray-600 mt-3 text-center">
          Break-even point at Year {savings.paybackYears}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Installation Cost Breakdown</h3>
        <div className="h-80">
          <Doughnut data={incentiveBreakdownData} options={doughnutOptions} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Solar Production</h3>
        <div className="h-80">
          <Bar data={monthlyProductionChartData} options={barOptions} />
        </div>
        <p className="text-sm text-gray-600 mt-3 text-center">
          Annual production: {savings.solarProduction.toLocaleString()} kWh
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Savings Breakdown</h3>
        <div className="h-80">
          <Bar data={monthlySavingsChartData} options={savingsBarOptions} />
        </div>
        <p className="text-sm text-gray-600 mt-3 text-center">
          Average: ${savings.monthlySavings.toLocaleString()}/month
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Annual Savings Growth (20 Years)</h3>
        <div className="h-80">
          <Line data={yearlySavingsChartData} options={lineOptions} />
        </div>
        <p className="text-sm text-gray-600 mt-3 text-center">
          Savings increase over time as electricity rates rise
        </p>
      </div>
    </div>
  );
}

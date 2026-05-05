import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  BarChart3, PieChart, Activity, 
  TrendingUp, ShieldAlert, Download, Calendar
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulating API delay
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const barData = {
    labels: ['Eng', 'Product', 'Ops', 'HR', 'Fin', 'Sales'],
    datasets: [{
      label: 'Access Points',
      data: [42, 28, 65, 12, 18, 31],
      backgroundColor: 'rgba(99, 102, 241, 0.6)',
      borderColor: '#6366f1',
      borderWidth: 1,
      borderRadius: 6,
    }]
  };

  const pieData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [15, 25, 40, 20],
      backgroundColor: [
        'rgba(239, 68, 68, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(99, 102, 241, 0.7)',
        'rgba(148, 163, 184, 0.7)',
      ],
      borderWidth: 0,
    }]
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      fill: true,
      label: 'Revocations',
      data: [5, 12, 8, 15, 22, 18],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } },
    },
    scales: {
      y: { grid: { color: '#1e1e24' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };

  if (loading) return <div className="p-8">Synthesizing intelligence...</div>;

  return (
    <div className="fade-in">
      <div className="flex-between mb-8">
        <div>
          <h2 className="page-title">Compliance Analytics</h2>
          <p className="page-subtitle">Deep insights into organizational risk and access patterns.</p>
        </div>
        <div className="flex gap-3">
          <div className="btn btn-secondary">
             <Calendar size={16} /> Last 6 Months
          </div>
          <button className="btn btn-primary">
            <Download size={18} /> Export PDF Report
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h3 className="text-sm font-bold uppercase tracking-widest text-dim mb-6">Access distribution by Department</h3>
          <Bar data={barData} options={chartOptions} />
        </div>
        <div className="card">
          <h3 className="text-sm font-bold uppercase tracking-widest text-dim mb-6">Asset Criticality mix</h3>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <Pie data={pieData} options={{...chartOptions, scales: { x: { display: false }, y: { display: false } } }} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-bold uppercase tracking-widest text-dim mb-6">Access hygiene trend (Revocations)</h3>
        <Line data={lineData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Analytics;

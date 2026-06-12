import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [equity, setEquity] = useState([]);

  useEffect(() => {
    async function load() {
      const s = await axios.get('/api/analytics/summary');
      setSummary(s.data);
      const m = await axios.get('/api/analytics/monthly');
      setMonthly(m.data);
      const e = await axios.get('/api/analytics/equity');
      setEquity(e.data);
    }
    load();
  }, []);

  const monthlyData = {
    labels: monthly.map((m) => m.month),
    datasets: [
      {
        label: 'Monthly P/L',
        data: monthly.map((m) => m.profit),
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.2,
      },
    ],
  };

  const equityData = {
    labels: equity.map((p) => new Date(p.date).toLocaleString()),
    datasets: [
      {
        label: 'Equity Curve',
        data: equity.map((p) => p.equity),
        borderColor: 'rgba(153,102,255,1)',
        tension: 0.2,
      },
    ],
  };

  return (
    <div>
      <section>
        <h2>Summary</h2>
        {summary ? (
          <ul>
            <li>Win Rate: {summary.winRate}%</li>
            <li>Profit Factor: {String(summary.profitFactor)}</li>
            <li>Average RR: {String(summary.averageRR)}</li>
            <li>Max Drawdown: {summary.maxDrawdown}</li>
            <li>Average Profit: {summary.averageProfit}</li>
            <li>Average Loss: {summary.averageLoss}</li>
          </ul>
        ) : (
          <div>Loading...</div>
        )}
      </section>

      <section>
        <h2>Monthly Performance</h2>
        <Line data={monthlyData} />
      </section>

      <section>
        <h2>Equity Curve</h2>
        <Line data={equityData} />
      </section>
    </div>
  );
}

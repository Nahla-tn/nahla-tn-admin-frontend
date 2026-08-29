'use client';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useUserStore } from '@/lib/store/userStore';

const COLORS = ['#94a3b8', '#3b82f6', '#f59e0b']; // Gray, Blue, Amber

export default function StatusChart() {
  const fetchSubscriptionStats = useUserStore((state) => state.fetchSubscriptionStats);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchSubscriptionStats().then(stats => {
      setData([
        { name: 'Gratuit', value: stats.FREE || 0 },
        { name: 'Plus', value: stats.PLUS || 0 },
        { name: 'Premium', value: stats.PREMIUM || 0 },
      ]);
    });
  }, [fetchSubscriptionStats]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export const ScoreHistoryChart = ({ historyData }) => {
  if (!historyData || historyData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No test attempt history recorded yet.
      </div>
    );
  }

  const formattedData = historyData.map((item, idx) => ({
    attempt: `Attempt ${idx + 1}`,
    score: item.score,
    difficulty: item.difficulty,
    date: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="attempt" stroke="#94a3b8" fontSize={12} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} unit="%" />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
            formatter={(value) => [`${value}%`, 'Score']}
          />
          <ReferenceLine y={80} label={{ value: 'Mastery (80%)', fill: '#10b981', fontSize: 11 }} stroke="#10b981" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 8, fill: '#60a5fa' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TopicMasteryChart = ({ topics }) => {
  if (!topics || topics.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No topics to display.
      </div>
    );
  }

  const data = topics.map((t) => ({
    name: t.name,
    mastery: t.mastery,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} unit="%" />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
            formatter={(value) => [`${value}%`, 'Mastery']}
          />
          <Bar dataKey="mastery" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

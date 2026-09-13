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
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm font-semibold">
        <span>No test attempt history recorded yet.</span>
        <span className="text-xs text-slate-400 mt-1">Complete your first test to see score trends!</span>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
          <XAxis dataKey="attempt" stroke="#475569" fontSize={12} fontWeight={700} />
          <YAxis domain={[0, 100]} stroke="#475569" fontSize={12} fontWeight={700} unit="%" />
          <Tooltip
            contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #1E293B', borderRadius: '16px', color: '#1E293B', fontWeight: 800, boxShadow: '3px 3px 0px 0px #1E293B' }}
            formatter={(value) => [`${value}%`, 'Score']}
          />
          <ReferenceLine y={80} label={{ value: 'Mastery (80%)', fill: '#10B981', fontSize: 11, fontWeight: 800 }} stroke="#10B981" strokeDasharray="4 4" strokeWidth={2} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#0284C7"
            strokeWidth={4}
            dot={{ fill: '#FFD12E', r: 6, stroke: '#1E293B', strokeWidth: 2 }}
            activeDot={{ r: 8, fill: '#FFD12E', stroke: '#1E293B', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TopicMasteryChart = ({ topics }) => {
  if (!topics || topics.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm font-semibold">
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
          <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
          <XAxis dataKey="name" stroke="#475569" fontSize={12} fontWeight={700} />
          <YAxis domain={[0, 100]} stroke="#475569" fontSize={12} fontWeight={700} unit="%" />
          <Tooltip
            contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #1E293B', borderRadius: '16px', color: '#1E293B', fontWeight: 800, boxShadow: '3px 3px 0px 0px #1E293B' }}
            formatter={(value) => [`${value}%`, 'Mastery']}
          />
          <Bar dataKey="mastery" fill="#FFD12E" stroke="#1E293B" strokeWidth={2} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


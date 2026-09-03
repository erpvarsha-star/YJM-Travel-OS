import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { FlightOption } from '../types';

interface VisualAnalysisProps {
  options: FlightOption[];
}

const VisualAnalysis: React.FC<VisualAnalysisProps> = ({ options }) => {
  
  // Transform data for the chart
  const data = options.map(opt => {
    // Parse price
    const price = parseInt(opt.Total_Price_USD.replace(/[^0-9]/g, ''), 10);
    
    // Parse duration roughly to hours (e.g. "20h 45m" -> 20.75)
    let hours = 0;
    const hMatch = opt.Total_Duration.match(/(\d+)h/);
    const mMatch = opt.Total_Duration.match(/(\d+)m/);
    
    if (hMatch) hours += parseInt(hMatch[1], 10);
    if (mMatch) hours += parseInt(mMatch[1], 10) / 60;
    
    return {
      name: opt.Option_Type,
      price: price,
      duration: parseFloat(hours.toFixed(1)),
      color: opt.Option_Type === 'Recommended' ? '#0ea5e9' : opt.Option_Type === 'Fastest' ? '#a855f7' : '#22c55e'
    };
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 mt-8">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Comparative Analysis</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} />
            <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{paddingTop: '20px'}} />
            <Bar dataKey="price" name="Price ($)" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
            </Bar>
            <Bar dataKey="duration" name="Duration (Hours)" radius={[0, 4, 4, 0]} barSize={20} fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-xs text-slate-400 mt-2">Comparison of Price vs Duration for selected options.</p>
    </div>
  );
};

export default VisualAnalysis;
import React from 'react';
import { WeatherData } from '../types';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudDrizzle,
  CloudFog,
  CloudSun,
  Thermometer
} from 'lucide-react';

interface WeatherWidgetProps {
  data: WeatherData;
}

// WMO Weather Code mapping
const getWeatherIcon = (code: number, size: number = 24, className: string = "") => {
  // 0: Clear sky
  if (code === 0) return <Sun size={size} className={`text-amber-500 ${className}`} />;
  
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  if (code === 1) return <CloudSun size={size} className={`text-amber-400 ${className}`} />;
  if (code === 2) return <CloudSun size={size} className={`text-slate-400 ${className}`} />;
  if (code === 3) return <Cloud size={size} className={`text-slate-500 ${className}`} />;
  
  // 45, 48: Fog
  if (code === 45 || code === 48) return <CloudFog size={size} className={`text-slate-400 ${className}`} />;
  
  // 51, 53, 55: Drizzle
  if (code >= 51 && code <= 57) return <CloudDrizzle size={size} className={`text-blue-300 ${className}`} />;
  
  // 61, 63, 65: Rain
  if (code >= 61 && code <= 67) return <CloudRain size={size} className={`text-blue-500 ${className}`} />;
  
  // 71, 73, 75: Snow
  if (code >= 71 && code <= 77) return <CloudSnow size={size} className={`text-sky-200 ${className}`} />;
  
  // 80, 81, 82: Rain showers
  if (code >= 80 && code <= 82) return <CloudRain size={size} className={`text-blue-400 ${className}`} />;
  
  // 95, 96, 99: Thunderstorm
  if (code >= 95 && code <= 99) return <CloudLightning size={size} className={`text-purple-500 ${className}`} />;

  return <Sun size={size} className={`text-amber-500 ${className}`} />;
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ data }) => {
  return (
    <div className="mt-4 mb-2 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-700">{data.location}</h4>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-3xl font-bold text-slate-900">{data.currentTemp}°</span>
             {getWeatherIcon(data.currentWeatherCode, 32)}
          </div>
        </div>
        <div className="text-right">
           <div className="bg-white/60 p-2 rounded-lg">
             <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Current</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {data.daily.map((day, idx) => (
          <div key={idx} className="bg-white/80 rounded-lg p-2 text-center flex flex-col items-center shadow-sm">
            <span className="text-xs font-medium text-slate-500 mb-1">{formatDate(day.date)}</span>
            <div className="my-1">
              {getWeatherIcon(day.weatherCode, 20)}
            </div>
            <div className="flex items-center gap-1 text-xs font-medium">
              <span className="text-slate-800">{day.maxTemp}°</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-500">{day.minTemp}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
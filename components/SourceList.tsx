import React from 'react';
import { Source } from '../types';
import { ExternalLink, Globe } from 'lucide-react';

interface SourceListProps {
  sources: Source[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-slate-100">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
        <Globe size={12} />
        Sources
      </h4>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <a
            key={`${source.uri}-${index}`}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 max-w-full sm:max-w-[240px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 transition-all duration-200 text-left"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                {source.title}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {new URL(source.uri).hostname}
              </p>
            </div>
            <ExternalLink size={12} className="text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};
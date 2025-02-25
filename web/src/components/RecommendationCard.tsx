import React from 'react';
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  LinkIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface RecommendationCardProps {
  category: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  url: string;
  onAnalyze: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  category,
  recommendation,
  impact,
  url,
  onAnalyze
}) => {
  // Get icon based on category
  const getIcon = () => {
    switch (category.toLowerCase()) {
      case 'content':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'structure':
        return <LinkIcon className="h-5 w-5" />;
      case 'e-e-a-t':
        return <DocumentMagnifyingGlassIcon className="h-5 w-5" />;
      default:
        return <ChartBarIcon className="h-5 w-5" />;
    }
  };

  // Get style based on impact
  const getImpactStyle = () => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start mb-4">
        <div className={`p-2 rounded-full bg-indigo-100 text-indigo-600 mr-4`}>
          {getIcon()}
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="text-sm font-medium text-gray-900 mr-2">{category}</h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactStyle()}`}
            >
              {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4 min-h-[80px]">{recommendation}</p>
      
      <div className="mt-auto flex justify-between items-center text-sm">
        <a 
          href={url} 
          className="text-indigo-600 hover:text-indigo-800 font-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Page
        </a>
        <button
          onClick={onAnalyze}
          className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none"
        >
          Analyze
          <DocumentMagnifyingGlassIcon className="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
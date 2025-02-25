import React from 'react';

interface TopicCoverageChartProps {
  data: {
    name: string;
    yourCoverage: number;
    avgCompetitorCoverage: number;
  }[];
}

const TopicCoverageChart: React.FC<TopicCoverageChartProps> = ({ data }) => {
  // If no data is provided, use mock data
  const chartData = data.length > 0 ? data : [
    { name: 'SEO', yourCoverage: 85, avgCompetitorCoverage: 72 },
    { name: 'Content Marketing', yourCoverage: 68, avgCompetitorCoverage: 75 },
    { name: 'Social Media', yourCoverage: 92, avgCompetitorCoverage: 80 },
    { name: 'Email Marketing', yourCoverage: 45, avgCompetitorCoverage: 65 },
    { name: 'Analytics', yourCoverage: 72, avgCompetitorCoverage: 58 }
  ];

  return (
    <div>
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
          <span className="text-sm text-gray-600">Your Coverage</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
          <span className="text-sm text-gray-600">Avg. Competitor Coverage</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {chartData.map((topic, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{topic.name}</span>
              <div className="flex space-x-2">
                <span className="text-sm text-indigo-600">{topic.yourCoverage}%</span>
                <span className="text-sm text-gray-500">{topic.avgCompetitorCoverage}%</span>
              </div>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full">
              {/* Competitor coverage bar */}
              <div
                className="absolute h-2 bg-gray-400 rounded-full"
                style={{ width: `${topic.avgCompetitorCoverage}%` }}
              ></div>
              
              {/* Your coverage bar */}
              <div
                className="absolute h-2 bg-indigo-500 rounded-full"
                style={{ width: `${topic.yourCoverage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis</h4>
        <p className="text-sm text-gray-600">
          Your content coverage is stronger than competitors in SEO, Social Media, and Analytics. 
          Consider developing more content in Content Marketing and Email Marketing where 
          competitors have better coverage.
        </p>
      </div>
    </div>
  );
};

export default TopicCoverageChart;
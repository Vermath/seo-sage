import React from 'react';

interface TopicOpportunity {
  topic: string;
  searchVolume: number;
  difficulty: number;
  yourPosition: number | null;
  competitorPositions: number[];
  opportunity: 'high' | 'medium' | 'low';
}

interface TopicOpportunityTableProps {
  opportunities: TopicOpportunity[];
}

const TopicOpportunityTable: React.FC<TopicOpportunityTableProps> = ({ opportunities }) => {
  // If no data is provided, use mock data
  const tableData = opportunities.length > 0 ? opportunities : [
    {
      topic: 'Email Marketing Automation',
      searchVolume: 12500,
      difficulty: 42,
      yourPosition: null,
      competitorPositions: [3, 5, 8],
      opportunity: 'high'
    },
    {
      topic: 'Content Distribution Strategies',
      searchVolume: 8300,
      difficulty: 38,
      yourPosition: 24,
      competitorPositions: [1, 4, 7],
      opportunity: 'high'
    },
    {
      topic: 'SEO for Voice Search',
      searchVolume: 5400,
      difficulty: 45,
      yourPosition: 12,
      competitorPositions: [2, 9, 15],
      opportunity: 'medium'
    }
  ];

  // Helper to format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper to get opportunity badge color
  const getOpportunityColor = (opportunity: string): string => {
    switch (opportunity) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white divide-y divide-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Topic
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Search Volume
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Difficulty
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Your Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Competitor Positions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Opportunity
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tableData.map((item, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.topic}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatNumber(item.searchVolume)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${item.difficulty}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{item.difficulty}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.yourPosition === null ? (
                  <span className="text-gray-400">-</span>
                ) : (
                  <span className={item.yourPosition <= 10 ? 'text-green-600 font-medium' : ''}>
                    {item.yourPosition}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex space-x-1">
                  {item.competitorPositions.map((position, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-md text-xs ${
                        position <= 3
                          ? 'bg-red-100 text-red-800'
                          : position <= 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {position}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getOpportunityColor(
                    item.opportunity
                  )}`}
                >
                  {item.opportunity.charAt(0).toUpperCase() + item.opportunity.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopicOpportunityTable;
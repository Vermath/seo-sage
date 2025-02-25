import React from 'react';

interface ContentQualityChartProps {
  data: {
    quality: string;
    count: number;
    color: string;
  }[];
}

const ContentQualityChart: React.FC<ContentQualityChartProps> = ({ data }) => {
  // If no data is provided, show mock data
  const chartData = data.length > 0 ? data : [
    { quality: 'Excellent', count: 15, color: '#10B981' },
    { quality: 'Good', count: 37, color: '#60A5FA' },
    { quality: 'Average', count: 42, color: '#FBBF24' },
    { quality: 'Poor', count: 21, color: '#F87171' },
    { quality: 'Critical', count: 8, color: '#EF4444' }
  ];

  // Calculate total for percentages
  const total = chartData.reduce((acc, item) => acc + item.count, 0);

  return (
    <div>
      <div className="flex justify-between mb-2">
        <div className="flex flex-wrap gap-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-600">{item.quality}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
        {chartData.map((item, index) => {
          // Calculate width percentage based on count
          const width = (item.count / total) * 100;
          
          // Calculate left position based on previous items
          const left = chartData
            .slice(0, index)
            .reduce((acc, prevItem) => acc + (prevItem.count / total) * 100, 0);
            
          return (
            <div
              key={index}
              className="absolute h-full"
              style={{
                width: `${width}%`,
                left: `${left}%`,
                backgroundColor: item.color
              }}
            ></div>
          );
        })}
      </div>
      
      <div className="mt-6">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left font-medium text-gray-500">Content Quality</th>
              <th className="text-right font-medium text-gray-500">Pages</th>
              <th className="text-right font-medium text-gray-500">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    {item.quality}
                  </div>
                </td>
                <td className="text-right py-2">{item.count}</td>
                <td className="text-right py-2">{((item.count / total) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContentQualityChart;
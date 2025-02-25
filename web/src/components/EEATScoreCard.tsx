import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface EEATScoreCardProps {
  title: string;
  score: number;
  change: number;
}

const EEATScoreCard: React.FC<EEATScoreCardProps> = ({ title, score, change }) => {
  // Get the score color based on score value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Format the score as a letter grade
  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    if (score >= 35) return 'D-';
    return 'F';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <div className="flex items-baseline">
          <p className={`text-3xl font-bold ${getScoreColor(score)}`}>{getScoreGrade(score)}</p>
          <p className="ml-2 text-sm text-gray-500">{score}%</p>
        </div>
        <div className="flex items-center">
          {change > 0 ? (
            <>
              <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm font-medium text-green-500">+{change}%</span>
            </>
          ) : change < 0 ? (
            <>
              <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-sm font-medium text-red-500">{change}%</span>
            </>
          ) : (
            <span className="text-sm font-medium text-gray-500">0%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EEATScoreCard;
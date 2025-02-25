import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import { fetchPageAnalysis } from '../api/analysis';

type ContentSection = {
  id: string;
  isOpen: boolean;
};

const ContentAnalysisModal: React.FC<{
  pageUrl: string;
  onClose: () => void;
}> = ({ pageUrl, onClose }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categoryAssessments: true,
    recommendations: true,
    improvement: false
  });

  // Fetch page analysis data
  const { data, isLoading, error } = useQuery(
    ['pageAnalysis', pageUrl],
    () => fetchPageAnalysis(pageUrl),
    { enabled: !!pageUrl }
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Grade color mapping
  const getGradeColor = (grade: string): string => {
    const firstChar = grade.charAt(0).toUpperCase();
    switch (firstChar) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Score color mapping for progress bars
  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-yellow-500';
    if (score >= 0.2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Impact badge styling
  const getImpactBadgeStyle = (impact: string): string => {
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

  if (isLoading) {
    return (
      <Dialog open={true} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-lg font-semibold">Content Analysis</Dialog.Title>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="py-12 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
                <p className="mt-4 text-gray-600">Loading content analysis...</p>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    );
  }

  if (error || !data) {
    return (
      <Dialog open={true} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-lg font-semibold">Content Analysis</Dialog.Title>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="py-12 text-center">
                <p className="text-red-500">Error loading analysis data. Please try again.</p>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
            {/* Header with close button */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <Dialog.Title className="text-xl font-semibold">Content Analysis</Dialog.Title>
                <p className="text-sm text-gray-600 truncate max-w-md">{data.url}</p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* EEAT Score Summary */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-lg font-medium">EEAT Score Summary</h2>
                <div className="flex items-center mt-2 sm:mt-0">
                  <span className="text-sm text-gray-600 mr-2">Overall:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(data.eeat_score.grade)}`}>
                    {data.eeat_score.grade}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Experience Score */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium text-gray-700">Experience</div>
                    <div className="text-sm text-gray-600">{Math.round(data.eeat_score.experience * 100)}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getScoreColor(data.eeat_score.experience)} h-2 rounded-full`}
                      style={{ width: `${data.eeat_score.experience * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Expertise Score */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium text-gray-700">Expertise</div>
                    <div className="text-sm text-gray-600">{Math.round(data.eeat_score.expertise * 100)}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getScoreColor(data.eeat_score.expertise)} h-2 rounded-full`}
                      style={{ width: `${data.eeat_score.expertise * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Authoritativeness Score */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium text-gray-700">Authoritativeness</div>
                    <div className="text-sm text-gray-600">{Math.round(data.eeat_score.authoritativeness * 100)}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getScoreColor(data.eeat_score.authoritativeness)} h-2 rounded-full`}
                      style={{ width: `${data.eeat_score.authoritativeness * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Trustworthiness Score */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium text-gray-700">Trustworthiness</div>
                    <div className="text-sm text-gray-600">{Math.round(data.eeat_score.trustworthiness * 100)}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getScoreColor(data.eeat_score.trustworthiness)} h-2 rounded-full`}
                      style={{ width: `${data.eeat_score.trustworthiness * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Overall Score */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium text-gray-700">Overall</div>
                    <div className="text-sm text-gray-600">{Math.round(data.eeat_score.overall * 100)}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getScoreColor(data.eeat_score.overall)} h-2 rounded-full`}
                      style={{ width: `${data.eeat_score.overall * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Assessments */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('categoryAssessments')}
                className="flex w-full items-center justify-between bg-gray-50 p-3 rounded-lg mb-3"
              >
                <h2 className="text-lg font-medium">Category Assessments</h2>
                {expandedSections.categoryAssessments ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedSections.categoryAssessments && (
                <div className="space-y-4 mt-4">
                  {Object.entries(data.category_assessments).map(([category, assessment]) => (
                    <div key={category} className="border-b pb-4 last:border-0">
                      <h3 className="text-md font-medium mb-2 capitalize">{category.replace(/_/g, ' ')}</h3>
                      <p className="text-gray-700">{assessment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('recommendations')}
                className="flex w-full items-center justify-between bg-gray-50 p-3 rounded-lg mb-3"
              >
                <h2 className="text-lg font-medium">Recommendations</h2>
                {expandedSections.recommendations ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedSections.recommendations && (
                <div className="space-y-4 mt-4">
                  {data.recommendations.map((recommendation, index) => (
                    <div key={index} className="border-l-4 border-indigo-400 bg-indigo-50 p-4 rounded-r-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-md font-medium capitalize">{recommendation.category.replace(/_/g, ' ')}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getImpactBadgeStyle(recommendation.impact)}`}>
                          {recommendation.impact} impact
                        </span>
                      </div>
                      
                      {recommendation.content_section && (
                        <div className="bg-white border border-gray-200 p-2 rounded text-sm text-gray-700 mb-2 italic">
                          "{recommendation.content_section}"
                        </div>
                      )}
                      
                      <p className="text-gray-700 mb-2">{recommendation.recommendation}</p>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Suggested Improvement:</p>
                        <p className="text-sm text-gray-600">{recommendation.improvement_suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Improvement Opportunities */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('improvement')}
                className="flex w-full items-center justify-between bg-gray-50 p-3 rounded-lg mb-3"
              >
                <h2 className="text-lg font-medium">Improvement Opportunities</h2>
                {expandedSections.improvement ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedSections.improvement && (
                <div className="space-y-4 mt-4">
                  {data.improvement_opportunities.map((opportunity, index) => (
                    <div key={index} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-md font-medium capitalize">{opportunity.type.replace(/_/g, ' ')}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {Math.round(opportunity.estimated_impact * 100)}% impact
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{opportunity.description}</p>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Suggestion:</p>
                        <p className="text-sm text-gray-600">{opportunity.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
              >
                Create Content Brief
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default ContentAnalysisModal;
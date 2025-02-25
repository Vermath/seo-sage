import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import WebsiteSelector from '../components/WebsiteSelector';
import EEATScoreCard from '../components/EEATScoreCard';
import ContentQualityChart from '../components/ContentQualityChart';
import TopicCoverageChart from '../components/TopicCoverageChart';
import RecommendationCard from '../components/RecommendationCard';
import ContentAnalysisModal from '../components/ContentAnalysisModal';
import TopicOpportunityTable from '../components/TopicOpportunityTable';
import { fetchWebsiteOverview, fetchTopicAnalysis } from '../api/dashboard';

const Dashboard: React.FC = () => {
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedPageUrl, setSelectedPageUrl] = useState<string | null>(null);

  // Fetch website overview data
  const { data: websiteData, isLoading: isLoadingWebsite, error: websiteError } = useQuery(
    ['websiteOverview', selectedWebsite],
    () => fetchWebsiteOverview(selectedWebsite!),
    { enabled: !!selectedWebsite }
  );

  // Fetch topic analysis data
  const { data: topicData, isLoading: isLoadingTopics } = useQuery(
    ['topicAnalysis', selectedWebsite],
    () => fetchTopicAnalysis(selectedWebsite!),
    { enabled: !!selectedWebsite }
  );

  const handleWebsiteChange = (websiteId: string) => {
    setSelectedWebsite(websiteId);
  };

  const openPageAnalysis = (pageUrl: string) => {
    setSelectedPageUrl(pageUrl);
    setShowAnalysisModal(true);
  };

  if (!selectedWebsite) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <GlobeAltIcon className="w-16 h-16 mx-auto text-indigo-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to SEO Sage</h1>
          <p className="text-gray-600 mb-6">
            Select a website to view its performance dashboard, content analysis, and optimization recommendations.
          </p>
          <div className="mb-6">
            <WebsiteSelector onSelect={handleWebsiteChange} />
          </div>
          <p className="text-sm text-gray-500">
            Don't see your website? <a href="/websites/add" className="text-indigo-600 hover:text-indigo-800">Add a new website</a>
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingWebsite) {
    return <div className="p-8 text-center">Loading website data...</div>;
  }

  if (websiteError) {
    return <div className="p-8 text-center text-red-500">Error loading website data. Please try again.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{websiteData?.name || 'Website'} Dashboard</h1>
            <p className="text-gray-600">{websiteData?.url}</p>
          </div>
          <WebsiteSelector 
            onSelect={handleWebsiteChange} 
            currentSelection={selectedWebsite} 
          />
        </div>
      </div>

      {/* EEAT Score Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">EEAT Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <EEATScoreCard 
            title="Experience" 
            score={websiteData?.eeat_scores.experience || 0} 
            change={websiteData?.eeat_changes.experience || 0} 
          />
          <EEATScoreCard 
            title="Expertise" 
            score={websiteData?.eeat_scores.expertise || 0} 
            change={websiteData?.eeat_changes.expertise || 0} 
          />
          <EEATScoreCard 
            title="Authoritativeness" 
            score={websiteData?.eeat_scores.authoritativeness || 0} 
            change={websiteData?.eeat_changes.authoritativeness || 0} 
          />
          <EEATScoreCard 
            title="Trustworthiness" 
            score={websiteData?.eeat_scores.trustworthiness || 0} 
            change={websiteData?.eeat_changes.trustworthiness || 0} 
          />
        </div>
      </div>

      {/* Content Quality and Topic Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Content Quality Distribution</h2>
          <ContentQualityChart data={websiteData?.contentQualityDistribution || []} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Topic Coverage vs. Competitors</h2>
          {isLoadingTopics ? (
            <div className="text-center py-12">Loading topic data...</div>
          ) : (
            <TopicCoverageChart data={topicData?.topicCoverage || []} />
          )}
        </div>
      </div>

      {/* Top Recommendations */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websiteData?.topRecommendations.map((recommendation, index) => (
            <RecommendationCard
              key={index}
              category={recommendation.category}
              recommendation={recommendation.text}
              impact={recommendation.impact}
              url={recommendation.url}
              onAnalyze={() => openPageAnalysis(recommendation.url)}
            />
          ))}
        </div>
      </div>

      {/* Content Improvement Opportunities */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Content Improvement Opportunities</h2>
          <a
            href="/content-opportunities"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View all
          </a>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EEAT Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Improvement Potential
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {websiteData?.contentOpportunities.map((page, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {page.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {page.url}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{page.grade}</div>
                      <div className="text-sm text-gray-500">{page.score.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {page.issues.map((issue, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${page.improvementPotential * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-700">
                          {Math.round(page.improvementPotential * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => openPageAnalysis(page.url)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Topic Opportunities */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Topic Opportunities</h2>
          <a
            href="/topic-opportunities"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View all
          </a>
        </div>
        {isLoadingTopics ? (
          <div className="text-center py-12">Loading topic opportunities...</div>
        ) : (
          <TopicOpportunityTable opportunities={topicData?.topicOpportunities || []} />
        )}
      </div>

      {/* Content Analysis Modal */}
      {showAnalysisModal && (
        <ContentAnalysisModal
          pageUrl={selectedPageUrl!}
          onClose={() => setShowAnalysisModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
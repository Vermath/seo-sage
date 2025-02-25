// Mock data for the dashboard
// In a real application, these would be API calls to your backend

/**
 * Fetch website overview data
 */
export const fetchWebsiteOverview = async (websiteId: string) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: websiteId,
        name: websiteId === '1' ? 'Example Blog' : websiteId === '2' ? 'E-commerce Store' : 'Corporate Website',
        url: websiteId === '1' ? 'https://example.com' : websiteId === '2' ? 'https://store-example.com' : 'https://corporate-example.com',
        eeat_scores: {
          experience: 72,
          expertise: 85,
          authoritativeness: 63,
          trustworthiness: 78
        },
        eeat_changes: {
          experience: 5,
          expertise: 2,
          authoritativeness: -3,
          trustworthiness: 8
        },
        contentQualityDistribution: [
          { quality: 'Excellent', count: 15, color: '#10B981' },
          { quality: 'Good', count: 37, color: '#60A5FA' },
          { quality: 'Average', count: 42, color: '#FBBF24' },
          { quality: 'Poor', count: 21, color: '#F87171' },
          { quality: 'Critical', count: 8, color: '#EF4444' }
        ],
        topRecommendations: [
          {
            category: 'Content',
            text: 'Add more expert citations to your pillar content on the topic of "digital marketing"',
            impact: 'high',
            url: '/blog/digital-marketing-guide'
          },
          {
            category: 'E-E-A-T',
            text: 'Add author credentials and experience to blog authors on medical topics',
            impact: 'high',
            url: '/blog/health-wellness'
          },
          {
            category: 'Structure',
            text: 'Improve internal linking between related product pages',
            impact: 'medium',
            url: '/products/category/electronics'
          }
        ],
        contentOpportunities: [
          {
            title: 'Complete Guide to Digital Marketing',
            url: '/blog/digital-marketing-guide',
            grade: 'B-',
            score: 68.5,
            issues: ['Thin content', 'Few citations'],
            improvementPotential: 0.82
          },
          {
            title: 'How to Improve Your SEO in 2025',
            url: '/blog/seo-improvements-2025',
            grade: 'C+',
            score: 61.2,
            issues: ['Outdated content', 'Missing headings'],
            improvementPotential: 0.75
          },
          {
            title: 'Product Review: Latest Smartphones',
            url: '/blog/smartphone-reviews-2025',
            grade: 'D',
            score: 42.8,
            issues: ['No comparisons', 'Missing specs', 'Thin content'],
            improvementPotential: 0.93
          }
        ]
      });
    }, 500);
  });
};

/**
 * Fetch topic analysis data
 */
export const fetchTopicAnalysis = async (websiteId: string) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        topicCoverage: [
          { name: 'SEO', yourCoverage: 85, avgCompetitorCoverage: 72 },
          { name: 'Content Marketing', yourCoverage: 68, avgCompetitorCoverage: 75 },
          { name: 'Social Media', yourCoverage: 92, avgCompetitorCoverage: 80 },
          { name: 'Email Marketing', yourCoverage: 45, avgCompetitorCoverage: 65 },
          { name: 'Analytics', yourCoverage: 72, avgCompetitorCoverage: 58 }
        ],
        topicOpportunities: [
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
          },
          {
            topic: 'Video Marketing Tips',
            searchVolume: 9200,
            difficulty: 51,
            yourPosition: 18,
            competitorPositions: [4, 6, 11],
            opportunity: 'medium'
          },
          {
            topic: 'Social Media ROI Measurement',
            searchVolume: 3800,
            difficulty: 35,
            yourPosition: 7,
            competitorPositions: [2, 12, 18],
            opportunity: 'low'
          }
        ]
      });
    }, 600);
  });
};
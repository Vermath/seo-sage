// Mock API for content analysis data

/**
 * Fetch content analysis for a page
 */
export const fetchContentAnalysis = async (pageUrl: string) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url: pageUrl,
        title: 'Complete Guide to Digital Marketing',
        wordCount: 1845,
        readability: {
          score: 68,
          grade: 'C+',
          issues: [
            'Sentences are too long in paragraphs 2 and 8',
            'Consider adding more subheadings to break up content'
          ]
        },
        seoScore: 72,
        keywordDensity: [
          { keyword: 'digital marketing', count: 32, density: 1.73 },
          { keyword: 'SEO', count: 18, density: 0.98 },
          { keyword: 'content strategy', count: 14, density: 0.76 },
          { keyword: 'social media', count: 21, density: 1.14 },
          { keyword: 'analytics', count: 11, density: 0.60 }
        ],
        contentGaps: [
          'Email marketing automation tools comparison',
          'Mobile marketing strategies',
          'ROI measurement frameworks'
        ],
        eeatAnalysis: {
          experience: {
            score: 62,
            issues: ['Limited real-world examples', 'No clear author industry experience'],
            recommendations: ['Add case studies', 'Include author bio with industry experience']
          },
          expertise: {
            score: 78,
            issues: ['Some technical claims without citations'],
            recommendations: ['Add citations to recent studies', 'Link to authoritative sources']
          },
          authoritativeness: {
            score: 65,
            issues: ['Few backlinks from industry sites'],
            recommendations: ['Include quotes from recognized experts', 'Add testimonials']
          },
          trustworthiness: {
            score: 81,
            issues: ['Some outdated statistics from 2022'],
            recommendations: ['Update statistics to 2025 data', 'Add last updated timestamp']
          }
        },
        competitorComparison: [
          {
            competitor: 'Industry Leader',
            url: 'https://example-competitor.com/digital-marketing',
            wordCount: 2450,
            keywordGaps: ['marketing automation', 'content distribution'],
            strengths: ['Comprehensive case studies', 'Interactive tools']
          },
          {
            competitor: 'Marketing Expert',
            url: 'https://another-competitor.com/guide/digital-marketing',
            wordCount: 1950,
            keywordGaps: ['analytics integration', 'ROI tracking'],
            strengths: ['Video tutorials', 'Expert interviews']
          }
        ]
      });
    }, 800);
  });
};
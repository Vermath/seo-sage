from openai import OpenAI
import re
from typing import Dict, List, Optional, Tuple
import logging
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

class EEATScore(BaseModel):
    experience: float = Field(..., ge=0, le=1)
    expertise: float = Field(..., ge=0, le=1)
    authoritativeness: float = Field(..., ge=0, le=1)
    trustworthiness: float = Field(..., ge=0, le=1)
    overall: float = Field(..., ge=0, le=1)
    grade: str

class ContentRecommendation(BaseModel):
    category: str
    recommendation: str
    impact: str
    content_section: Optional[str] = None
    improvement_suggestion: str

class ImprovementOpportunity(BaseModel):
    type: str
    description: str
    suggestion: str
    estimated_impact: float = Field(..., ge=0, le=1)

class ContentAnalysisResult(BaseModel):
    eeat_score: EEATScore
    category_assessments: Dict[str, str]
    recommendations: List[ContentRecommendation]
    improvement_opportunities: List[ImprovementOpportunity]
    raw_response: Optional[str] = None

class ContentAnalyzer:
    """
    Advanced content analyzer that evaluates content based on Google's EEAT guidelines
    and provides actionable recommendations for improvement.
    """
    
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        """
        Initialize the content analyzer with OpenAI API key.
        
        Args:
            api_key: OpenAI API key
            model: OpenAI model to use (default: gpt-4o)
        """
        self.client = OpenAI(api_key=api_key)
        self.model = model
    
    def _build_eeat_prompt(self, content: str, url: Optional[str] = None) -> str:
        """
        Build a prompt for EEAT evaluation.
        
        Args:
            content: The content to evaluate
            url: Optional URL of the content
        
        Returns:
            str: The prompt for the AI model
        """
        context = f"URL: {url}\n\n" if url else ""
        
        return f"""---
        
**You are an expert SEO and content quality evaluator tasked with analyzing content according to Google's EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) guidelines. Your goal is to provide a comprehensive assessment and offer specific recommendations for improvement.**
        
Here is the content to evaluate:
        
{context}<content_to_evaluate>
{content}
</content_to_evaluate>
        
Please follow these steps to complete the evaluation:
        
1. Carefully analyze the content for quality, relevance, and adherence to EEAT principles.
        
2. Evaluate the content based on each category of the EEAT guidelines:
    
   a) Content Quality and Depth  
   b) Experience Demonstration  
   c) Expertise Signals  
   d) Authoritativeness Indicators  
   e) Trustworthiness Elements  
   f) People-First vs. Search Engine-First Content  
   g) User Engagement Potential  
   h) Content Structure and Organization
   i) Semantic Relevance to Target Topics
        
   For each category, consider specific strengths and weaknesses with examples from the content.
        
3. Provide numerical scores between 0.0 and 1.0 for each EEAT component:
   - Experience score
   - Expertise score
   - Authoritativeness score
   - Trustworthiness score
   - Overall EEAT score (weighted average)
   - Letter grade (A+ to F)
        
4. Develop 3-5 specific, actionable recommendations for improving the content's EEAT rating. Each recommendation should:
   - Identify the specific EEAT category it addresses
   - Reference the section of content that needs improvement
   - Provide a clear suggestion for enhancement
   - Estimate the impact level (high, medium, low)
        
5. Identify 2-3 content improvement opportunities that go beyond the existing content, such as:
   - Content gaps compared to competitors
   - Missing user intent coverage
   - Opportunities to demonstrate more expertise
   - Ways to enhance user engagement
   - Structural improvements

6. Format your response in JSON format as follows:

```json
{
  "eeat_score": {
    "experience": 0.0-1.0,
    "expertise": 0.0-1.0,
    "authoritativeness": 0.0-1.0,
    "trustworthiness": 0.0-1.0,
    "overall": 0.0-1.0,
    "grade": "letter grade"
  },
  "category_assessments": {
    "content_quality": "assessment text",
    "experience": "assessment text",
    "expertise": "assessment text",
    "authoritativeness": "assessment text",
    "trustworthiness": "assessment text",
    "people_first": "assessment text",
    "user_engagement": "assessment text",
    "structure": "assessment text",
    "semantic_relevance": "assessment text"
  },
  "recommendations": [
    {
      "category": "EEAT category",
      "recommendation": "specific recommendation",
      "content_section": "quoted content or section reference",
      "improvement_suggestion": "specific improvement details",
      "impact": "high|medium|low"
    },
    ...
  ],
  "improvement_opportunities": [
    {
      "type": "opportunity type",
      "description": "description of opportunity",
      "suggestion": "specific suggestion",
      "estimated_impact": 0.0-1.0
    },
    ...
  ]
}
```

Provide your evaluation based solely on the content provided and the EEAT guidelines. Be thorough, objective, and constructive in your assessment.
"""

    def analyze(self, content: str, url: Optional[str] = None, temperature: float = 0.2) -> ContentAnalysisResult:
        """
        Analyze content based on EEAT criteria using OpenAI API.
        
        Args:
            content: The content to analyze
            url: Optional URL for context
            temperature: Temperature setting for OpenAI API
            
        Returns:
            ContentAnalysisResult: Analysis results
        """
        prompt = self._build_eeat_prompt(content, url)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt},
                ],
                temperature=temperature,
                response_format={"type": "json_object"}
            )
            
            response_text = response.choices[0].message.content
            
            # Parse the JSON response
            import json
            result_data = json.loads(response_text)
            
            # Convert the parsed data to our Pydantic model
            analysis_result = ContentAnalysisResult(
                eeat_score=EEATScore(**result_data["eeat_score"]),
                category_assessments=result_data["category_assessments"],
                recommendations=[ContentRecommendation(**rec) for rec in result_data["recommendations"]],
                improvement_opportunities=[ImprovementOpportunity(**opp) for opp in result_data["improvement_opportunities"]],
                raw_response=response_text
            )
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analyzing content: {e}")
            raise
            
    def get_content_brief(self, topic: str, competitors_content: List[str] = None) -> Dict:
        """
        Generate a content brief for a given topic based on EEAT principles
        and competitor analysis.
        
        Args:
            topic: The topic to create a brief for
            competitors_content: List of competitor content on the same topic
            
        Returns:
            Dict: Content brief with structure, key points, and EEAT recommendations
        """
        # This would be implemented to generate content briefs
        # based on topic research and competitor analysis
        pass
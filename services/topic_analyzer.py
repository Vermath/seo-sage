from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from openai import OpenAI
import json
import logging
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict
import networkx as nx
from dataclasses import dataclass
import re

logger = logging.getLogger(__name__)

@dataclass
class TopicCluster:
    name: str
    relevance_score: float
    subtopics: List[str]
    content_coverage: float
    competitor_coverage: float
    semantic_gap: float
    related_urls: List[str]
    key_entities: List[str]
    user_intents: List[Dict[str, Any]]

class TopicAnalyzer:
    """
    Advanced topic analysis engine that identifies semantic topics, intent gaps,
    and content opportunities using AI and natural language processing.
    """
    
    def __init__(self, api_key: str, embedding_model: str = "text-embedding-3-small"):
        """
        Initialize the topic analyzer with OpenAI API key.
        
        Args:
            api_key: OpenAI API key
            embedding_model: OpenAI embedding model to use
        """
        self.client = OpenAI(api_key=api_key)
        self.embedding_model = embedding_model
        
    def get_embedding(self, text: str) -> List[float]:
        """
        Get embeddings for a text using OpenAI API.
        
        Args:
            text: Text to get embeddings for
            
        Returns:
            List[float]: Embedding vector
        """
        # Truncate text if it's too long
        if len(text) > 8000:
            text = text[:8000]
            
        try:
            response = self.client.embeddings.create(
                input=text,
                model=self.embedding_model
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error getting embedding: {e}")
            raise
    
    def extract_topics_from_content(self, content: str) -> List[Dict[str, Any]]:
        """
        Extract topics from content using OpenAI API.
        
        Args:
            content: Content to extract topics from
            
        Returns:
            List[Dict[str, Any]]: List of topics with metadata
        """
        # Define a prompt for topic extraction
        prompt = f"""Analyze the following content and identify the main topics and subtopics it covers.
For each topic, extract:
1. The topic name
2. Relevance to the overall content (0.0-1.0)
3. Key phrases associated with this topic
4. Entities mentioned (people, places, organizations, products)
5. User intents this topic addresses

Format your response as a JSON array of topic objects.

Content:
{content[:10000]}  # Truncate content if needed

Example output format:
```json
[
  {{
    "topic": "Technical SEO",
    "relevance": 0.85,
    "key_phrases": ["site speed", "mobile-friendly", "indexing"],
    "entities": ["Google", "Lighthouse", "Googlebot"],
    "user_intents": [
      {{ "intent": "How to improve site speed", "confidence": 0.9 }},
      {{ "intent": "Understanding mobile-first indexing", "confidence": 0.75 }}
    ]
  }}
]
```"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",  # Using the more capable model for complex analysis
                messages=[
                    {"role": "system", "content": "You are an expert SEO topic analyzer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            
            response_text = response.choices[0].message.content
            
            # Clean and parse the JSON response
            clean_json = re.sub(r'```json\s*|\s*```', '', response_text)
            topics_data = json.loads(clean_json)
            
            return topics_data.get("topics", []) if isinstance(topics_data, dict) else topics_data
            
        except Exception as e:
            logger.error(f"Error extracting topics: {e}")
            raise
    
    def compare_topic_coverage(
        self, 
        site_content: Dict[str, str], 
        competitor_content: Dict[str, Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Compare topic coverage between a site and its competitors.
        
        Args:
            site_content: Dict mapping URLs to content for the site
            competitor_content: Dict mapping competitor names to dicts of URLs to content
            
        Returns:
            Dict[str, Any]: Comparative topic analysis
        """
        # Extract topics from site content
        site_topics = self._extract_site_topics(site_content)
        
        # Extract topics from competitor content
        competitor_topics = {}
        for competitor, content_dict in competitor_content.items():
            competitor_topics[competitor] = self._extract_site_topics(content_dict)
        
        # Compare topic coverage
        topic_comparison = self._compare_topics(site_topics, competitor_topics)
        
        return topic_comparison
    
    def _extract_site_topics(self, content_dict: Dict[str, str]) -> Dict[str, Any]:
        """
        Extract topics from all content on a site.
        
        Args:
            content_dict: Dict mapping URLs to content
            
        Returns:
            Dict[str, Any]: Extracted topics with metadata
        """
        all_topics = []
        url_to_topics = {}
        
        for url, content in content_dict.items():
            try:
                page_topics = self.extract_topics_from_content(content)
                url_to_topics[url] = page_topics
                all_topics.extend(page_topics)
            except Exception as e:
                logger.error(f"Error extracting topics for {url}: {e}")
                continue
        
        # Deduplicate and cluster similar topics
        clustered_topics = self._cluster_topics(all_topics)
        
        # Map URLs to topic clusters
        for topic_cluster in clustered_topics:
            topic_cluster.related_urls = self._find_urls_for_topic(topic_cluster.name, url_to_topics)
        
        return {
            "topic_clusters": clustered_topics,
            "url_to_topics": url_to_topics,
        }
    
    def _cluster_topics(self, topics: List[Dict[str, Any]]) -> List[TopicCluster]:
        """
        Cluster similar topics together.
        
        Args:
            topics: List of extracted topics
            
        Returns:
            List[TopicCluster]: Clustered topics
        """
        if not topics:
            return []
        
        # Get embeddings for each topic
        try:
            topic_names = [topic["topic"] for topic in topics]
            embeddings = [self.get_embedding(name) for name in topic_names]
            
            # Convert to numpy array for similarity calculation
            embeddings_array = np.array(embeddings)
            
            # Calculate similarity matrix
            similarity_matrix = cosine_similarity(embeddings_array)
            
            # Create a graph for community detection
            G = nx.Graph()
            
            # Add nodes and edges with weights based on similarity
            for i in range(len(topic_names)):
                G.add_node(i, name=topic_names[i], data=topics[i])
                for j in range(i+1, len(topic_names)):
                    similarity = similarity_matrix[i, j]
                    if similarity > 0.75:  # Threshold for considering topics similar
                        G.add_edge(i, j, weight=similarity)
            
            # Detect communities (topic clusters)
            communities = nx.community.louvain_communities(G, weight='weight')
            
            # Create topic clusters from communities
            topic_clusters = []
            for community in communities:
                if not community:
                    continue
                    
                # Get the most central node in the community as the cluster name
                subgraph = G.subgraph(community)
                centrality = nx.degree_centrality(subgraph)
                central_node = max(centrality, key=centrality.get)
                
                cluster_name = G.nodes[central_node]["name"]
                
                # Collect all subtopics in this cluster
                subtopics = [G.nodes[node]["name"] for node in community if G.nodes[node]["name"] != cluster_name]
                
                # Calculate average relevance score
                relevance_score = np.mean([G.nodes[node]["data"]["relevance"] for node in community])
                
                # Collect key entities across all topics in the cluster
                key_entities = set()
                for node in community:
                    node_data = G.nodes[node]["data"]
                    if "entities" in node_data:
                        key_entities.update(node_data["entities"])
                
                # Collect user intents
                user_intents = []
                for node in community:
                    node_data = G.nodes[node]["data"]
                    if "user_intents" in node_data:
                        user_intents.extend(node_data["user_intents"])
                
                # Create a topic cluster
                topic_cluster = TopicCluster(
                    name=cluster_name,
                    relevance_score=float(relevance_score),
                    subtopics=subtopics,
                    content_coverage=0.0,  # Will be calculated later
                    competitor_coverage=0.0,  # Will be calculated later
                    semantic_gap=0.0,  # Will be calculated later
                    related_urls=[],  # Will be populated later
                    key_entities=list(key_entities),
                    user_intents=user_intents
                )
                
                topic_clusters.append(topic_cluster)
            
            return topic_clusters
            
        except Exception as e:
            logger.error(f"Error clustering topics: {e}")
            return []
    
    def _find_urls_for_topic(self, topic_name: str, url_to_topics: Dict[str, List[Dict[str, Any]]]) -> List[str]:
        """
        Find URLs that cover a specific topic.
        
        Args:
            topic_name: Topic name to search for
            url_to_topics: Dict mapping URLs to lists of topics
            
        Returns:
            List[str]: URLs covering the topic
        """
        urls = []
        
        for url, topics in url_to_topics.items():
            for topic in topics:
                if topic["topic"].lower() == topic_name.lower() or topic_name.lower() in topic["topic"].lower():
                    urls.append(url)
                    break
        
        return urls
    
    def _compare_topics(
        self, 
        site_topics: Dict[str, Any], 
        competitor_topics: Dict[str, Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Compare topic coverage between a site and its competitors.
        
        Args:
            site_topics: Topics extracted from the site
            competitor_topics: Topics extracted from competitors
            
        Returns:
            Dict[str, Any]: Comparative topic analysis
        """
        site_clusters = site_topics.get("topic_clusters", [])
        
        # Calculate topic coverage metrics
        for cluster in site_clusters:
            # Calculate content coverage based on number of URLs and relevance
            cluster.content_coverage = min(1.0, len(cluster.related_urls) * cluster.relevance_score / 5)
            
            # Calculate competitor coverage for this topic
            competitor_scores = []
            for competitor, topics in competitor_topics.items():
                comp_clusters = topics.get("topic_clusters", [])
                matching_clusters = [c for c in comp_clusters if self._is_similar_topic(cluster.name, c.name)]
                if matching_clusters:
                    max_coverage = max(c.content_coverage for c in matching_clusters)
                    competitor_scores.append(max_coverage)
            
            # Average competitor coverage or 0 if no competitors cover this topic
            cluster.competitor_coverage = np.mean(competitor_scores) if competitor_scores else 0.0
            
            # Calculate semantic gap between site coverage and competitor coverage
            cluster.semantic_gap = max(0, cluster.competitor_coverage - cluster.content_coverage)
        
        # Identify topic gaps (topics covered by competitors but not by the site)
        topic_gaps = []
        
        for competitor, topics in competitor_topics.items():
            comp_clusters = topics.get("topic_clusters", [])
            for comp_cluster in comp_clusters:
                # Check if this competitor topic is covered by the site
                if not any(self._is_similar_topic(comp_cluster.name, sc.name) for sc in site_clusters):
                    # This is a topic gap
                    topic_gaps.append({
                        "topic": comp_cluster.name,
                        "competitor": competitor,
                        "relevance": comp_cluster.relevance_score,
                        "coverage": comp_cluster.content_coverage
                    })
        
        # Identify intent gaps
        intent_gaps = self._identify_intent_gaps(site_topics, competitor_topics)
        
        return {
            "site_topics": site_clusters,
            "topic_gaps": topic_gaps,
            "intent_gaps": intent_gaps,
            "topic_recommendations": self._generate_topic_recommendations(site_clusters, topic_gaps, intent_gaps)
        }
    
    def _is_similar_topic(self, topic1: str, topic2: str) -> bool:
        """
        Check if two topics are similar.
        
        Args:
            topic1: First topic name
            topic2: Second topic name
            
        Returns:
            bool: True if the topics are similar, False otherwise
        """
        # Simple string comparison for now, could be enhanced with embeddings
        topic1_lower = topic1.lower()
        topic2_lower = topic2.lower()
        
        # Direct match
        if topic1_lower == topic2_lower:
            return True
        
        # One is substring of the other
        if topic1_lower in topic2_lower or topic2_lower in topic1_lower:
            return True
        
        # TODO: Could add embedding-based similarity check here
        
        return False
    
    def _identify_intent_gaps(
        self, 
        site_topics: Dict[str, Any], 
        competitor_topics: Dict[str, Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Identify user intent gaps by comparing with competitors.
        
        Args:
            site_topics: Topics extracted from the site
            competitor_topics: Topics extracted from competitors
            
        Returns:
            List[Dict[str, Any]]: Identified intent gaps
        """
        # Collect all site intents
        site_intents = set()
        for cluster in site_topics.get("topic_clusters", []):
            for intent_obj in cluster.user_intents:
                site_intents.add(intent_obj["intent"].lower())
        
        # Find intents covered by competitors but not by the site
        intent_gaps = []
        
        for competitor, topics in competitor_topics.items():
            for cluster in topics.get("topic_clusters", []):
                for intent_obj in cluster.user_intents:
                    intent = intent_obj["intent"].lower()
                    confidence = intent_obj.get("confidence", 0.5)
                    
                    if intent not in site_intents and confidence > 0.7:  # Only consider high-confidence intents
                        intent_gaps.append({
                            "intent": intent_obj["intent"],
                            "topic": cluster.name,
                            "competitor": competitor,
                            "confidence": confidence
                        })
        
        return intent_gaps
    
    def _generate_topic_recommendations(
        self, 
        site_clusters: List[TopicCluster], 
        topic_gaps: List[Dict[str, Any]], 
        intent_gaps: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Generate topic recommendations based on analysis.
        
        Args:
            site_clusters: Topic clusters from the site
            topic_gaps: Identified topic gaps
            intent_gaps: Identified intent gaps
            
        Returns:
            List[Dict[str, Any]]: Topic recommendations
        """
        recommendations = []
        
        # Recommend improving topics with high semantic gaps
        for cluster in sorted(site_clusters, key=lambda c: c.semantic_gap, reverse=True)[:5]:
            if cluster.semantic_gap > 0.3:  # Only recommend topics with significant gaps
                recommendations.append({
                    "type": "improve_existing",
                    "topic": cluster.name,
                    "current_coverage": cluster.content_coverage,
                    "competitor_coverage": cluster.competitor_coverage,
                    "gap": cluster.semantic_gap,
                    "recommendation": f"Enhance content depth and breadth for '{cluster.name}' to match competitor coverage",
                    "priority": "high" if cluster.semantic_gap > 0.5 else "medium"
                })
        
        # Recommend addressing topic gaps
        for gap in sorted(topic_gaps, key=lambda g: g["relevance"], reverse=True)[:5]:
            recommendations.append({
                "type": "address_gap",
                "topic": gap["topic"],
                "competitor": gap["competitor"],
                "relevance": gap["relevance"],
                "recommendation": f"Create content covering '{gap['topic']}' which is currently only covered by {gap['competitor']}",
                "priority": "high" if gap["relevance"] > 0.7 else "medium"
            })
        
        # Recommend addressing intent gaps
        for gap in sorted(intent_gaps, key=lambda g: g["confidence"], reverse=True)[:5]:
            recommendations.append({
                "type": "address_intent",
                "intent": gap["intent"],
                "topic": gap["topic"],
                "competitor": gap["competitor"],
                "recommendation": f"Create content addressing the user intent: '{gap['intent']}' within the topic '{gap['topic']}'",
                "priority": "medium"
            })
        
        return recommendations
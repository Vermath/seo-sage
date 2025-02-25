from urllib.parse import urlparse, urljoin
from typing import List, Dict, Set, Optional, Any
import asyncio
import aiohttp
from bs4 import BeautifulSoup
import logging
from dataclasses import dataclass
import re
import time
from tqdm.asyncio import tqdm

logger = logging.getLogger(__name__)

@dataclass
class PageData:
    url: str
    title: str
    content: str
    html: str
    meta_description: Optional[str]
    meta_keywords: Optional[str]
    h1s: List[str]
    h2s: List[str]
    internal_links: List[str]
    external_links: List[str]
    images: List[Dict[str, str]]
    status_code: int
    load_time_ms: int
    word_count: int
    schema_org: List[Dict]
    
@dataclass
class CrawlResult:
    base_url: str
    pages: Dict[str, PageData]
    errors: Dict[str, str]
    site_structure: Dict[str, List[str]]
    crawl_stats: Dict[str, Any]

class WebsiteCrawler:
    """
    Advanced asynchronous website crawler that extracts content, structure and technical SEO data
    """
    
    def __init__(
        self, 
        max_pages: int = 100, 
        max_depth: int = 3,
        respect_robots: bool = True,
        user_agent: str = "SEOSageBot/1.0",
        timeout: int = 30,
        max_concurrent_requests: int = 10
    ):
        """
        Initialize the website crawler with configuration options.
        
        Args:
            max_pages: Maximum number of pages to crawl
            max_depth: Maximum depth of links to follow
            respect_robots: Whether to respect robots.txt
            user_agent: User agent to use for requests
            timeout: Timeout for requests in seconds
            max_concurrent_requests: Maximum number of concurrent requests
        """
        self.max_pages = max_pages
        self.max_depth = max_depth
        self.respect_robots = respect_robots
        self.user_agent = user_agent
        self.timeout = timeout
        self.max_concurrent_requests = max_concurrent_requests
        
    async def crawl(self, start_url: str) -> CrawlResult:
        """
        Crawl a website starting from the given URL.
        
        Args:
            start_url: URL to start crawling from
            
        Returns:
            CrawlResult: Results of the crawl
        """
        start_time = time.time()
        
        # Parse the start URL
        parsed_url = urlparse(start_url)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        
        # Initialize data structures
        visited_urls: Set[str] = set()
        pages_data: Dict[str, PageData] = {}
        error_urls: Dict[str, str] = {}
        urls_to_visit: List[Dict[str, Any]] = [{"url": start_url, "depth": 0}]
        site_structure: Dict[str, List[str]] = {}
        
        # Create a semaphore to limit concurrent requests
        semaphore = asyncio.Semaphore(self.max_concurrent_requests)
        
        # Create a session for making requests
        async with aiohttp.ClientSession(
            headers={"User-Agent": self.user_agent},
            timeout=aiohttp.ClientTimeout(total=self.timeout)
        ) as session:
            
            # Process URLs to visit until we've reached our limit or there are no more URLs
            pbar = tqdm(total=self.max_pages, desc="Crawling pages")
            
            while urls_to_visit and len(pages_data) < self.max_pages:
                # Get the next batch of URLs to visit (up to our concurrency limit)
                current_batch = urls_to_visit[:self.max_concurrent_requests]
                urls_to_visit = urls_to_visit[self.max_concurrent_requests:]
                
                # Create tasks for visiting each URL in the batch
                tasks = []
                for url_info in current_batch:
                    url = url_info["url"]
                    depth = url_info["depth"]
                    
                    if url not in visited_urls and self._should_visit_url(url, base_url):
                        visited_urls.add(url)
                        tasks.append(self._process_url(session, url, depth, base_url, semaphore))
                
                # Execute tasks concurrently and process results
                if tasks:
                    batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                    
                    for result in batch_results:
                        if isinstance(result, Exception):
                            # Log the exception and continue
                            logger.error(f"Error during crawl: {result}")
                            continue
                            
                        if not result:
                            # Skip if result is None (failed fetch)
                            continue
                            
                        url, page_data, new_urls, error = result
                        
                        if error:
                            error_urls[url] = error
                        elif page_data:
                            pages_data[url] = page_data
                            site_structure[url] = [link for link in page_data.internal_links 
                                                 if link.startswith(base_url)]
                            
                            # Update progress bar
                            pbar.update(1)
                            
                            # Add new URLs to visit if we haven't reached our depth limit
                            current_depth = next((u["depth"] for u in current_batch if u["url"] == url), 0)
                            if current_depth < self.max_depth:
                                for new_url in new_urls:
                                    if (new_url not in visited_urls and 
                                        new_url not in [u["url"] for u in urls_to_visit] and
                                        self._should_visit_url(new_url, base_url)):
                                        urls_to_visit.append({"url": new_url, "depth": current_depth + 1})
            
            pbar.close()
            
        # Calculate crawl statistics
        end_time = time.time()
        crawl_stats = {
            "total_pages_crawled": len(pages_data),
            "total_errors": len(error_urls),
            "crawl_time_seconds": end_time - start_time,
            "average_page_size_kb": self._calculate_avg_page_size(pages_data),
            "average_load_time_ms": self._calculate_avg_load_time(pages_data),
            "pages_by_status_code": self._count_status_codes(pages_data),
        }
        
        return CrawlResult(
            base_url=base_url,
            pages=pages_data,
            errors=error_urls,
            site_structure=site_structure,
            crawl_stats=crawl_stats
        )
        
    async def _process_url(
        self, 
        session: aiohttp.ClientSession, 
        url: str, 
        depth: int, 
        base_url: str, 
        semaphore: asyncio.Semaphore
    ) -> tuple:
        """
        Process a single URL: fetch, parse, and extract data.
        
        Args:
            session: HTTP session
            url: URL to process
            depth: Current depth in the crawl
            base_url: Base URL of the site
            semaphore: Semaphore for limiting concurrent requests
            
        Returns:
            tuple: (url, page_data, new_urls, error)
        """
        # Use the semaphore to limit concurrent requests
        async with semaphore:
            try:
                start_time = time.time()
                
                # Make the request
                async with session.get(url, allow_redirects=True) as response:
                    load_time_ms = int((time.time() - start_time) * 1000)
                    
                    # Check if the response is HTML
                    content_type = response.headers.get("Content-Type", "")
                    if "text/html" not in content_type.lower():
                        return url, None, [], f"Not HTML content: {content_type}"
                    
                    # Read the HTML content
                    html = await response.text()
                    status_code = response.status
                    
                    # If the request was not successful, record an error
                    if status_code >= 400:
                        return url, None, [], f"HTTP status {status_code}"
                    
                    # Parse the HTML
                    soup = BeautifulSoup(html, "html.parser")
                    
                    # Extract data from the page
                    title = self._extract_title(soup)
                    content = self._extract_content(soup)
                    meta_description = self._extract_meta_description(soup)
                    meta_keywords = self._extract_meta_keywords(soup)
                    h1s = self._extract_headings(soup, "h1")
                    h2s = self._extract_headings(soup, "h2")
                    internal_links, external_links = self._extract_links(soup, base_url, url)
                    images = self._extract_images(soup, base_url)
                    schema_org = self._extract_schema_org(soup)
                    word_count = len(re.findall(r'\w+', content))
                    
                    # Create a PageData object
                    page_data = PageData(
                        url=url,
                        title=title,
                        content=content,
                        html=html,
                        meta_description=meta_description,
                        meta_keywords=meta_keywords,
                        h1s=h1s,
                        h2s=h2s,
                        internal_links=internal_links,
                        external_links=external_links,
                        images=images,
                        status_code=status_code,
                        load_time_ms=load_time_ms,
                        word_count=word_count,
                        schema_org=schema_org
                    )
                    
                    # Return the page data and new URLs to visit
                    return url, page_data, internal_links, None
                    
            except Exception as e:
                # Log the exception and return an error
                logger.error(f"Error processing {url}: {e}")
                return url, None, [], str(e)
    
    def _should_visit_url(self, url: str, base_url: str) -> bool:
        """
        Determine if a URL should be visited based on our crawling rules.
        
        Args:
            url: URL to check
            base_url: Base URL of the site
            
        Returns:
            bool: True if the URL should be visited, False otherwise
        """
        # Only visit URLs from the same domain
        if not url.startswith(base_url):
            return False
        
        # Skip URLs with fragments
        if "#" in url:
            return False
        
        # Skip common non-content file types
        skip_extensions = [
            ".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx", 
            ".xls", ".xlsx", ".ppt", ".pptx", ".zip", ".tar", ".gz", 
            ".mp3", ".mp4", ".avi", ".mov", ".wmv", ".css", ".js"
        ]
        
        if any(url.lower().endswith(ext) for ext in skip_extensions):
            return False
        
        return True
        
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract the page title."""
        title_tag = soup.title
        return title_tag.text.strip() if title_tag else ""
        
    def _extract_content(self, soup: BeautifulSoup) -> str:
        """Extract the main content from the page."""
        # Remove script and style elements
        for script_or_style in soup(["script", "style", "header", "footer", "nav"]):
            script_or_style.decompose()
            
        # Get the text content
        text = soup.get_text()
        
        # Clean up the text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return text
        
    def _extract_meta_description(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract the meta description."""
        meta_desc = soup.find("meta", attrs={"name": "description"})
        return meta_desc.get("content", "").strip() if meta_desc else None
        
    def _extract_meta_keywords(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract the meta keywords."""
        meta_keywords = soup.find("meta", attrs={"name": "keywords"})
        return meta_keywords.get("content", "").strip() if meta_keywords else None
        
    def _extract_headings(self, soup: BeautifulSoup, heading_type: str) -> List[str]:
        """Extract headings of a specific type."""
        headings = soup.find_all(heading_type)
        return [heading.text.strip() for heading in headings]
        
    def _extract_links(self, soup: BeautifulSoup, base_url: str, current_url: str) -> tuple:
        """Extract internal and external links."""
        internal_links = []
        external_links = []
        
        for link in soup.find_all("a", href=True):
            href = link["href"].strip()
            
            # Skip empty links, javascript links, and mailto links
            if not href or href.startswith(("javascript:", "mailto:", "tel:")):
                continue
                
            # Resolve relative URLs
            if not href.startswith(("http://", "https://")):
                href = urljoin(current_url, href)
                
            # Clean the URL (remove fragments and query parameters)
            href = href.split("#")[0]
            
            # Categorize as internal or external
            if href.startswith(base_url):
                if href not in internal_links:
                    internal_links.append(href)
            else:
                if href not in external_links:
                    external_links.append(href)
                    
        return internal_links, external_links
        
    def _extract_images(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
        """Extract images with their attributes."""
        images = []
        
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if src:
                # Resolve relative URLs
                if not src.startswith(("http://", "https://")):
                    src = urljoin(base_url, src)
                    
                image_data = {
                    "src": src,
                    "alt": img.get("alt", ""),
                    "title": img.get("title", "")
                }
                
                images.append(image_data)
                
        return images
        
    def _extract_schema_org(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract Schema.org structured data."""
        schema_data = []
        
        # Look for JSON-LD schema data
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                import json
                data = json.loads(script.string)
                schema_data.append(data)
            except Exception:
                continue
                
        return schema_data
        
    def _calculate_avg_page_size(self, pages_data: Dict[str, PageData]) -> float:
        """Calculate the average page size in KB."""
        if not pages_data:
            return 0
            
        total_size = sum(len(page.html) / 1024 for page in pages_data.values())
        return total_size / len(pages_data)
        
    def _calculate_avg_load_time(self, pages_data: Dict[str, PageData]) -> float:
        """Calculate the average load time in milliseconds."""
        if not pages_data:
            return 0
            
        total_time = sum(page.load_time_ms for page in pages_data.values())
        return total_time / len(pages_data)
        
    def _count_status_codes(self, pages_data: Dict[str, PageData]) -> Dict[int, int]:
        """Count pages by status code."""
        status_counts = {}
        
        for page in pages_data.values():
            status_counts[page.status_code] = status_counts.get(page.status_code, 0) + 1
            
        return status_counts
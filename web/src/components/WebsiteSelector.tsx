import React, { useState, useEffect } from 'react';

interface WebsiteSelectorProps {
  onSelect: (websiteId: string) => void;
  currentSelection?: string | null;
}

// Mock data for demo purposes
const mockWebsites = [
  { id: '1', name: 'Example Blog', url: 'https://example.com' },
  { id: '2', name: 'E-commerce Store', url: 'https://store-example.com' },
  { id: '3', name: 'Corporate Website', url: 'https://corporate-example.com' }
];

const WebsiteSelector: React.FC<WebsiteSelectorProps> = ({ onSelect, currentSelection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [websites, setWebsites] = useState(mockWebsites);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(currentSelection || null);

  // Get the currently selected website name for display
  const selectedWebsiteName = selectedWebsite 
    ? websites.find(site => site.id === selectedWebsite)?.name || 'Select Website'
    : 'Select Website';

  const handleSelectWebsite = (websiteId: string) => {
    setSelectedWebsite(websiteId);
    setIsOpen(false);
    onSelect(websiteId);
  };

  // In a real app, this would fetch from your API
  useEffect(() => {
    // Simulating an API call to fetch websites
    // setWebsites(fetchedWebsites);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between min-w-[200px]"
      >
        <span>{selectedWebsiteName}</span>
        <svg className="h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 focus:outline-none">
          <ul className="max-h-60 py-1 text-base overflow-auto">
            {websites.map((website) => (
              <li
                key={website.id}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
                  website.id === selectedWebsite ? 'bg-gray-100 text-indigo-600' : 'text-gray-900'
                }`}
                onClick={() => handleSelectWebsite(website.id)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{website.name}</span>
                  <span className="text-xs text-gray-500">{website.url}</span>
                </div>
                {website.id === selectedWebsite && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-600">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WebsiteSelector;
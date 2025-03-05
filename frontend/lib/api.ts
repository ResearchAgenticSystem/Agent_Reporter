"use client";

import { useState, useEffect } from 'react';

// Types
export interface ResearchQuery {
  query: string;
  options?: {
    depth?: 'basic' | 'standard' | 'deep';
    sources?: number;
    recency?: 'any' | 'recent' | 'very-recent';
  };
}

export interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  relevance: number;
}

export interface ResearchResult {
  id: string;
  query: string;
  summary: string;
  keyFindings: string[];
  sections: {
    title: string;
    content: string;
  }[];
  sources: Source[];
  timestamp: string;
}

export interface ResearchProgress {
  stage: 'initializing' | 'searching' | 'analyzing' | 'synthesizing' | 'complete';
  progress: number;
  currentAction?: string;
  partialResult?: Partial<ResearchResult>;
}

// Mock API functions (to be replaced with actual backend calls)
export function useResearch(query: ResearchQuery) {
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [progress, setProgress] = useState<ResearchProgress>({
    stage: 'initializing',
    progress: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.query) return;
    
    const startResearch = async () => {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      try {
        // Simulate research process with stages
        setProgress({ stage: 'initializing', progress: 0 });
        await simulateProgress(1000);
        
        setProgress({ 
          stage: 'searching', 
          progress: 20,
          currentAction: 'Searching for relevant sources...'
        });
        await simulateProgress(2000);
        
        setProgress({ 
          stage: 'analyzing', 
          progress: 40,
          currentAction: 'Analyzing content from sources...',
          partialResult: {
            sources: generateMockSources(query.query)
          }
        });
        await simulateProgress(2000);
        
        setProgress({ 
          stage: 'synthesizing', 
          progress: 70,
          currentAction: 'Synthesizing information into coherent results...',
          partialResult: {
            sources: generateMockSources(query.query),
            keyFindings: [
              'First key finding based on analysis',
              'Second important insight from the research'
            ]
          }
        });
        await simulateProgress(2000);
        
        setProgress({ 
          stage: 'complete', 
          progress: 100 
        });
        
        // Set final result
        const mockResult = generateMockResult(query.query);
        setResult(mockResult);
      } catch (err) {
        setError('An error occurred during research. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    startResearch();
  }, [query.query]);
  
  return { result, progress, error, isLoading };
}

// Helper functions for the mock implementation
async function simulateProgress(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateMockSources(query: string): Source[] {
  return [
    {
      id: '1',
      title: `Comprehensive Analysis of ${query}`,
      url: 'https://example.com/research/1',
      snippet: `This study provides an in-depth look at ${query} and its implications for modern research.`,
      relevance: 0.95
    },
    {
      id: '2',
      title: `The Evolution of ${query} in Recent Years`,
      url: 'https://example.com/research/2',
      snippet: `Examining how ${query} has developed and changed over time, with focus on recent advancements.`,
      relevance: 0.87
    },
    {
      id: '3',
      title: `Critical Perspectives on ${query}`,
      url: 'https://example.com/research/3',
      snippet: `A critical analysis of ${query} from multiple viewpoints, highlighting controversies and debates.`,
      relevance: 0.82
    }
  ];
}

function generateMockResult(query: string): ResearchResult {
  return {
    id: Math.random().toString(36).substring(2, 9),
    query,
    summary: `This research explores ${query} in detail, examining its origins, current state, and future implications. The analysis draws from multiple academic and industry sources to provide a comprehensive overview.`,
    keyFindings: [
      `${query} has shown significant growth in the past decade`,
      `Recent developments in ${query} suggest a trend toward integration with AI technologies`,
      `Experts predict ${query} will continue to evolve in response to changing market demands`,
      `Several challenges remain in the full implementation of ${query} across industries`
    ],
    sections: [
      {
        title: 'Historical Context',
        content: `The development of ${query} can be traced back to early innovations in the field. Initially, progress was slow but steady advancements led to breakthrough moments in recent years.`
      },
      {
        title: 'Current Applications',
        content: `Today, ${query} is applied across various domains including technology, healthcare, and education. Each implementation brings unique benefits and challenges.`
      },
      {
        title: 'Future Directions',
        content: `The future of ${query} appears promising, with ongoing research focused on enhancing capabilities and addressing limitations. Emerging technologies are expected to further accelerate progress.`
      },
      {
        title: 'Limitations and Challenges',
        content: `Despite its potential, ${query} faces several challenges including technical limitations, regulatory concerns, and implementation barriers. Addressing these issues will be crucial for continued advancement.`
      }
    ],
    sources: generateMockSources(query),
    timestamp: new Date().toISOString()
  };
}

// Local storage functions for research history
export function saveResearchToHistory(result: ResearchResult) {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getResearchHistory();
    const updatedHistory = [result, ...history].slice(0, 20); // Keep only 20 most recent
    localStorage.setItem('research_history', JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save research to history:', error);
  }
}

export function getResearchHistory(): ResearchResult[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const history = localStorage.getItem('research_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to get research history:', error);
    return [];
  }
}

export function clearResearchHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('research_history');
}
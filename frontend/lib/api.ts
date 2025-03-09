  "use client";

  import { useState, useEffect } from 'react';
  import { toast } from 'react-hot-toast';

  // Types
  export interface Source {
    id: string;
    title: string;
    url: string;
    snippet: string;
    relevance: number;
  }
  export interface Section {
    title: string;
    content: string;
  }

  export interface ResearchResult {
    query: string;
    timestamp: number;
    summary?: string;
    keyFindings?: string[];
    sections?: Section[];
    sources?: Source[]; // ✅ Use `Source[]` instead of `any[]`
    topic?: string;
    article?: string;
    success?: boolean;
  }
  

  export interface ResearchProgress {
    stage: 'initializing' | 'searching' | 'analyzing' | 'synthesizing' | 'complete';
    progress: number;
    currentAction?: string;
    partialResult?: Partial<ResearchResult>;
  }

  // API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


  // Main hook
  export function useResearch(topic: string) {
    const [result, setResult] = useState<ResearchResult | null>(null);
    const [progress, setProgress] = useState<ResearchProgress>({
      stage: 'initializing',
      progress: 0
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      if (!topic) return;
      console.log("useResearch triggered with topic:", topic);
      const controller = new AbortController();
      let isMounted = true; // Flag to check if component is still mounted
      const timeoutId = setTimeout(() => {
        controller.abort();
        if (isMounted) toast.error("Research request timed out. Please try again.");
      }, 10000); // 10-second timeout
    
      const startResearch = async () => {
        if (!topic) return; // Ensure there's a valid topic
      
        const controller = new AbortController();
        let isMounted = true; // Track if the component is still mounted
        const timeoutId = setTimeout(() => {
          controller.abort();
          if (isMounted) toast.error("Research request timed out. Please try again.");
        }, 10000); // Set a 10-second timeout
      
        setIsLoading(true);
        setError(null);
        setResult(null);
      
        try {
          console.log(`[useResearch] Initializing research for topic: "${topic}"`);
      
          setProgress({ stage: "initializing", progress: 0 });
          await simulateProgress(1000);
      
          setProgress({ stage: "searching", progress: 20, currentAction: "Searching for sources..." });
      
          const apiUrl = `${API_URL}/generate-test?topic=${encodeURIComponent(topic)}`;
          console.log(`[useResearch] Fetching from: ${apiUrl}`);
      
          const response = await fetch(apiUrl);
          if (!response.ok) {
            console.error("Response error:", response);
            throw new Error("API request failed");
          }
      
          const data = await response.json();
          console.log("[useResearch] API Response:", data);
      
          // ✅ Check if success is false and show error toast
          if (!data.success) {
            throw new Error(data.message || "Request failed");
          }
      
          setProgress({
            stage: "analyzing",
            progress: 40,
            currentAction: "Analyzing content...",
            partialResult: { sources: data.sources },
          });
          await simulateProgress(2000);
      
          setProgress({
            stage: "synthesizing",
            progress: 70,
            currentAction: "Synthesizing results...",
            partialResult: { keyFindings: data.keyFindings },
          });
          await simulateProgress(2000);
      
          if (isMounted) {
            setProgress({ stage: "complete", progress: 100 });
            setResult(data);
            console.log("[useResearch] Research completed successfully.");
          }
        } catch (err: unknown) {
          if (isMounted) {
            const errorMessage =
              err instanceof Error ? err.message : "An error occurred. Please try again.";
      
            setError(errorMessage);
            toast.error(`Error: ${errorMessage}`);
            setProgress({ stage: "initializing", progress: 0 });
      
            console.error("[useResearch] Error:", err);
          }
        } finally {
          clearTimeout(timeoutId);
          setIsLoading(false);
        }
      };
      
    
      startResearch();
    
      return () => {
        isMounted = false;
        controller.abort();
        clearTimeout(timeoutId);
      };
    }, [topic]);
    

    return { result, progress, error, isLoading };
  }

  // Helper function to simulate progress
  async function simulateProgress(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
    if (typeof window === "undefined") return [];
  
    try {
      const history = localStorage.getItem("research_history");
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.warn("Failed to parse research history, clearing storage:", error);
      localStorage.removeItem("research_history"); // 🚀 Auto-fix corrupted storage
      return [];
    }
  }
  

  export function clearResearchHistory() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('research_history');
  }
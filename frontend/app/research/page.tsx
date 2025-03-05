"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { TypingAnimation } from '@/components/typing-animation';
import { ProgressIndicator } from '@/components/progress-indicator';
import { CollapsibleSection } from '@/components/collapsible-section';
import { SourceVisualization } from '@/components/source-visualization';
import { SourceCard } from '@/components/source-card';
import { ExportOptions } from '@/components/export-options';
import { SearchInput } from '@/components/search-input';
import { useResearch, saveResearchToHistory, ResearchQuery } from '@/lib/api';
import { fadeIn, fadeInUp, staggerContainer, slideIn } from '@/lib/framer-animations';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function ResearchPage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [activeSourceId, setActiveSourceId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('results');
  
  // Create research query object
  const researchQuery: ResearchQuery = {
    query: queryParam,
    options: {
      depth: 'standard',
      sources: 5,
      recency: 'recent'
    }
  };
  
  // Use the research hook
  const { result, progress, error, isLoading } = useResearch(researchQuery);
  
  // Save to history when research is complete
  useEffect(() => {
    if (result) {
      saveResearchToHistory(result);
    }
  }, [result]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href="/" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Research Results</h1>
            <p className="text-muted-foreground">
              {queryParam ? `Query: "${queryParam}"` : 'Enter a research query'}
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <SearchInput />
          </div>
        </div>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-8">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}
        
        {isLoading || progress.stage !== 'complete' ? (
          <div className="space-y-8">
            <ProgressIndicator progress={progress} className="max-w-xl mx-auto" />
            
            {progress.stage !== 'initializing' && (
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="mt-8"
              >
                <h2 className="text-xl font-semibold mb-4">Processing your query</h2>
                
                {progress.stage === 'searching' && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">Searching for relevant sources...</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-lg" />
                      ))}
                    </div>
                  </div>
                )}
                
                {progress.stage === 'analyzing' && progress.partialResult?.sources && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Sources Found</h3>
                      <SourceVisualization 
                        sources={progress.partialResult.sources} 
                        activeSourceId={activeSourceId}
                        onSourceClick={setActiveSourceId}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {progress.partialResult.sources.map((source) => (
                        <SourceCard 
                          key={source.id} 
                          source={source} 
                          isActive={source.id === activeSourceId}
                          onClick={() => setActiveSourceId(source.id)}
                        />
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <TypingAnimation 
                        text="Analyzing content from these sources to extract relevant information and insights..."
                        className="text-muted-foreground"
                      />
                    </div>
                  </div>
                )}
                
                {progress.stage === 'synthesizing' && progress.partialResult?.keyFindings && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Key Findings</h3>
                      <div className="space-y-2">
                        {progress.partialResult.keyFindings.map((finding, index) => (
                          <motion.div
                            key={index}
                            variants={slideIn}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: index * 0.2 }}
                            className="p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border"
                          >
                            {finding}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <TypingAnimation 
                        text="Synthesizing information into a comprehensive research report..."
                        className="text-muted-foreground"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          result && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={fadeIn} className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{result.query}</h2>
                  <p className="text-sm text-muted-foreground">
                    Completed on {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <ExportOptions result={result} />
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-6">
                <h3 className="text-xl font-semibold mb-4">Summary</h3>
                <p className="text-muted-foreground">{result.summary}</p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.keyFindings.map((finding, index) => (
                    <motion.div
                      key={index}
                      variants={slideIn}
                      className="p-4 bg-primary/5 rounded-lg border border-primary/20"
                    >
                      <p className="text-sm">{finding}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <Tabs defaultValue="results" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="results">Detailed Results</TabsTrigger>
                    <TabsTrigger value="sources">Sources & Visualization</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="results" className="mt-6 space-y-4">
                    {result.sections.map((section, index) => (
                      <CollapsibleSection 
                        key={index} 
                        title={section.title} 
                        defaultOpen={index === 0}
                      >
                        <p className="text-muted-foreground">{section.content}</p>
                      </CollapsibleSection>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="sources" className="mt-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-4">Source Visualization</h3>
                      <SourceVisualization 
                        sources={result.sources} 
                        activeSourceId={activeSourceId}
                        onSourceClick={setActiveSourceId}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {result.sources.map((source) => (
                        <SourceCard 
                          key={source.id} 
                          source={source} 
                          isActive={source.id === activeSourceId}
                          onClick={() => setActiveSourceId(source.id)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </motion.div>
          )
        )}
      </main>
      
      <Footer />
    </div>
  );
}
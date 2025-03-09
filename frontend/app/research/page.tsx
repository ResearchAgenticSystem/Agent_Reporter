"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TypingAnimation } from "@/components/typing-animation";
import { ProgressIndicator } from "@/components/progress-indicator";
import { CollapsibleSection } from "@/components/collapsible-section";
import { SourceVisualization } from "@/components/source-visualization";
import { SourceCard } from "@/components/source-card";
import { ExportOptions } from "@/components/export-options";
import { SearchInput } from "@/components/search-input";
import { useResearch, saveResearchToHistory, Source } from "@/lib/api";
import { fadeIn, fadeInUp, staggerContainer, slideIn } from "@/lib/framer-animations";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Share2 } from "lucide-react";
import Link from "next/link";
import { toast } from 'react-hot-toast';
import {parseHTML} from "linkedom";
import { marked } from "marked";

/**
 * Parses an article that is initially in HTML but contains Markdown inside.
 * Extracts the Markdown and returns it as both raw Markdown and rendered HTML.
 * 
 * @param {string} articleHtml - The article in HTML format.
 * @returns {{ markdown: string, renderedHtml: string }} Extracted Markdown and its HTML rendering.
 */
const parseArticle = async (articleHtml: string): Promise<{ markdown: string; renderedHtml: string }> => {
  // Ensure valid HTML structure
  const safeHtml = `<body>${articleHtml}</body>`;
  const { document } = parseHTML(safeHtml);

  // Extract markdown content
  const markdown = document.documentElement.innerHTML.trim();

  console.log("📜 Extracted Markdown:", markdown);

  // Convert to HTML safely
  const renderedHtml = markdown ? await marked(markdown) : "<p>No content available</p>";

  console.log("🖼 Rendered HTML:", renderedHtml);

  return { markdown, renderedHtml };
};

// Function to parse string sources into Source objects
const parseSourceStrings = (sources: (string | Source)[]): Source[] => {
  return sources.map((source, index) => {
    if (typeof source !== "string") {
      return source; // ✅ If it's already a `Source`, return as is
    }

    // Extract source type if it exists (e.g., "Google:", "Wikipedia:")
    const typeMatch = source.match(/^(.*?):/);
    const sourceType = typeMatch ? typeMatch[1] : "Source";

    // Use the rest as snippet
    const snippet = typeMatch ? source.substring(typeMatch[0].length).trim() : source;

    // Create a title from source type and first few words
    const titleWords = snippet.split(" ").slice(0, 5).join(" ");
    const title = `${sourceType}: ${titleWords}...`;

    return {
      id: index.toString(),
      title,
      snippet,
      url: "#", // Placeholder URL
      relevance: 1 - index / sources.length, // Decreasing relevance
    };
  });
};

export default function ResearchPage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") || "";
  console.log("🚀 ResearchPage rendered! Topic:", topic);
  const [activeSourceId, setActiveSourceId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState("article"); // Changed default tab to "article"

  // Use the research hook with the topic
  const { result, progress, error, isLoading } = useResearch(topic);

  const [article, setArticle] = useState<{markdown: string, renderedHtml: string} | null>(null);

  // Save to history when research is complete
  useEffect(() => {
    if (result) {
      saveResearchToHistory(result);
      const fetchArticle = async () => {
        console.log("🛠 Fetching article...");
        console.log("Raw HTML:", result?.article);
      
        const { markdown, renderedHtml } = await parseArticle(result?.article || "");
      
        console.log("Parsed Markdown:", markdown);
        console.log("Rendered HTML:", renderedHtml);
      
        setArticle({ markdown, renderedHtml });
      };
      
      fetchArticle();
    }
  }, [result]);

  // Display error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);


  // Parse sources from strings to objects if they exist
  const parsedSources = result?.sources 
    ? (Array.isArray(result.sources[0]) ? result.sources : parseSourceStrings(result.sources)) 
    : [];

  

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
              {topic ? `Topic: "${topic}"` : "Enter a research topic"}
            </p>
          </div>

          <div className="w-full md:w-1/3">
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

        {isLoading || progress.stage !== "complete" ? (
          <div className="space-y-8">
            <ProgressIndicator progress={progress} className="max-w-xl mx-auto" />

            {progress.stage !== "initializing" && (
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="mt-8"
              >
                <h2 className="text-xl font-semibold mb-4">Processing your query</h2>

                {progress.stage === "searching" && (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">Searching for relevant sources...</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-lg" />
                      ))}
                    </div>
                  </div>
                )}

                {progress.stage === "analyzing" && progress.partialResult?.sources && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Sources Found</h3>
                      <SourceVisualization
                        sources={
                          typeof progress.partialResult.sources[0] === 'string'
                            ? parseSourceStrings(progress.partialResult.sources)
                            : progress.partialResult.sources
                        }
                        activeSourceId={activeSourceId}
                        onSourceClick={setActiveSourceId}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(typeof progress.partialResult.sources[0] === 'string'
                        ? parseSourceStrings(progress.partialResult.sources)
                        : progress.partialResult.sources
                      ).map((source) => (
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

                {progress.stage === "synthesizing" && (
                  <div className="space-y-6">
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
                  <h2 className="text-2xl font-bold mb-2">{result.topic || result.query}</h2>
                  <p className="text-sm text-muted-foreground">
                    Completed on {new Date().toLocaleString()}
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

              <motion.div variants={fadeInUp}>
                <Tabs defaultValue="article" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="article">Article</TabsTrigger>
                    <TabsTrigger value="sources">Sources & Visualization</TabsTrigger>
                  </TabsList>

                  <TabsContent value="article" className="mt-6">
                    <div className="p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-border">
                      {/* Render the article using dangerouslySetInnerHTML */}
                      <div dangerouslySetInnerHTML={{ __html: article?.renderedHtml || "" }} />
                    </div>
                  </TabsContent>

                  <TabsContent value="sources" className="mt-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-4">Source Visualization</h3>
                      <SourceVisualization
                        sources={parsedSources}
                        activeSourceId={activeSourceId}
                        onSourceClick={setActiveSourceId}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {parsedSources.map((source) => (
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

"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getResearchHistory, clearResearchHistory, ResearchResult } from '@/lib/api';
import { fadeIn, fadeInUp, staggerContainer } from '@/lib/framer-animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function HistoryPage() {
  const [history, setHistory] = useState<ResearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<ResearchResult[]>([]);
  
  useEffect(() => {
    const researchHistory = getResearchHistory();
    setHistory(researchHistory);
    setFilteredHistory(researchHistory);
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter(item => 
        item.query.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHistory(filtered);
    }
  }, [searchTerm, history]);
  
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your research history? This action cannot be undone.')) {
      clearResearchHistory();
      setHistory([]);
      setFilteredHistory([]);
      toast.success('Research history cleared');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Research History</h1>
          <p className="text-muted-foreground">
            View and manage your past research queries
          </p>
        </motion.div>
        
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button 
            variant="destructive" 
            onClick={handleClearHistory}
            disabled={history.length === 0}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        </motion.div>
        
        {filteredHistory.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-center py-16"
          >
            <p className="text-muted-foreground mb-4">
              {history.length === 0 
                ? "You haven't conducted any research yet." 
                : "No matching research found."}
            </p>
            {history.length === 0 && (
              <Button asChild>
                <Link href="/">Start Researching</Link>
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredHistory.map((item) => (
              <motion.div
                variants={fadeInUp}
                className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium mb-1">{item.query}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.summary}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  
                  <Button asChild size="sm" className="gap-2 shrink-0">
                    <Link href={`/research?q=${encodeURIComponent(item.query)}`}>
                      View Results
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
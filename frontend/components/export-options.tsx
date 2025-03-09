"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ResearchResult, Source } from '@/lib/api';
import { Download, FileText, Share2, Copy, Printer, FileJson } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

interface ExportOptionsProps {
  result: ResearchResult;
}

const parseHTML = (html: string) => {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
};

const cleanArticleContent = (articleHtml: string) => {
  const safeHtml = DOMPurify.sanitize(articleHtml);
  const doc = parseHTML(safeHtml);
  // Extract text content and clean up formatting
  return doc.body.textContent 
    ? doc.body.textContent
        .replace(/\*\*/g, '') // Remove markdown bold
        .replace(/#/g, '') // Remove headers
        .replace(/\n{3,}/g, '\n\n') // Normalize newlines
        .trim()
    : 'No content available';
};

const parseSources = (sources: (string | Source)[]): Source[] => {
  return sources.map((source, index) => {
    if (typeof source !== 'string') return source;
    
    // Clean source string formatting
    const cleanSource = source
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/#/g, ''); // Remove headers

    const [type, ...content] = cleanSource.split(':');
    const urlMatch = content.join(':').match(/https?:\/\/[^\s]+/);
    const url = urlMatch?.[0] || '#';
    const snippet = content.join(':').replace(url, '').trim();

    return {
      id: `source-${index}`,
      title: `${type?.trim() || 'Source'} ${index + 1}`,
      snippet: snippet.slice(0, 200) + (snippet.length > 200 ? '...' : ''),
      url,
      relevance: 1 - index * 0.1
    };
  });
};

export function ExportOptions({ result }: ExportOptionsProps) {
  const getProcessedContent = () => {
    const cleanArticle = cleanArticleContent(result.article || '');
    const sources = parseSources(result.sources || []);
    const timestamp = new Date(result.timestamp || Date.now()).toLocaleString();
    
    return { cleanArticle, sources, timestamp };
  };

  const handleCopy = async () => {
    const { cleanArticle, sources, timestamp } = getProcessedContent();
    const text = `Research: ${result.topic}\n` +
                 `Generated: ${timestamp}\n\n` +
                 `${cleanArticle}\n\nSources:\n` +
                 sources.map(s => `- ${s.title}: ${s.url}`).join('\n');
    
    navigator.clipboard.writeText(text);
    toast.success('Copied clean content to clipboard');
  };

  const handleExportTXT = () => {
    const { cleanArticle, sources, timestamp } = getProcessedContent();
    const text = `Research: ${result.topic}\n` +
                 `Generated: ${timestamp}\n\n` +
                 `${cleanArticle}\n\nSources:\n` +
                 sources.map(s => `- ${s.title}: ${s.url}`).join('\n');
    
    downloadFile(text, `${result.topic}-research.txt`, 'text/plain');
    toast.success('Downloaded as TXT');
  };

  const handleExportJSON = () => {
    const { cleanArticle, sources, timestamp } = getProcessedContent();
    const data = {
      topic: result.topic,
      timestamp,
      article: cleanArticle,
      sources: sources.map(s => ({
        title: s.title,
        url: s.url,
        snippet: s.snippet
      }))
    };
    
    downloadFile(JSON.stringify(data, null, 2), `${result.topic}-research.json`, 'application/json');
    toast.success('Downloaded as JSON');
  };

  const handlePrint = () => {
    const { cleanArticle, sources, timestamp } = getProcessedContent();
    const printWindow = window.open('', '_blank');
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Research: ${result.topic}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              max-width: 800px; 
              margin: 20px auto; 
              padding: 20px;
              white-space: pre-wrap;
            }
            h1 { 
              font-size: 1.5em; 
              border-bottom: 2px solid #ccc; 
              padding-bottom: 0.5em;
              margin-bottom: 1em;
            }
            .timestamp { 
              color: #666; 
              margin-bottom: 1.5em;
            }
            .sources { 
              margin-top: 2em;
              border-top: 1px solid #eee;
              padding-top: 1.5em;
            }
            .source-item { 
              margin-bottom: 1em;
            }
          </style>
        </head>
        <body>
          <h1>Research: ${result.topic}</h1>
          <div class="timestamp">Generated: ${timestamp}</div>
          <div class="content">${cleanArticle}</div>
          <div class="sources">
            <h2>Sources</h2>
            ${sources.map(s => `
              <div class="source-item">
                <strong>${s.title}</strong><br>
                <a href="${s.url}">${s.url}</a>
                ${s.snippet ? `<p>${s.snippet}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    printWindow?.document.write(content);
    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.print();
  };

  const handleShare = () => {
    const params = new URLSearchParams({
      topic: result.topic || '',
      timestamp: (result.timestamp || Date.now()).toString()
    });

    const shareUrl = `${window.location.origin}/research?${params.toString()}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Research: ${result.topic}`,
        url: shareUrl
      }).catch(err => console.error('Sharing failed:', err));
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share URL copied to clipboard');
    }
  };

  const downloadFile = (content: string, fileName: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Formatted Content
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportTXT}>
          <FileText className="h-4 w-4 mr-2" />
          Save as TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Save as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Research
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
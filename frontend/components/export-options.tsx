"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ResearchResult } from '@/lib/api';
import { 
  Download, 
  FileText, 
  Share2, 
  Copy, 
  Printer,
  FileJson
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ExportOptionsProps {
  result: ResearchResult;
}

export function ExportOptions({ result }: ExportOptionsProps) {
  const handleCopyToClipboard = () => {
    const text = `
# Research: ${result.query}

## Summary
${result.summary}

## Key Findings
${result.keyFindings.map(finding => `- ${finding}`).join('\n')}

## Sections
${result.sections.map(section => `### ${section.title}\n${section.content}`).join('\n\n')}

## Sources
${result.sources.map(source => `- [${source.title}](${source.url})`).join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  
  const handleExportTXT = () => {
    const text = `
RESEARCH: ${result.query}

SUMMARY
${result.summary}

KEY FINDINGS
${result.keyFindings.map(finding => `- ${finding}`).join('\n')}

SECTIONS
${result.sections.map(section => `${section.title}\n${section.content}`).join('\n\n')}

SOURCES
${result.sources.map(source => `- ${source.title} (${source.url})`).join('\n')}
    `.trim();
    
    downloadFile(text, 'research-result.txt', 'text/plain');
    toast.success('Downloaded as TXT');
  };
  
  const handleExportJSON = () => {
    const json = JSON.stringify(result, null, 2);
    downloadFile(json, 'research-result.json', 'application/json');
    toast.success('Downloaded as JSON');
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Research: ${result.query}`,
        text: result.summary,
        url: window.location.href
      }).catch(err => {
        console.error('Error sharing:', err);
        toast.error('Failed to share');
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      handleCopyToClipboard();
      toast.info('Share URL copied to clipboard');
    }
  };
  
  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
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
        <DropdownMenuItem onClick={handleCopyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy to clipboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportTXT}>
          <FileText className="h-4 w-4 mr-2" />
          Export as TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
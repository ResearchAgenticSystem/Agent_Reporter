"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { fadeIn, fadeInUp } from '@/lib/framer-animations';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function SettingsPage() {
  // Research settings
  const [defaultDepth, setDefaultDepth] = useState<string>('standard');
  const [maxSources, setMaxSources] = useState<number>(5);
  const [recencyPreference, setRecencyPreference] = useState<string>('recent');
  
  // Display settings
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(true);
  const [showSourceVisualization, setShowSourceVisualization] = useState<boolean>(true);
  const [autoExpandSections, setAutoExpandSections] = useState<boolean>(false);
  
  // Privacy settings
  const [saveHistory, setSaveHistory] = useState<boolean>(true);
  const [shareAnalytics, setShareAnalytics] = useState<boolean>(false);
  
  const handleSaveSettings = () => {
    // In a real app, this would save to localStorage or a backend
    toast.success('Settings saved successfully');
  };
  
  const handleResetSettings = () => {
    // Reset to defaults
    setDefaultDepth('standard');
    setMaxSources(5);
    setRecencyPreference('recent');
    setAnimationsEnabled(true);
    setShowSourceVisualization(true);
    setAutoExpandSections(false);
    setSaveHistory(true);
    setShareAnalytics(false);
    
    toast.info('Settings reset to defaults');
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
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your research experience
          </p>
        </motion.div>
        
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <Tabs defaultValue="research" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="research" className="mt-6">
              <div className="bg-card rounded-lg border border-border p-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Research Depth</h3>
                  <p className="text-sm text-muted-foreground">
                    Control how thorough the AI should be when researching topics
                  </p>
                  
                  <RadioGroup value={defaultDepth} onValueChange={setDefaultDepth} className="mt-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="basic" id="depth-basic" />
                      <Label htmlFor="depth-basic">Basic - Quick results with essential information</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="depth-standard" />
                      <Label htmlFor="depth-standard">Standard - Balanced depth and speed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="deep" id="depth-deep" />
                      <Label htmlFor="depth-deep">Deep - Comprehensive analysis with detailed insights</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Maximum Sources</h3>
                  <p className="text-sm text-muted-foreground">
                    Set the maximum number of sources to include in research results
                  </p>
                  
                  <div className="flex flex-col space-y-4 pt-2">
                    <Slider
                      value={[maxSources]}
                      min={3}
                      max={10}
                      step={1}
                      onValueChange={(value) => setMaxSources(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>3</span>
                      <span>Current: {maxSources}</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Recency Preference</h3>
                  <p className="text-sm text-muted-foreground">
                    Control how recent the sources should be
                  </p>
                  
                  <RadioGroup value={recencyPreference} onValueChange={setRecencyPreference} className="mt-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="any" id="recency-any" />
                      <Label htmlFor="recency-any">Any time - Include all relevant sources regardless of date</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="recent" id="recency-recent" />
                      <Label htmlFor="recency-recent">Recent - Prioritize sources from the past few years</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very-recent" id="recency-very-recent" />
                      <Label htmlFor="recency-very-recent">Very recent - Focus on the most recent sources</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="display" className="mt-6">
              <div className="bg-card rounded-lg border border-border p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Enable Animations</h3>
                    <p className="text-sm text-muted-foreground">
                      Toggle animations and transitions throughout the interface
                    </p>
                  </div>
                  <Switch
                    checked={animationsEnabled}
                    onCheckedChange={setAnimationsEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Show Source Visualization</h3>
                    <p className="text-sm text-muted-foreground">
                      Display interactive visualization of research sources
                    </p>
                  </div>
                  <Switch
                    checked={showSourceVisualization}
                    onCheckedChange={setShowSourceVisualization}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Auto-expand Sections</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically expand all sections in research results
                    </p>
                  </div>
                  <Switch
                    checked={autoExpandSections}
                    onCheckedChange={setAutoExpandSections}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="mt-6">
              <div className="bg-card rounded-lg border border-border p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Save Research History</h3>
                    <p className="text-sm text-muted-foreground">
                      Store your research queries and results locally
                    </p>
                  </div>
                  <Switch
                    checked={saveHistory}
                    onCheckedChange={setSaveHistory}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Share Anonymous Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Help improve the service by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={shareAnalytics}
                    onCheckedChange={setShareAnalytics}
                  />
                </div>
                
                <div className="pt-4 border-t border-border">
                  <Button variant="destructive" className="w-full">
                    Delete All Data
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    This will permanently delete all your saved research history and preferences
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 flex justify-end gap-4">
            <Button variant="outline" onClick={handleResetSettings}>
              Reset to Defaults
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
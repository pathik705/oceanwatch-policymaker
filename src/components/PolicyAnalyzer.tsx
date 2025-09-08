import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FileText, Upload, Brain, Search, AlertCircle, CheckCircle, Scale, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PolicyDocument {
  id: string;
  title: string;
  type: "regulation" | "framework" | "agreement" | "law";
  jurisdiction: string;
  summary: string;
  keyEntities: string[];
  relevanceScore: number;
  lastUpdated: string;
  status: "active" | "draft" | "archived";
}

interface PolicyMatch {
  document: PolicyDocument;
  matchedSections: string[];
  complianceStatus: "compliant" | "violation" | "unclear";
  recommendations: string[];
}

const PolicyAnalyzer = () => {
  const [analysisQuery, setAnalysisQuery] = useState("");
  const [uploadedDoc, setUploadedDoc] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [policyMatches, setPolicyMatches] = useState<PolicyMatch[] | null>(null);
  const { toast } = useToast();

  // Mock policy database
  const policyDatabase: PolicyDocument[] = [
    {
      id: "1",
      title: "MARPOL Convention - Annex V (Garbage)",
      type: "agreement",
      jurisdiction: "International (IMO)",
      summary: "Prohibits discharge of garbage from ships, including plastics and other harmful substances",
      keyEntities: ["plastic waste", "ship discharge", "special areas", "penalties"],
      relevanceScore: 0.95,
      lastUpdated: "2023-12-01",
      status: "active"
    },
    {
      id: "2", 
      title: "EU Marine Strategy Framework Directive",
      type: "framework",
      jurisdiction: "European Union",
      summary: "Establishes framework for marine environmental protection with specific targets for marine litter",
      keyEntities: ["marine litter", "good environmental status", "member states", "monitoring"],
      relevanceScore: 0.88,
      lastUpdated: "2023-11-15",
      status: "active"
    },
    {
      id: "3",
      title: "Clean Water Act - Marine Protection",
      type: "law",
      jurisdiction: "United States",
      summary: "Federal law governing water pollution, including marine environments and coastal zones",
      keyEntities: ["water pollution", "discharge permits", "coastal zones", "enforcement"],
      relevanceScore: 0.82,
      lastUpdated: "2023-10-20",
      status: "active"
    },
    {
      id: "4",
      title: "Global Plastics Treaty (Draft)",
      type: "agreement", 
      jurisdiction: "United Nations",
      summary: "Proposed international agreement to end plastic pollution, including marine environments",
      keyEntities: ["plastic pollution", "circular economy", "marine protection", "global cooperation"],
      relevanceScore: 0.91,
      lastUpdated: "2024-01-10",
      status: "draft"
    }
  ];

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDoc(file);
      toast({
        title: "Document Uploaded",
        description: `${file.name} ready for analysis`,
      });
    }
  };

  const performAnalysis = async () => {
    if (!analysisQuery && !uploadedDoc) {
      toast({
        title: "Input Required",
        description: "Please enter a query or upload a document to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Import the ML analysis functions
      const { analyzeText, extractTextFromFile } = await import('@/utils/mlAnalysis');
      
      let textToAnalyze = analysisQuery;
      
      // If document uploaded, extract text first
      if (uploadedDoc) {
        textToAnalyze = await extractTextFromFile(uploadedDoc);
        if (analysisQuery) {
          textToAnalyze = `${analysisQuery}\n\n${textToAnalyze}`;
        }
      }
      
      // Perform real ML analysis
      const analysisResults = await analyzeText(
        textToAnalyze,
        (progress) => setAnalysisProgress(progress)
      );

      setPolicyMatches(analysisResults);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${analysisResults.length} relevant policy matches using AI analysis.`,
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed", 
        description: error instanceof Error ? error.message : "Failed to analyze content",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-success text-success-foreground';
      case 'violation': return 'bg-danger text-danger-foreground';
      case 'unclear': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'violation': return <AlertCircle className="w-4 h-4" />;
      case 'unclear': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'law': return 'bg-primary text-primary-foreground';
      case 'regulation': return 'bg-accent text-accent-foreground';
      case 'framework': return 'bg-secondary text-secondary-foreground';
      case 'agreement': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-ocean border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scale className="w-5 h-5 mr-2 text-primary" />
            Policy Intelligence Analysis
          </CardTitle>
          <CardDescription>
            AI-powered analysis of environmental policies and regulatory compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Methods */}
          <Tabs defaultValue="query" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="query">Text Query</TabsTrigger>
              <TabsTrigger value="upload">Document Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="query" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Describe the pollution incident or scenario</label>
                <Input
                  placeholder="e.g., Oil spill detected 200km from coastal protected area..."
                  value={analysisQuery}
                  onChange={(e) => setAnalysisQuery(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleDocumentUpload}
                  className="hidden"
                  id="policy-upload"
                />
                <label htmlFor="policy-upload" className="cursor-pointer space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Upload policy document</p>
                    <p className="text-sm text-muted-foreground">
                      PDF, DOC, DOCX, or TXT • Max 10MB
                    </p>
                  </div>
                </label>
                {uploadedDoc && (
                  <div className="mt-4 p-2 bg-muted rounded text-sm">
                    📄 {uploadedDoc.name}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            onClick={performAnalysis} 
            disabled={isAnalyzing}
            className="w-full bg-gradient-ocean"
          >
            <Brain className="w-4 h-4 mr-2" />
            {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
          </Button>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Running NLP analysis...</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {policyMatches && !isAnalyzing && (
        <div className="space-y-6">
          <Card className="shadow-marine border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2 text-accent" />
                Policy Matches & Compliance Analysis
              </CardTitle>
              <CardDescription>
                Found {policyMatches.length} relevant policies with compliance assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {policyMatches.map((match, index) => (
                <Card key={index} className="shadow-sm">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{match.document.title}</h3>
                          <Badge className={getTypeColor(match.document.type)}>
                            {match.document.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {match.document.summary}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          {match.document.jurisdiction}
                          <span>•</span>
                          <span>Updated {match.document.lastUpdated}</span>
                          <span>•</span>
                          <span>{Math.round(match.document.relevanceScore * 100)}% relevance</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getComplianceIcon(match.complianceStatus)}
                        <Badge className={getComplianceColor(match.complianceStatus)}>
                          {match.complianceStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Matched Sections:</h4>
                        <div className="flex flex-wrap gap-1">
                          {match.matchedSections.map((section, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-1">Recommendations:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {match.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-xs mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline">
                        View Full Document
                      </Button>
                      <Button size="sm" variant="outline">
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export { PolicyAnalyzer };
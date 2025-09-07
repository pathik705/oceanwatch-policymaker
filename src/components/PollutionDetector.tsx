import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Zap, AlertTriangle, CheckCircle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DetectionResult {
  type: string;
  confidence: number;
  location: { x: number; y: number; width: number; height: number };
  severity: "low" | "medium" | "high" | "critical";
}

const PollutionDetector = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState<DetectionResult[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setResults(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setResults(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAnalysis = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate AI processing
    const steps = [
      { progress: 20, message: "Preprocessing image..." },
      { progress: 45, message: "Running CNN detection..." },
      { progress: 70, message: "Analyzing pollution patterns..." },
      { progress: 90, message: "Generating report..." },
      { progress: 100, message: "Analysis complete!" },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress(step.progress);
    }

    // Mock detection results
    const mockResults: DetectionResult[] = [
      {
        type: "Plastic Debris",
        confidence: 0.94,
        location: { x: 120, y: 80, width: 150, height: 100 },
        severity: "high"
      },
      {
        type: "Oil Contamination",
        confidence: 0.87,
        location: { x: 300, y: 200, width: 200, height: 120 },
        severity: "critical"
      },
      {
        type: "Chemical Waste",
        confidence: 0.76,
        location: { x: 50, y: 300, width: 180, height: 90 },
        severity: "medium"
      }
    ];

    setResults(mockResults);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis Complete",
      description: `Detected ${mockResults.length} pollution sources with high confidence.`,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-danger text-danger-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-ocean border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2 text-primary" />
            AI-Powered Pollution Detection
          </CardTitle>
          <CardDescription>
            Upload marine images for real-time pollution analysis using advanced computer vision
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors hover:border-primary/50 cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className="max-w-full max-h-64 rounded-lg shadow-lg"
                  />
                  {results && (
                    <div className="absolute inset-0">
                      {results.map((result, index) => (
                        <div
                          key={index}
                          className="absolute border-2 border-danger bg-danger/20"
                          style={{
                            left: `${(result.location.x / 500) * 100}%`,
                            top: `${(result.location.y / 400) * 100}%`,
                            width: `${(result.location.width / 500) * 100}%`,
                            height: `${(result.location.height / 400) * 100}%`,
                          }}
                        >
                          <div className="absolute -top-6 left-0 bg-danger text-danger-foreground text-xs px-2 py-1 rounded">
                            {result.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={simulateAnalysis} disabled={isAnalyzing} className="bg-gradient-ocean">
                  <Zap className="w-4 h-4 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Analyze Image"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">Drop your marine image here</p>
                  <p className="text-sm text-muted-foreground">
                    Or click to browse • Supports JPG, PNG up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing with AI models...</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detection Results */}
          {results && !isAnalyzing && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Analysis detected {results.length} pollution sources. Review results below.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {results.map((result, index) => (
                  <Card key={index} className="shadow-marine">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getSeverityIcon(result.severity)}
                            <span className="font-medium">{result.type}</span>
                          </div>
                          <Badge className={getSeverityColor(result.severity)}>
                            {result.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{Math.round(result.confidence * 100)}% Confidence</div>
                          <div className="text-xs text-muted-foreground">AI Detection</div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          <MapPin className="w-4 h-4 mr-2" />
                          Add to Map
                        </Button>
                        <Button size="sm" variant="outline">
                          Generate Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { PollutionDetector };
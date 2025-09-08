import { pipeline } from '@huggingface/transformers';

// Cache for loaded models
let imageClassifier: any = null;
let textClassifier: any = null;
let sentimentAnalyzer: any = null;

export interface ImageAnalysisResult {
  type: string;
  confidence: number;
  location: { x: number; y: number; width: number; height: number };
  severity: "low" | "medium" | "high" | "critical";
}

export interface PolicyDocument {
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

export interface PolicyMatch {
  document: PolicyDocument;
  matchedSections: string[];
  complianceStatus: "compliant" | "violation" | "unclear";
  recommendations: string[];
}

// Initialize image classification model
async function getImageClassifier() {
  if (!imageClassifier) {
    try {
      imageClassifier = await pipeline(
        'image-classification',
        'google/vit-base-patch16-224',
        { device: 'webgpu' }
      );
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU');
      imageClassifier = await pipeline(
        'image-classification',
        'google/vit-base-patch16-224'
      );
    }
  }
  return imageClassifier;
}

// Initialize text classification model
async function getTextClassifier() {
  if (!textClassifier) {
    try {
      // Use a model with better ONNX support
      textClassifier = await pipeline(
        'text-classification',
        'distilbert-base-uncased-finetuned-sst-2-english',
        { device: 'webgpu' }
      );
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU');
      try {
        textClassifier = await pipeline(
          'text-classification',
          'distilbert-base-uncased-finetuned-sst-2-english'
        );
      } catch (fallbackError) {
        console.error('Failed to load text classifier:', fallbackError);
        throw new Error('Unable to load text analysis model');
      }
    }
  }
  return textClassifier;
}

// Initialize sentiment analysis model
async function getSentimentAnalyzer() {
  if (!sentimentAnalyzer) {
    try {
      // Use the same reliable model for consistency
      sentimentAnalyzer = await pipeline(
        'sentiment-analysis',
        'distilbert-base-uncased-finetuned-sst-2-english',
        { device: 'webgpu' }
      );
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU');
      try {
        sentimentAnalyzer = await pipeline(
          'sentiment-analysis',
          'distilbert-base-uncased-finetuned-sst-2-english'
        );
      } catch (fallbackError) {
        console.error('Failed to load sentiment analyzer:', fallbackError);
        throw new Error('Unable to load sentiment analysis model');
      }
    }
  }
  return sentimentAnalyzer;
}

// Analyze image for pollution detection
export async function analyzeImage(imageUrl: string, onProgress?: (progress: number) => void): Promise<ImageAnalysisResult[]> {
  try {
    onProgress?.(20);
    const classifier = await getImageClassifier();
    
    onProgress?.(40);
    const predictions = await classifier(imageUrl) as any[];
    
    onProgress?.(70);
    
    // Filter and map predictions to pollution-related categories
    const pollutionKeywords = ['plastic', 'waste', 'trash', 'debris', 'oil', 'spill', 'contamination', 'pollution', 'garbage', 'litter'];
    const results: ImageAnalysisResult[] = [];
    
    predictions.forEach((prediction, index) => {
      const label = prediction.label.toLowerCase();
      const score = prediction.score;
      
      // Check if prediction relates to pollution
      const isPollutionRelated = pollutionKeywords.some(keyword => 
        label.includes(keyword) || keyword.includes(label)
      );
      
      if (isPollutionRelated || score > 0.3) {
        let pollutionType = 'Unknown Pollution';
        let severity: "low" | "medium" | "high" | "critical" = 'low';
        
        if (label.includes('plastic') || label.includes('trash') || label.includes('garbage')) {
          pollutionType = 'Plastic Debris';
          severity = score > 0.7 ? 'high' : score > 0.5 ? 'medium' : 'low';
        } else if (label.includes('oil') || label.includes('spill')) {
          pollutionType = 'Oil Contamination';
          severity = score > 0.6 ? 'critical' : score > 0.4 ? 'high' : 'medium';
        } else if (label.includes('chemical') || label.includes('contamination')) {
          pollutionType = 'Chemical Waste';
          severity = score > 0.6 ? 'critical' : score > 0.4 ? 'high' : 'medium';
        } else {
          // Use the actual label if it doesn't match pollution categories
          pollutionType = prediction.label;
          severity = score > 0.8 ? 'high' : score > 0.6 ? 'medium' : 'low';
        }
        
        results.push({
          type: pollutionType,
          confidence: score,
          location: {
            x: Math.random() * 300 + 50, // Random positioning for demo
            y: Math.random() * 200 + 50,
            width: Math.random() * 150 + 100,
            height: Math.random() * 100 + 80
          },
          severity
        });
      }
    });
    
    onProgress?.(100);
    
    // If no pollution detected, add a generic result based on highest confidence
    if (results.length === 0 && predictions.length > 0) {
      const topPrediction = predictions[0];
      results.push({
        type: `Potential ${topPrediction.label}`,
        confidence: topPrediction.score,
        location: {
          x: Math.random() * 300 + 50,
          y: Math.random() * 200 + 50,
          width: Math.random() * 150 + 100,
          height: Math.random() * 100 + 80
        },
        severity: topPrediction.score > 0.7 ? 'medium' : 'low'
      });
    }
    
    return results.slice(0, 5); // Limit to top 5 results
  } catch (error) {
    console.error('Image analysis error:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
}

// Analyze text for policy matching
export async function analyzeText(text: string, onProgress?: (progress: number) => void): Promise<PolicyMatch[]> {
  try {
    onProgress?.(20);
    console.log('Starting text analysis for:', text.substring(0, 100) + '...');
    
    const classifier = await getTextClassifier();
    console.log('Text classifier loaded successfully');
    
    onProgress?.(40);
    
    // Classify sentiment first (simpler classification)
    const sentiment = await classifier(text) as any[];
    console.log('Sentiment analysis completed:', sentiment);
    
    onProgress?.(60);
    
    // Determine pollution type based on keywords
    const pollutionKeywords = {
      'plastic pollution': ['plastic', 'microplastic', 'bottle', 'bag', 'debris'],
      'oil spill': ['oil', 'spill', 'petroleum', 'crude', 'leak'],
      'chemical contamination': ['chemical', 'toxic', 'contamination', 'pollutant'],
      'marine debris': ['debris', 'trash', 'garbage', 'waste', 'litter'],
      'industrial waste': ['industrial', 'factory', 'discharge', 'effluent'],
      'sewage discharge': ['sewage', 'wastewater', 'runoff', 'drainage']
    };
    
    let detectedType = 'general pollution';
    let confidence = 0.5;
    
    for (const [type, keywords] of Object.entries(pollutionKeywords)) {
      const matchCount = keywords.filter(keyword => 
        text.toLowerCase().includes(keyword)
      ).length;
      if (matchCount > 0) {
        detectedType = type;
        confidence = Math.min(0.9, 0.5 + (matchCount * 0.1));
        break;
      }
    }
    
    console.log('Pollution type detected:', detectedType, 'with confidence:', confidence);
    
    onProgress?.(80);
    
    // Mock policy database for demonstration
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
      }
    ];
    
    // Generate policy matches based on classification
    const topPollutionType = detectedType;
    const analysisConfidence = confidence;
    
    const matches: PolicyMatch[] = policyDatabase.map((policy, index) => {
      const relevanceScore = Math.max(0.6, analysisConfidence * policy.relevanceScore);
      
      let complianceStatus: "compliant" | "violation" | "unclear" = "unclear";
      if (analysisConfidence > 0.8) {
        complianceStatus = index === 0 ? "violation" : index === 1 ? "unclear" : "compliant";
      }
      
      return {
        document: {
          ...policy,
          relevanceScore
        },
        matchedSections: [
          `Section related to ${topPollutionType}`,
          `Compliance requirements for ${topPollutionType}`
        ],
        complianceStatus,
        recommendations: [
          `Address ${topPollutionType} according to ${policy.title}`,
          'Implement immediate mitigation measures',
          'Report to relevant authorities as required'
        ]
      };
    });
    
    onProgress?.(100);
    
    return matches.sort((a, b) => b.document.relevanceScore - a.document.relevanceScore);
  } catch (error) {
    console.error('Text analysis error:', error);
    throw new Error('Failed to analyze text. Please try again.');
  }
}

// Extract text from uploaded files (basic implementation)
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      // For other file types, we'd need additional parsing libraries
      // For now, just return the filename as placeholder
      resolve(`Document: ${file.name} - Please use plain text files for full analysis.`);
    }
  });
}
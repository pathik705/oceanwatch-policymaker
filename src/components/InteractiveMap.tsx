import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Layers, Filter, AlertTriangle, Waves } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PollutionIncident {
  id: string;
  lat: number;
  lng: number;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  date: string;
  status: "active" | "monitoring" | "resolved";
  description: string;
}

const InteractiveMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedIncident, setSelectedIncident] = useState<PollutionIncident | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  // Mock pollution incident data
  const incidents: PollutionIncident[] = [
    {
      id: "1",
      lat: 25.7617,
      lng: -80.1918,
      type: "Plastic Debris",
      severity: "high",
      date: "2024-01-15",
      status: "active",
      description: "Large accumulation of plastic waste detected via satellite imagery"
    },
    {
      id: "2", 
      lat: 40.7128,
      lng: -74.0060,
      type: "Oil Spill",
      severity: "critical",
      date: "2024-01-14",
      status: "monitoring",
      description: "Oil contamination spreading along coastal areas"
    },
    {
      id: "3",
      lat: 34.0522,
      lng: -118.2437,
      type: "Chemical Waste",
      severity: "medium",
      date: "2024-01-12",
      status: "resolved",
      description: "Industrial runoff contained and cleaned"
    },
    {
      id: "4",
      lat: 37.7749,
      lng: -122.4194,
      type: "Microplastics",
      severity: "high",
      date: "2024-01-10",
      status: "active",
      description: "High concentration of microplastics detected"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-danger text-danger-foreground';
      case 'high': return 'bg-warning text-warning-foreground'; 
      case 'medium': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-danger text-danger-foreground';
      case 'monitoring': return 'bg-warning text-warning-foreground';
      case 'resolved': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const typeMatch = filterType === "all" || incident.type.toLowerCase().includes(filterType.toLowerCase());
    const severityMatch = filterSeverity === "all" || incident.severity === filterSeverity;
    return typeMatch && severityMatch;
  });

  useEffect(() => {
    // Simulate map initialization
    console.log("Map would be initialized with Mapbox GL JS here");
    // In a real implementation, you would initialize Mapbox here:
    // mapboxgl.accessToken = 'your-access-token';
    // const map = new mapboxgl.Map({ ... });
  }, []);

  return (
    <div className="space-y-6">
      <Card className="shadow-ocean border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary" />
            Global Pollution Monitoring Map
          </CardTitle>
          <CardDescription>
            Real-time visualization of marine pollution incidents worldwide
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Map Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="plastic">Plastic Debris</SelectItem>
                  <SelectItem value="oil">Oil Spill</SelectItem>
                  <SelectItem value="chemical">Chemical Waste</SelectItem>
                  <SelectItem value="microplastics">Microplastics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Layers className="w-4 h-4 mr-2" />
              Satellite View
            </Button>
          </div>

          {/* Map Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div 
                ref={mapContainerRef}
                className="h-[500px] rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-border relative overflow-hidden"
              >
                {/* Placeholder for actual map */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Waves className="w-16 h-16 mx-auto text-primary/50" />
                    <div>
                      <p className="text-lg font-medium text-muted-foreground">Interactive Map Loading</p>
                      <p className="text-sm text-muted-foreground">Mapbox integration would display here</p>
                    </div>
                  </div>
                </div>
                
                {/* Mock incident markers */}
                <div className="absolute inset-0">
                  {filteredIncidents.map((incident, index) => (
                    <div
                      key={incident.id}
                      className={`absolute w-4 h-4 rounded-full cursor-pointer transition-all hover:scale-125 ${
                        incident.severity === 'critical' ? 'bg-danger animate-pulse' :
                        incident.severity === 'high' ? 'bg-warning' :
                        incident.severity === 'medium' ? 'bg-accent' :
                        'bg-muted'
                      }`}
                      style={{
                        left: `${20 + index * 15}%`,
                        top: `${30 + index * 10}%`,
                      }}
                      onClick={() => setSelectedIncident(incident)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Incident List */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Active Incidents ({filteredIncidents.length})
              </h3>
              
              <div className="space-y-3 max-h-[450px] overflow-y-auto">
                {filteredIncidents.map((incident) => (
                  <Card 
                    key={incident.id}
                    className={`cursor-pointer transition-all hover:shadow-marine ${
                      selectedIncident?.id === incident.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{incident.type}</h4>
                        <Badge className={`text-xs ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {incident.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{incident.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap gap-4 items-center pt-4 border-t">
            <span className="text-sm font-medium">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-danger"></div>
              <span className="text-xs">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span className="text-xs">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <span className="text-xs">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted"></div>
              <span className="text-xs">Low</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { InteractiveMap };
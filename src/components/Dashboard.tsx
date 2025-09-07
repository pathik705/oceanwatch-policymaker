import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Camera, FileText, MapPin, Waves, Users, Activity } from "lucide-react";
import { PollutionDetector } from "./PollutionDetector";
import { InteractiveMap } from "./InteractiveMap";
import { PolicyAnalyzer } from "./PolicyAnalyzer";
import heroImage from "@/assets/hero-ocean-monitoring.jpg";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      title: "Pollution Incidents Detected",
      value: "1,247",
      change: "+12% from last month",
      icon: AlertTriangle,
      variant: "danger" as const,
    },
    {
      title: "Areas Monitored",
      value: "850 km²",
      change: "+5% expansion",
      icon: MapPin,
      variant: "primary" as const,
    },
    {
      title: "Policies Analyzed",
      value: "342",
      change: "Updated this week",
      icon: FileText,
      variant: "accent" as const,
    },
    {
      title: "Conservation Impact",
      value: "94%",
      change: "Compliance rate",
      icon: Waves,
      variant: "success" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-depth">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={heroImage}
          alt="Marine Conservation Technology"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground max-w-4xl px-6">
            <h1 className="text-5xl font-bold mb-4">Marine Pollution Intelligence</h1>
            <p className="text-xl mb-8 opacity-90">
              AI-powered platform for real-time marine pollution detection and policy analysis
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                <Camera className="w-5 h-5 mr-2" />
                Detect Pollution
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <MapPin className="w-5 h-5 mr-2" />
                View Map
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden border-0 shadow-marine">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  {stat.title}
                  <stat.icon className={`w-5 h-5 ${
                    stat.variant === 'danger' ? 'text-danger' :
                    stat.variant === 'primary' ? 'text-primary' :
                    stat.variant === 'accent' ? 'text-accent' :
                    'text-success'
                  }`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.change}</p>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                stat.variant === 'danger' ? 'bg-gradient-to-r from-danger to-warning' :
                stat.variant === 'primary' ? 'bg-gradient-ocean' :
                stat.variant === 'accent' ? 'bg-gradient-marine' :
                'bg-gradient-to-r from-success to-accent'
              }`} />
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="detection" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Camera className="w-4 h-4 mr-2" />
              Detection
            </TabsTrigger>
            <TabsTrigger value="mapping" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MapPin className="w-4 h-4 mr-2" />
              Mapping
            </TabsTrigger>
            <TabsTrigger value="policy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" />
              Policy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-ocean border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Waves className="w-5 h-5 mr-2 text-primary" />
                    Recent Pollution Alerts
                  </CardTitle>
                  <CardDescription>Latest detected incidents requiring attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { location: "North Pacific Gyre", type: "Plastic Debris", severity: "High", time: "2 hours ago" },
                    { location: "Mediterranean Coast", type: "Oil Spill", severity: "Critical", time: "4 hours ago" },
                    { location: "Caribbean Sea", type: "Chemical Waste", severity: "Medium", time: "6 hours ago" },
                  ].map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{alert.location}</p>
                        <p className="text-sm text-muted-foreground">{alert.type} • {alert.time}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.severity === 'Critical' ? 'bg-danger text-danger-foreground' :
                        alert.severity === 'High' ? 'bg-warning text-warning-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {alert.severity}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-marine border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-accent" />
                    Conservation Progress
                  </CardTitle>
                  <CardDescription>Global marine conservation efforts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Protected Areas</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2 bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Policy Compliance</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2 bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cleanup Initiatives</span>
                      <span>62%</span>
                    </div>
                    <Progress value={62} className="h-2 bg-muted" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="detection">
            <PollutionDetector />
          </TabsContent>

          <TabsContent value="mapping">
            <InteractiveMap />
          </TabsContent>

          <TabsContent value="policy">
            <PolicyAnalyzer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
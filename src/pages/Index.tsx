import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePollutionData } from '@/hooks/usePollutionData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Dashboard from '@/components/Dashboard';
import { PollutionDetector } from '@/components/PollutionDetector';
import { InteractiveMap } from '@/components/InteractiveMap';
import { PolicyAnalyzer } from '@/components/PolicyAnalyzer';
import { Waves, User, LogOut, Shield } from 'lucide-react';

export default function Index() {
  const { user, profile, loading, signOut } = useAuth();
  const { incidents } = usePollutionData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-ocean-light/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Waves className="h-12 w-12 text-ocean-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading Marine Guard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: Dashboard },
    { id: 'detector', label: 'Pollution Detection', component: PollutionDetector },
    { id: 'map', label: 'Interactive Map', component: InteractiveMap },
    { id: 'policy', label: 'Policy Analysis', component: PolicyAnalyzer },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-ocean-light/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Waves className="h-8 w-8 text-ocean-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Marine Guard</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Marine Protection Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {profile && (
                <Card className="p-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{profile.display_name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {profile.role?.replace('_', ' ')}
                        </Badge>
                        {profile.organization && (
                          <span className="text-xs text-muted-foreground">{profile.organization}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-ocean-primary text-ocean-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <ActiveComponent />
      </main>
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { lawyers as mockLawyers } from '@/lib/data';
import { MapPin, Search, Loader2, LocateFixed, Globe } from 'lucide-react';
import Header from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LawyerCard, type LawyerProfile } from '@/components/lawyer-card';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, getFirestore } from 'firebase/firestore';
import { app } from '@/firebase/client';
import { Skeleton } from '@/components/ui/skeleton';


type TabValue = 'all-india' | 'near-me';

export default function FindLawyerPage() {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>('all-india');
  
  const db = getFirestore(app);
  const lawyersRef = useMemo(() => collection(db, 'lawyers'), [db]);
  const { data: firestoreLawyers, isLoading: isLoadingFirestore } = useCollection<LawyerProfile>(lawyersRef);

  // Combine mock data and firestore data, ensuring no duplicates
  const allLawyers = useMemo(() => {
    const combined = [...mockLawyers];
    const mockIds = new Set(mockLawyers.map(l => l.id));
    
    if (firestoreLawyers) {
      firestoreLawyers.forEach(fl => {
        if (!mockIds.has(fl.id)) {
          combined.push(fl);
        }
      });
    }
    return combined;
  }, [firestoreLawyers]);


  const handleUseLocation = () => {
    setIsLocating(true);
    setCurrentLocation(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        // In a real app, you'd use reverse geocoding to get a city/state.
        // For this mock, we'll just filter by a known location.
        const mockCity = "Bengaluru";
        setCurrentLocation(mockCity);
        toast({
          title: "Location Found",
          description: `Showing lawyers in ${mockCity}...`,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        toast({
          variant: "destructive",
          title: "Location Error",
          description: "Could not get your location. Please check your browser permissions.",
        });
      }
    );
  };
  
  const handleShowAll = () => {
    setCurrentLocation(null);
    setActiveTab('all-india');
  }

  const filteredLawyers = useMemo(() => {
    if (activeTab === 'all-india') {
      return allLawyers;
    }
    if (activeTab === 'near-me' && currentLocation) {
      return allLawyers.filter(lawyer => lawyer.location.city === currentLocation);
    }
    return allLawyers; // Return all if no location set on near-me tab yet
  }, [activeTab, currentLocation, allLawyers]);
  
  const renderContent = () => {
    if (isLoadingFirestore || isLocating) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    if (filteredLawyers.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer) => (
            <LawyerCard key={lawyer.id} lawyer={lawyer} />
          ))}
        </div>
      );
    }

    if (activeTab === 'near-me' && !currentLocation) {
        return (
            <div className="flex flex-col items-center justify-center text-center gap-4 p-8 rounded-lg border-2 border-dashed">
              <MapPin className="h-10 w-10 text-muted-foreground" />
              <h3 className="font-semibold">Use Your Location</h3>
              <p className="text-muted-foreground">Allow location access to find verified lawyers near you.</p>
            </div>
        );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 p-8 rounded-lg border-2 border-dashed">
        <Search className="h-10 w-10 text-muted-foreground" />
        <h3 className="font-semibold">No Verified Lawyers Found</h3>
        <p className="text-muted-foreground">There are no verified lawyers matching your criteria.</p>
      </div>
    );
  };

  const getHeading = () => {
    if (activeTab === 'all-india') return "Showing All Lawyers in India";
    if (currentLocation) return `Showing Results for ${currentLocation}`;
    return 'Results';
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Find a Verified Professional
            </CardTitle>
            <CardDescription>Search our network of verified lawyers by location.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all-india" onClick={handleShowAll}>
                  <Globe className="mr-2 h-4 w-4" />
                  All Over India
                </TabsTrigger>
                <TabsTrigger value="near-me">
                  <LocateFixed className="mr-2 h-4 w-4" />
                  Near Me
                </TabsTrigger>
              </TabsList>
              <TabsContent value="near-me" className="mt-4">
                <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg border">
                  <h3 className="font-semibold text-lg">Find Lawyers Near You</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">Use your device's location to find verified legal professionals in your immediate area.</p>
                  <Button onClick={handleUseLocation} disabled={isLocating}>
                    {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                    Use My Current Location
                  </Button>
                </div>
              </TabsContent>
               <TabsContent value="all-india" className="mt-4">
                 <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg border">
                    <h3 className="font-semibold text-lg">All Lawyers</h3>
                    <p className="text-muted-foreground">Showing all verified lawyers from our network across India.</p>
                 </div>
               </TabsContent>
            </Tabs>
            
            <div className="mt-8">
              <h2 className="font-headline text-xl mb-4">
                {getHeading()}
              </h2>
              {renderContent()}
            </div>
            
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

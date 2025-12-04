
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { lawyers, popularCitiesByState } from '@/lib/data';
import { MapPin, Search, Loader2, LocateFixed } from 'lucide-react';
import Header from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LawyerCard, type LawyerProfile, type ExternalLawyerProfile } from '@/components/lawyer-card';
import { useToast } from '@/hooks/use-toast';
import { findLawyersExternally } from '@/app/actions';

type TabValue = 'cities' | 'near-me';

export default function FindLawyerPage() {
  const { toast } = useToast();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isExternalSearchLoading, setIsExternalSearchLoading] = useState(false);
  const [externalResults, setExternalResults] = useState<ExternalLawyerProfile[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>('cities');

  const handleCityClick = (city: string) => {
    setSelectedCity(city);
    setExternalResults([]);
  };

  const handleExternalSearch = async (location: string) => {
    setIsExternalSearchLoading(true);
    setExternalResults([]);
    setSelectedCity(location);
    try {
      const results = await findLawyersExternally(location);
      setExternalResults(results);
    } catch (error) {
      console.error("External search failed:", error);
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: 'Could not fetch external results. Please try again later.'
      });
    } finally {
      setIsExternalSearchLoading(false);
    }
  };
  
  const handleUseLocation = () => {
    setIsLocating(true);
    setExternalResults([]);
    setSelectedCity(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        toast({
          title: "Location Found",
          description: "Searching for lawyers near you...",
        });
        // In a real app, you'd use reverse geocoding here.
        // For now, we trigger the external search for the user's general area.
        handleExternalSearch("your current area");
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

  const filteredLawyers = useMemo(() => {
    if (!selectedCity || selectedCity === "your current area") return [];
    return lawyers.filter(lawyer => lawyer.location.city === selectedCity);
  }, [selectedCity]);
  
  const renderContent = () => {
    const hasInternalResults = filteredLawyers.length > 0;
    const hasExternalResults = externalResults.length > 0;
    const isSearching = isLocating || isExternalSearchLoading;

    if (isSearching) {
      return (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">{isExternalSearchLoading ? "Searching for lawyers..." : "Getting your location..."}</p>
        </div>
      );
    }

    if (hasExternalResults) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {externalResults.map((lawyer, index) => (
            <LawyerCard key={index} lawyer={lawyer} />
          ))}
        </div>
      );
    }

    if (selectedCity && !hasInternalResults) {
      return (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-8 rounded-lg border-2 border-dashed">
          <MapPin className="h-10 w-10 text-muted-foreground" />
          <h3 className="font-semibold">No Verified Lawyers Found</h3>
          <p className="text-muted-foreground">We don't have any verified lawyers in {selectedCity} yet.</p>
          <Button onClick={() => handleExternalSearch(selectedCity)}>
            <Search className="mr-2 h-4 w-4" />
            Search Externally for Lawyers in {selectedCity}
          </Button>
        </div>
      );
    }
    
    if (hasInternalResults) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer) => (
            <LawyerCard key={lawyer.id} lawyer={lawyer} />
          ))}
        </div>
      );
    }
    
    return (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-8 rounded-lg border-2 border-dashed">
          <MapPin className="h-10 w-10 text-muted-foreground" />
          <h3 className="font-semibold">Select a Location</h3>
          <p className="text-muted-foreground">Choose a city or use your current location to find lawyers.</p>
        </div>
    )
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Find a Legal Professional
            </CardTitle>
            <CardDescription>Search for lawyers by selecting a city or using your current location.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cities">Popular Cities</TabsTrigger>
                <TabsTrigger value="near-me">Near Me</TabsTrigger>
              </TabsList>
              <TabsContent value="cities" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Select a City</CardTitle>
                    <CardDescription>Choose from our list of popular cities to find a lawyer.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-4">
                        {Object.entries(popularCitiesByState).map(([state, cities]) => (
                          <div key={state}>
                            <h3 className="font-semibold text-primary mb-2">{state}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                              {cities.map(city => (
                                <Button
                                  key={city}
                                  variant={selectedCity === city ? "default" : "outline"}
                                  onClick={() => handleCityClick(city)}
                                  className='justify-start'
                                >
                                  {city}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="near-me" className="mt-4">
                <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg border">
                  <LocateFixed className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-lg">Find Lawyers Near You</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">Use your device's location to find verified legal professionals in your immediate area.</p>
                  <Button onClick={handleUseLocation} disabled={isLocating}>
                    {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                    Use My Current Location
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8">
              <h2 className="font-headline text-xl mb-4">
                {selectedCity ? `Showing Results for ${selectedCity}` : 'Results'}
              </h2>
              {renderContent()}
            </div>
            
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

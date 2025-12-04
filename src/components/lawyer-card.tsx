
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Phone, Mail, Map, ExternalLink, ShieldCheck } from 'lucide-react';

export type LawyerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: { city: string; state: string };
  specializations: string[];
  experience: number;
  description: string;
  rating: number;
  isVerified: boolean;
  source: 'internal';
};

export type ExternalLawyerProfile = {
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  url: string;
  source: 'google';
};

type LawyerCardProps = {
  lawyer: LawyerProfile | ExternalLawyerProfile;
};

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="h-4 w-4 fill-primary text-primary" />)}
      {halfStar && <Star key="half" className="h-4 w-4 fill-primary text-primary" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />}
      {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="h-4 w-4 fill-muted text-muted-foreground" />)}
    </div>
  );
};

export function LawyerCard({ lawyer }: LawyerCardProps) {
  if (lawyer.source === 'internal') {
    return (
      <Card className="flex flex-col">
        <CardContent className="p-6 flex flex-col flex-1">
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={`https://picsum.photos/seed/${lawyer.id}/200`} data-ai-hint="person professional" />
              <AvatarFallback>{lawyer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {lawyer.name} 
                {lawyer.isVerified && <ShieldCheck className="h-5 w-5 text-green-500 fill-current" titleAccess='Verified Professional' />}
              </h3>
              <p className="text-primary text-sm font-medium">{lawyer.specializations[0]}</p>
              <p className="text-muted-foreground text-sm">{lawyer.location.city}, {lawyer.location.state}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
              {renderStars(lawyer.rating)}
              <span className="text-xs text-muted-foreground">({lawyer.rating.toFixed(1)})</span>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{lawyer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{lawyer.phone}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t flex-1 flex flex-col justify-end">
            <Button className="w-full">Message Now</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card for external (Google) results
  return (
    <Card className="flex flex-col bg-secondary/50 border-dashed">
      <CardContent className="p-6 flex flex-col flex-1">
        <div className='flex-1'>
            <h3 className="font-semibold text-lg">{lawyer.name}</h3>
            <div className="flex items-center gap-2 mt-1">
                {renderStars(lawyer.rating)}
                <span className="text-xs text-muted-foreground">
                  {lawyer.rating.toFixed(1)} ({lawyer.user_ratings_total} reviews)
                </span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground mt-3 text-sm">
                <Map className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{lawyer.vicinity}</p>
            </div>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <Badge variant="outline">From Google</Badge>
            <Button asChild variant="ghost" size="sm">
                <a href={lawyer.url} target="_blank" rel="noopener noreferrer">
                Directions <ExternalLink className="ml-2 h-4 w-4" />
                </a>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

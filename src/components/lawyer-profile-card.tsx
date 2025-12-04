'use client';

import { useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, getFirestore, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/firebase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Loader2, FilePlus } from 'lucide-react';

const lawyerProfileSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  phone: z.string().min(10, 'A valid phone number is required.'),
  'location.city': z.string().min(2, 'City is required.'),
  'location.state': z.string().min(2, 'State is required.'),
  specializations: z.string().min(2, 'At least one specialization is required.'),
  experience: z.coerce.number().min(0, 'Experience cannot be negative.'),
  description: z.string().min(20, 'A brief description is required (min. 20 characters).'),
});

type LawyerFormData = z.infer<typeof lawyerProfileSchema>;

function LawyerProfileForm({ lawyerData, lawyerId, isNewProfile }: { lawyerData: any, lawyerId: string, isNewProfile: boolean }) {
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<LawyerFormData>({
    resolver: zodResolver(lawyerProfileSchema),
    defaultValues: {
      name: lawyerData?.name || '',
      phone: lawyerData?.phone || '',
      'location.city': lawyerData?.location?.city || '',
      'location.state': lawyerData?.location?.state || '',
      specializations: lawyerData?.specializations?.join(', ') || '',
      experience: lawyerData?.experience || 0,
      description: lawyerData?.description || '',
    },
  });

  const onSubmit = async (data: LawyerFormData) => {
    const db = getFirestore(app);
    const lawyerRef = doc(db, 'lawyers', lawyerId);
    try {
      const updateData = {
        name: data.name,
        phone: data.phone,
        location: {
          city: data['location.city'],
          state: data['location.state'],
        },
        specializations: data.specializations.split(',').map(s => s.trim()),
        experience: data.experience,
        description: data.description,
        lastUpdated: serverTimestamp(),
      };
      
      if (isNewProfile) {
          const newLawyerData = {
            ...updateData,
            id: lawyerId,
            email: lawyerData.email, // This should come from auth user, passed in
            isVerified: true, // Auto-verified
            rating: 4.0,
            createdAt: serverTimestamp(),
            source: 'internal'
          };
          await setDoc(lawyerRef, newLawyerData);
          toast({
            title: 'Profile Created',
            description: 'Your professional profile has been created.',
          });
      } else {
        await updateDoc(lawyerRef, updateData);
        toast({
          title: 'Profile Updated',
          description: 'Your professional profile has been saved.',
        });
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your profile. Please try again.',
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" {...register('phone')} />
          {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="location.city">City</Label>
          <Input id="location.city" {...register('location.city')} />
          {errors['location.city'] && <p className="text-destructive text-sm">{errors['location.city'].message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="location.state">State</Label>
          <Input id="location.state" {...register('location.state')} />
          {errors['location.state'] && <p className="text-destructive text-sm">{errors['location.state'].message}</p>}
        </div>
         <div className="space-y-2">
          <Label htmlFor="experience">Years of Experience</Label>
          <Input id="experience" type="number" {...register('experience')} />
          {errors.experience && <p className="text-destructive text-sm">{errors.experience.message}</p>}
        </div>
         <div className="space-y-2">
          <Label htmlFor="specializations">Specializations (comma-separated)</Label>
          <Input id="specializations" {...register('specializations')} />
          {errors.specializations && <p className="text-destructive text-sm">{errors.specializations.message}</p>}
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">Professional Bio</Label>
          <Textarea id="description" {...register('description')} rows={5}/>
          {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : (isNewProfile ? 'Create Profile' : 'Save Changes')}
        </Button>
      </div>
    </form>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2"> <Skeleton className="h-4 w-1/4" /> <Skeleton className="h-10 w-full" /> </div>
          <div className="space-y-2"> <Skeleton className="h-4 w-1/4" /> <Skeleton className="h-10 w-full" /> </div>
          <div className="space-y-2"> <Skeleton className="h-4 w-1/4" /> <Skeleton className="h-10 w-full" /> </div>
          <div className="space-y-2"> <Skeleton className="h-4 w-1/4" /> <Skeleton className="h-10 w-full" /> </div>
          <div className="space-y-2"> <Skeleton className="h-4 w-1/4" /> <Skeleton className="h-10 w-full" /> </div>
          <div className="space-y-2"> <Skeleton className="h-4 w-1/4" /> <Skeleton className="h-10 w-full" /> </div>
          <div className="md:col-span-2 space-y-2"> <Skeleton className="h-4 w-1/4" /> <Skeleton className="h-24 w-full" /> </div>
        </div>
        <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
        </div>
    </div>
  );
}


export function LawyerProfileCard() {
  const { user } = useAuth();
  
  const lawyerDocRef = useMemo(() => {
    if (!user) return null;
    const db = getFirestore(app);
    return doc(db, 'lawyers', user.uid);
  }, [user]);

  const { data: lawyerData, isLoading } = useDoc(lawyerDocRef);

  if (!user) {
    return <p className="text-muted-foreground">Please log in to manage your profile.</p>;
  }

  const isNewProfile = !isLoading && !lawyerData;
  const cardTitle = isNewProfile ? "Create Your Professional Profile" : "Your Professional Profile";
  const cardDescription = isNewProfile
    ? "Fill out the form below to create your public lawyer profile."
    : "This information is visible to potential clients. Keep it up-to-date.";
  const cardIcon = isNewProfile ? <FilePlus className="h-6 w-6 text-primary" /> : <Briefcase className="h-6 w-6 text-primary" />;
  
  return (
    <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
              {cardIcon}
              {cardTitle}
          </CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading && <LoadingSkeleton />}
            {!isLoading && user && <LawyerProfileForm lawyerData={lawyerData || { email: user.email }} lawyerId={user.uid} isNewProfile={isNewProfile} />}
        </CardContent>
    </Card>
  )
}

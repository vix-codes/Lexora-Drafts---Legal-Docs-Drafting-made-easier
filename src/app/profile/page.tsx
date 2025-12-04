
'use client';

import { useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, getFirestore, updateDoc } from 'firebase/firestore';
import { app } from '@/firebase/client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Briefcase } from 'lucide-react';

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

function LawyerProfileForm({ lawyerData }: { lawyerData: any }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<LawyerFormData>({
    resolver: zodResolver(lawyerProfileSchema),
    defaultValues: {
      name: lawyerData.name || '',
      phone: lawyerData.phone || '',
      'location.city': lawyerData.location?.city || '',
      'location.state': lawyerData.location?.state || '',
      specializations: lawyerData.specializations?.join(', ') || '',
      experience: lawyerData.experience || 0,
      description: lawyerData.description || '',
    },
  });

  const onSubmit = async (data: LawyerFormData) => {
    if (!user) return;
    const db = getFirestore(app);
    const lawyerRef = doc(db, 'lawyers', user.uid);
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
      };
      await updateDoc(lawyerRef, updateData);
      toast({
        title: 'Profile Updated',
        description: 'Your professional profile has been saved.',
      });
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
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

function UserProfileCard({ userData }: { userData: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/> User Profile</CardTitle>
        <CardDescription>Your account details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="font-semibold text-muted-foreground">Username</p>
          <p>{userData.username}</p>
        </div>
        <div>
          <p className="font-semibold text-muted-foreground">Email</p>
          <p>{userData.email}</p>
        </div>
        <div>
          <p className="font-semibold text-muted-foreground">Account Created</p>
          <p>{userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  )
}


export default function ProfilePage() {
  const { user } = useAuth();
  
  const userDocRef = useMemo(() => {
    if (!user) return null;
    const db = getFirestore(app);
    return doc(db, 'users', user.uid);
  }, [user]);
  
  const lawyerDocRef = useMemo(() => {
    if (!user) return null;
    const db = getFirestore(app);
    return doc(db, 'lawyers', user.uid);
  }, [user]);

  const { data: userData, isLoading: isUserLoading } = useDoc(userDocRef);
  const { data: lawyerData, isLoading: isLawyerLoading } = useDoc(lawyerDocRef);

  const renderLoading = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-24 w-full" />
        </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 lg:p-6">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          {isUserLoading || isLawyerLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2"/>
                <Skeleton className="h-4 w-3/4"/>
              </CardHeader>
              <CardContent>
                {renderLoading()}
              </CardContent>
            </Card>
          ) : lawyerData ? (
             <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Lawyer Profile
                </CardTitle>
                <CardDescription>Manage your professional details that appear to clients.</CardDescription>
              </CardHeader>
              <CardContent>
                <LawyerProfileForm lawyerData={lawyerData} />
              </CardContent>
            </Card>
          ) : userData ? (
            <UserProfileCard userData={userData} />
          ) : (
             <Card>
              <CardHeader>
                <CardTitle>Profile Not Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We couldn't find a profile associated with your account.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

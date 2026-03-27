'use client';

import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, User } from 'lucide-react';

const TIMEZONE_OPTIONS = [
  // Americas
  { value: 'America/New_York', label: 'US Eastern (New York)' },
  { value: 'America/Chicago', label: 'US Central (Chicago)' },
  { value: 'America/Denver', label: 'US Mountain (Denver)' },
  { value: 'America/Los_Angeles', label: 'US Pacific (Los Angeles)' },
  { value: 'America/Anchorage', label: 'US Alaska (Anchorage)' },
  { value: 'Pacific/Honolulu', label: 'US Hawaii (Honolulu)' },
  { value: 'America/Toronto', label: 'Canada Eastern (Toronto)' },
  { value: 'America/Vancouver', label: 'Canada Pacific (Vancouver)' },
  { value: 'America/Mexico_City', label: 'Mexico (Mexico City)' },
  { value: 'America/Sao_Paulo', label: 'Brazil (Sao Paulo)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (Buenos Aires)' },
  { value: 'America/Bogota', label: 'Colombia (Bogota)' },
  // Europe
  { value: 'Europe/London', label: 'UK (London)' },
  { value: 'Europe/Paris', label: 'Central Europe (Paris)' },
  { value: 'Europe/Berlin', label: 'Central Europe (Berlin)' },
  { value: 'Europe/Amsterdam', label: 'Central Europe (Amsterdam)' },
  { value: 'Europe/Madrid', label: 'Central Europe (Madrid)' },
  { value: 'Europe/Rome', label: 'Central Europe (Rome)' },
  { value: 'Europe/Zurich', label: 'Central Europe (Zurich)' },
  { value: 'Europe/Stockholm', label: 'Central Europe (Stockholm)' },
  { value: 'Europe/Helsinki', label: 'Eastern Europe (Helsinki)' },
  { value: 'Europe/Bucharest', label: 'Eastern Europe (Bucharest)' },
  { value: 'Europe/Moscow', label: 'Russia (Moscow)' },
  { value: 'Europe/Istanbul', label: 'Turkey (Istanbul)' },
  // Asia
  { value: 'Asia/Dubai', label: 'Gulf (Dubai)' },
  { value: 'Asia/Kolkata', label: 'India (Kolkata)' },
  { value: 'Asia/Bangkok', label: 'Indochina (Bangkok)' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Manila', label: 'Philippines (Manila)' },
  { value: 'Asia/Shanghai', label: 'China (Shanghai)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { value: 'Asia/Tokyo', label: 'Japan (Tokyo)' },
  { value: 'Asia/Seoul', label: 'South Korea (Seoul)' },
  { value: 'Asia/Jakarta', label: 'Indonesia (Jakarta)' },
  // Oceania
  { value: 'Australia/Sydney', label: 'Australia Eastern (Sydney)' },
  { value: 'Australia/Melbourne', label: 'Australia Eastern (Melbourne)' },
  { value: 'Australia/Perth', label: 'Australia Western (Perth)' },
  { value: 'Pacific/Auckland', label: 'New Zealand (Auckland)' },
  // Africa
  { value: 'Africa/Cairo', label: 'Egypt (Cairo)' },
  { value: 'Africa/Johannesburg', label: 'South Africa (Johannesburg)' },
  { value: 'Africa/Lagos', label: 'West Africa (Lagos)' },
  { value: 'Africa/Nairobi', label: 'East Africa (Nairobi)' },
];

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  avatarUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  timezone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton variant="text" className="h-8 w-48" />
          <Skeleton variant="card" className="h-96" />
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}

function SettingsPageContent() {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      avatarUrl: user?.avatarUrl ?? '',
      timezone: user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await api.patch('/users/me', {
        firstName: values.firstName,
        lastName: values.lastName,
        avatarUrl: values.avatarUrl || undefined,
        timezone: values.timezone || undefined,
      });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to update profile',
      );
    }
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and profile preferences.
        </p>
      </div>

      {/* Profile card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Profile</CardTitle>
              <CardDescription>
                Update your personal information.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium text-foreground"
                >
                  First Name
                </label>
                <Input
                  id="firstName"
                  placeholder="Jerome"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium text-foreground"
                >
                  Last Name
                </label>
                <Input
                  id="lastName"
                  placeholder="Hipolito"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="avatarUrl"
                className="text-sm font-medium text-foreground"
              >
                Avatar URL
              </label>
              <Input
                id="avatarUrl"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                {...register('avatarUrl')}
              />
              {errors.avatarUrl && (
                <p className="text-sm text-destructive">
                  {errors.avatarUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Select
                label="Timezone"
                options={TIMEZONE_OPTIONS}
                {...register('timezone')}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

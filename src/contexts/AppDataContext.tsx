import { createContext, useContext, useEffect, useState } from 'react';
import type {
  AppDataset,
  AIInsightsData,
  Donation,
  Event,
  FoodRequest,
  NewCommentInput,
  NewDonationInput,
  NewEventInput,
  NewRequestInput,
  Organization,
  OrganizationOnboardingInput,
  Profile,
  RequestComment,
  UserOnboardingInput,
} from '@/types';
import { supabase } from '@/lib/supabase';
import { mapComment, mapDonation, mapEvent, mapOrganization, mapProfile, mapRequest } from '@/utils/mappers';
import { isExpiringSoon, urgencyRank } from '@/utils/formatters';

interface AppDataContextValue extends AppDataset {
  loading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  completeUserOnboarding: (profileId: string, input: UserOnboardingInput) => Promise<Profile | null>;
  completeOrganizationOnboarding: (profileId: string, input: OrganizationOnboardingInput) => Promise<Organization | null>;
  addDonation: (organizationId: string, input: NewDonationInput & { imageFile?: File | null }) => Promise<Donation>;
  addRequest: (profileId: string, input: NewRequestInput & { imageFile?: File | null }) => Promise<FoodRequest>;
  addEvent: (organizationId: string, input: NewEventInput & { imageFile?: File | null }) => Promise<Event>;
  addComment: (profileId: string, input: NewCommentInput) => Promise<RequestComment>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

const emptyInsights: AIInsightsData = {
  forecast: [],
  categoryForecasts: [],
  hotspots: [],
  expiryQueue: [],
  alerts: [],
  smartRecommendations: [],
  urgencyBreakdown: [],
};

function buildInsights(donations: Donation[], requests: FoodRequest[]): AIInsightsData {
  const urgencyBreakdown = ['low', 'medium', 'high', 'critical'].map((level) => ({
    name: level[0].toUpperCase() + level.slice(1),
    value: requests.filter((request) => request.urgency === level).length,
  }));

  const expiryQueue = donations
    .filter((donation) => donation.status === 'active')
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    .slice(0, 3)
    .map((donation) => ({
      donationId: donation.id,
      title: donation.title,
      hoursLeft: Math.max(1, Math.round((new Date(donation.expiryDate).getTime() - Date.now()) / 36e5)),
      locationText: donation.pickupAddress,
    }));

  const hotspotMap = new Map<string, number>();
  requests.forEach((request) => {
    const key = request.locationText || 'Unknown';
    hotspotMap.set(key, (hotspotMap.get(key) ?? 0) + 1);
  });

  const hotspots = Array.from(hotspotMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area, count], index) => ({
      id: `hotspot-${index}`,
      area,
      riskScore: Math.min(95, 60 + count * 5),
      requestCount: count,
      donationCoverage: Math.max(15, 80 - count * 6),
      recommendation: 'Increase distribution coverage in this area.',
    }));

  const smartRecommendations = [
    requests.length
      ? `${requests.filter((r) => urgencyRank(r.urgency) >= 3).length} urgent requests need response today.`
      : 'No urgent requests detected yet.',
    donations.length
      ? `${donations.filter((d) => isExpiringSoon(d.expiryDate)).length} donations expiring soon.`
      : 'No active donations yet.',
  ];

  return {
    ...emptyInsights,
    urgencyBreakdown,
    expiryQueue,
    hotspots,
    smartRecommendations,
  };
}

async function uploadImage(file: File, folder: string) {
  if (!supabase) return null;
  const filename = `${folder}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from('grabme-assets').upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) {
    throw error;
  }
  const { data } = supabase.storage.from('grabme-assets').getPublicUrl(filename);
  return data.publicUrl;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppDataset>({
    profiles: [],
    organizations: [],
    donations: [],
    requests: [],
    events: [],
    comments: [],
    aiInsights: emptyInsights,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAll = async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const [profilesRes, organizationsRes, donationsRes, requestsRes, eventsRes, commentsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('organizations').select('*').order('created_at', { ascending: false }),
      supabase.from('donations').select('*').order('created_at', { ascending: false }),
      supabase.from('requests').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*').order('created_at', { ascending: false }),
      supabase.from('comments').select('*').order('created_at', { ascending: false }),
    ]);

    const firstError =
      profilesRes.error ||
      organizationsRes.error ||
      donationsRes.error ||
      requestsRes.error ||
      eventsRes.error ||
      commentsRes.error;

    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    const profiles = (profilesRes.data ?? []).map(mapProfile);
    const organizations = (organizationsRes.data ?? []).map(mapOrganization);
    const donations = (donationsRes.data ?? []).map(mapDonation);
    const requests = (requestsRes.data ?? []).map(mapRequest);
    const events = (eventsRes.data ?? []).map(mapEvent);
    const comments = (commentsRes.data ?? []).map(mapComment);

    setData({
      profiles,
      organizations,
      donations,
      requests,
      events,
      comments,
      aiInsights: buildInsights(donations, requests),
    });
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const completeUserOnboarding: AppDataContextValue['completeUserOnboarding'] = async (profileId, input) => {
    if (!supabase) return null;
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({
        name: input.name,
        phone: input.phone ?? null,
        location_text: input.locationText,
        lat: input.lat,
        lng: input.lng,
        onboarding_complete: true,
      })
      .eq('id', profileId)
      .select('*')
      .single();

    if (updateError || !updated) {
      return null;
    }

    const profile = mapProfile(updated);
    setData((current) => ({
      ...current,
      profiles: current.profiles.map((entry) => (entry.id === profileId ? profile : entry)),
    }));
    return profile;
  };

  const completeOrganizationOnboarding: AppDataContextValue['completeOrganizationOnboarding'] = async (
    profileId,
    input,
  ) => {
    if (!supabase) return null;
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .upsert({
        profile_id: profileId,
        organization_name: input.organizationName,
        address: input.address,
        organization_type: input.organizationType,
        operating_hours: input.operatingHours,
        capacity: input.capacity,
        food_types: input.foodTypes,
        lat: input.lat,
        lng: input.lng,
      })
      .select('*')
      .single();

    if (orgError || !org) {
      return null;
    }

    const { data: profileUpdated } = await supabase
      .from('profiles')
      .update({
        name: input.organizationName,
        location_text: input.address,
        lat: input.lat,
        lng: input.lng,
        onboarding_complete: true,
      })
      .eq('id', profileId)
      .select('*')
      .single();

    const mappedOrg = mapOrganization(org);
    setData((current) => ({
      ...current,
      organizations: current.organizations.some((entry) => entry.id === mappedOrg.id)
        ? current.organizations.map((entry) => (entry.id === mappedOrg.id ? mappedOrg : entry))
        : [mappedOrg, ...current.organizations],
      profiles: profileUpdated
        ? current.profiles.map((entry) => (entry.id === profileId ? mapProfile(profileUpdated) : entry))
        : current.profiles,
    }));

    return mappedOrg;
  };

  const addDonation: AppDataContextValue['addDonation'] = async (organizationId, input) => {
    if (!supabase) throw new Error('Supabase not configured');
    const imageUrl = input.imageFile ? await uploadImage(input.imageFile, 'donations') : null;

    const { data: row, error: insertError } = await supabase
      .from('donations')
      .insert({
        organization_id: organizationId,
        title: input.title,
        description: input.description,
        category: input.category,
        quantity: input.quantity,
        expiry_date: input.expiryDate,
        pickup_address: input.pickupAddress,
        lat: input.lat,
        lng: input.lng,
        status: 'active',
        available_from: input.availableFrom,
        available_until: input.availableUntil,
        storage_type: input.storageType,
        notes: input.notes,
        image_url: imageUrl,
      })
      .select('*')
      .single();

    if (insertError || !row) {
      throw insertError ?? new Error('Failed to create donation');
    }

    const donation = mapDonation(row);
    setData((current) => ({
      ...current,
      donations: [donation, ...current.donations],
      aiInsights: buildInsights([donation, ...current.donations], current.requests),
    }));
    return donation;
  };

  const addRequest: AppDataContextValue['addRequest'] = async (profileId, input) => {
    if (!supabase) throw new Error('Supabase not configured');
    const imageUrl = input.imageFile ? await uploadImage(input.imageFile, 'requests') : null;

    const { data: row, error: insertError } = await supabase
      .from('requests')
      .insert({
        profile_id: profileId,
        title: input.title,
        description: input.description,
        comment: input.comment,
        people_count: input.peopleCount,
        urgency: input.urgency,
        food_type: input.foodType,
        location_text: input.locationText,
        lat: input.lat,
        lng: input.lng,
        status: 'active',
        image_url: imageUrl,
      })
      .select('*')
      .single();

    if (insertError || !row) {
      throw insertError ?? new Error('Failed to create request');
    }

    const request = mapRequest(row);
    setData((current) => ({
      ...current,
      requests: [request, ...current.requests],
      aiInsights: buildInsights(current.donations, [request, ...current.requests]),
    }));
    return request;
  };

  const addEvent: AppDataContextValue['addEvent'] = async (organizationId, input) => {
    if (!supabase) throw new Error('Supabase not configured');
    const imageUrl = input.imageFile ? await uploadImage(input.imageFile, 'events') : null;

    const { data: row, error: insertError } = await supabase
      .from('events')
      .insert({
        organization_id: organizationId,
        title: input.title,
        description: input.description,
        event_date: input.eventDate,
        address: input.address,
        lat: input.lat,
        lng: input.lng,
        food_type: input.foodType,
        capacity: input.capacity,
        notes: input.notes,
        status: 'scheduled',
        image_url: imageUrl,
      })
      .select('*')
      .single();

    if (insertError || !row) {
      throw insertError ?? new Error('Failed to create event');
    }

    const event = mapEvent(row);
    setData((current) => ({
      ...current,
      events: [event, ...current.events],
    }));
    return event;
  };

  const addComment: AppDataContextValue['addComment'] = async (profileId, input) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data: row, error: insertError } = await supabase
      .from('comments')
      .insert({
        profile_id: profileId,
        request_id: input.requestId,
        content: input.content,
      })
      .select('*')
      .single();

    if (insertError || !row) {
      throw insertError ?? new Error('Failed to create comment');
    }

    const comment = mapComment(row);
    setData((current) => ({
      ...current,
      comments: [comment, ...current.comments],
    }));
    return comment;
  };

  return (
    <AppDataContext.Provider
      value={{
        ...data,
        loading,
        error,
        refreshAll,
        completeUserOnboarding,
        completeOrganizationOnboarding,
        addDonation,
        addRequest,
        addEvent,
        addComment,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }

  return context;
}

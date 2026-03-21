import { createContext, useContext, useEffect, useState } from 'react';
import { mockData } from '@/data/mockData';
import type {
  AppDataset,
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
  UserRole,
} from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';

interface AppDataContextValue extends AppDataset {
  createProfile: (input: { role: UserRole; name: string; email: string }) => Profile;
  completeUserOnboarding: (profileId: string, input: UserOnboardingInput) => Profile | null;
  completeOrganizationOnboarding: (
    profileId: string,
    input: OrganizationOnboardingInput,
  ) => Organization | null;
  addDonation: (organizationId: string, input: NewDonationInput) => Donation;
  addRequest: (profileId: string, input: NewRequestInput) => FoodRequest;
  addEvent: (organizationId: string, input: NewEventInput) => Event;
  addComment: (profileId: string, input: NewCommentInput) => RequestComment;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function loadStoredData() {
  const stored = window.localStorage.getItem(STORAGE_KEYS.data);

  if (!stored) {
    return mockData;
  }

  try {
    return JSON.parse(stored) as AppDataset;
  } catch {
    return mockData;
  }
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppDataset>(loadStoredData);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.data, JSON.stringify(data));
  }, [data]);

  const createProfile: AppDataContextValue['createProfile'] = ({ role, name, email }) => {
    const profile: Profile = {
      id: createId('profile'),
      role,
      name,
      email,
      locationText: role === 'organization' ? 'Add your operating area' : 'Add your neighborhood',
      lat: 41.8781,
      lng: -87.6298,
      createdAt: new Date().toISOString(),
      onboardingComplete: false,
    };

    setData((current) => ({
      ...current,
      profiles: [profile, ...current.profiles],
    }));

    return profile;
  };

  const completeUserOnboarding: AppDataContextValue['completeUserOnboarding'] = (profileId, input) => {
    let updatedProfile: Profile | null = null;

    setData((current) => ({
      ...current,
      profiles: current.profiles.map((profile) => {
        if (profile.id !== profileId) {
          return profile;
        }

        updatedProfile = {
          ...profile,
          name: input.name,
          phone: input.phone,
          locationText: input.locationText,
          lat: input.lat,
          lng: input.lng,
          onboardingComplete: true,
        };

        return updatedProfile;
      }),
    }));

    return updatedProfile;
  };

  const completeOrganizationOnboarding: AppDataContextValue['completeOrganizationOnboarding'] = (
    profileId,
    input,
  ) => {
    let organizationRecord: Organization | null = null;

    setData((current) => {
      const existingOrganization = current.organizations.find((entry) => entry.profileId === profileId);

      organizationRecord = existingOrganization
        ? {
            ...existingOrganization,
            organizationName: input.organizationName,
            address: input.address,
            organizationType: input.organizationType,
            operatingHours: input.operatingHours,
            capacity: input.capacity,
            foodTypes: input.foodTypes,
            lat: input.lat,
            lng: input.lng,
          }
        : {
            id: createId('org'),
            profileId,
            organizationName: input.organizationName,
            address: input.address,
            organizationType: input.organizationType,
            operatingHours: input.operatingHours,
            capacity: input.capacity,
            foodTypes: input.foodTypes,
            verified: false,
            createdAt: new Date().toISOString(),
            lat: input.lat,
            lng: input.lng,
          };

      return {
        ...current,
        profiles: current.profiles.map((entry) =>
          entry.id === profileId
            ? {
                ...entry,
                name: input.organizationName,
                locationText: input.address,
                lat: input.lat,
                lng: input.lng,
                onboardingComplete: true,
              }
            : entry,
        ),
        organizations: existingOrganization
          ? current.organizations.map((entry) =>
              entry.profileId === profileId ? (organizationRecord as Organization) : entry,
            )
          : [organizationRecord as Organization, ...current.organizations],
      };
    });

    return organizationRecord;
  };

  const addDonation: AppDataContextValue['addDonation'] = (organizationId, input) => {
    const donation: Donation = {
      id: createId('donation'),
      organizationId,
      title: input.title,
      description: input.description,
      category: input.category,
      quantity: input.quantity,
      expiryDate: input.expiryDate,
      pickupAddress: input.pickupAddress,
      lat: input.lat,
      lng: input.lng,
      status: 'active',
      createdAt: new Date().toISOString(),
      availableFrom: input.availableFrom,
      availableUntil: input.availableUntil,
      storageType: input.storageType,
      notes: input.notes,
      imageUrl: input.imageUrl,
    };

    setData((current) => ({
      ...current,
      donations: [donation, ...current.donations],
    }));

    return donation;
  };

  const addRequest: AppDataContextValue['addRequest'] = (profileId, input) => {
    const request: FoodRequest = {
      id: createId('request'),
      profileId,
      title: input.title,
      description: input.description,
      comment: input.comment,
      peopleCount: input.peopleCount,
      urgency: input.urgency,
      foodType: input.foodType,
      locationText: input.locationText,
      lat: input.lat,
      lng: input.lng,
      status: 'active',
      createdAt: new Date().toISOString(),
      imageUrl: input.imageUrl,
    };

    setData((current) => ({
      ...current,
      requests: [request, ...current.requests],
    }));

    return request;
  };

  const addEvent: AppDataContextValue['addEvent'] = (organizationId, input) => {
    const event: Event = {
      id: createId('event'),
      organizationId,
      title: input.title,
      description: input.description,
      eventDate: input.eventDate,
      address: input.address,
      lat: input.lat,
      lng: input.lng,
      foodType: input.foodType,
      capacity: input.capacity,
      notes: input.notes,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };

    setData((current) => ({
      ...current,
      events: [event, ...current.events],
    }));

    return event;
  };

  const addComment: AppDataContextValue['addComment'] = (profileId, input) => {
    const comment: RequestComment = {
      id: createId('comment'),
      requestId: input.requestId,
      profileId,
      content: input.content,
      createdAt: new Date().toISOString(),
    };

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
        createProfile,
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

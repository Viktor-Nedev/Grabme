import type {
  Conversation,
  ConversationMember,
  Donation,
  Event,
  EventParticipant,
  FoodRequest,
  Message,
  Organization,
  Profile,
  RequestComment,
} from '@/types';
import { DEFAULT_COORDS } from '@/utils/constants';

export function mapProfile(row: any): Profile {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    locationText: row.location_text ?? '',
    lat: row.lat ?? DEFAULT_COORDS.lat,
    lng: row.lng ?? DEFAULT_COORDS.lng,
    createdAt: row.created_at,
    onboardingComplete: Boolean(row.onboarding_complete),
  };
}

export function mapOrganization(row: any): Organization {
  return {
    id: row.id,
    profileId: row.profile_id,
    organizationName: row.organization_name,
    address: row.address,
    organizationType: row.organization_type,
    operatingHours: row.operating_hours ?? '',
    capacity: row.capacity ?? 0,
    foodTypes: row.food_types ?? [],
    verified: Boolean(row.verified),
    showOnMap: row.show_on_map ?? true,
    createdAt: row.created_at,
    lat: row.lat ?? DEFAULT_COORDS.lat,
    lng: row.lng ?? DEFAULT_COORDS.lng,
  };
}

export function mapDonation(row: any): Donation {
  return {
    id: row.id,
    organizationId: row.organization_id ?? null,
    profileId: row.profile_id ?? null,
    title: row.title,
    description: row.description,
    category: row.category,
    quantity: row.quantity,
    expiryDate: row.expiry_date,
    pickupAddress: row.pickup_address,
    lat: row.lat ?? DEFAULT_COORDS.lat,
    lng: row.lng ?? DEFAULT_COORDS.lng,
    status: row.status,
    createdAt: row.created_at,
    availableFrom: row.available_from ?? row.created_at,
    availableUntil: row.available_until ?? row.created_at,
    storageType: row.storage_type ?? '',
    notes: row.notes ?? '',
    imageUrl: row.image_url ?? undefined,
  };
}

export function mapRequest(row: any): FoodRequest {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    description: row.description,
    comment: row.comment ?? '',
    peopleCount: row.people_count ?? 1,
    urgency: row.urgency,
    foodType: row.food_type,
    locationText: row.location_text ?? '',
    lat: row.lat ?? DEFAULT_COORDS.lat,
    lng: row.lng ?? DEFAULT_COORDS.lng,
    status: row.status,
    createdAt: row.created_at,
    imageUrl: row.image_url ?? undefined,
  };
}

export function mapEvent(row: any): Event {
  return {
    id: row.id,
    organizationId: row.organization_id,
    title: row.title,
    description: row.description,
    eventDate: row.event_date,
    address: row.address,
    lat: row.lat ?? DEFAULT_COORDS.lat,
    lng: row.lng ?? DEFAULT_COORDS.lng,
    foodType: row.food_type,
    capacity: row.capacity ?? 0,
    notes: row.notes ?? '',
    status: row.status,
    createdAt: row.created_at,
    imageUrl: row.image_url ?? undefined,
  };
}

export function mapComment(row: any): RequestComment {
  return {
    id: row.id,
    requestId: row.request_id,
    profileId: row.profile_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

export function mapConversation(row: any): Conversation {
  return {
    id: row.id,
    type: row.type,
    title: row.title ?? undefined,
    eventId: row.event_id ?? null,
    createdByProfileId: row.created_by_profile_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
}

export function mapConversationMember(row: any): ConversationMember {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    profileId: row.profile_id,
    role: row.role,
    joinedAt: row.joined_at ?? row.created_at,
  };
}

export function mapMessage(row: any): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    profileId: row.profile_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

export function mapEventParticipant(row: any): EventParticipant {
  return {
    id: row.id,
    eventId: row.event_id,
    profileId: row.profile_id,
    status: row.status ?? 'going',
    createdAt: row.created_at,
  };
}

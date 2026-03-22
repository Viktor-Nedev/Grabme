import { createContext, useContext, useEffect, useState } from 'react';
import type {
  AppDataset,
  AIInsightsData,
  Conversation,
  ConversationMember,
  Donation,
  Event,
  EventParticipant,
  FoodRequest,
  Message,
  NewCommentInput,
  NewDonationInput,
  NewEventInput,
  NewMessageInput,
  NewRequestInput,
  Organization,
  OrganizationOnboardingInput,
  Profile,
  RequestComment,
  UserOnboardingInput,
} from '@/types';
import { supabase } from '@/lib/supabase';
import {
  mapComment,
  mapConversation,
  mapConversationMember,
  mapDonation,
  mapEvent,
  mapEventParticipant,
  mapMessage,
  mapOrganization,
  mapProfile,
  mapRequest,
} from '@/utils/mappers';
import { isExpiringSoon, urgencyRank } from '@/utils/formatters';

interface AppDataContextValue extends AppDataset {
  loading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  completeUserOnboarding: (profileId: string, input: UserOnboardingInput) => Promise<Profile | null>;
  completeOrganizationOnboarding: (profileId: string, input: OrganizationOnboardingInput) => Promise<Organization | null>;
  addDonation: (
    owner: { organizationId?: string | null; profileId?: string | null },
    input: NewDonationInput & { imageFile?: File | null },
  ) => Promise<Donation>;
  updateDonation: (
    donationId: string,
    input: NewDonationInput & { imageFile?: File | null },
  ) => Promise<Donation>;
  addRequest: (profileId: string, input: NewRequestInput & { imageFile?: File | null }) => Promise<FoodRequest>;
  updateRequest: (
    requestId: string,
    input: NewRequestInput & { imageFile?: File | null },
  ) => Promise<FoodRequest>;
  deleteRequest: (requestId: string) => Promise<void>;
  addEvent: (
    owner: { organizationId: string; profileId: string },
    input: NewEventInput & { imageFile?: File | null },
  ) => Promise<Event>;
  addComment: (profileId: string, input: NewCommentInput) => Promise<RequestComment>;
  createOrGetDirectConversation: (profileId: string, targetProfileId: string) => Promise<Conversation>;
  createGroupConversation: (
    profileId: string,
    input: { title: string; memberIds: string[]; eventId?: string | null },
  ) => Promise<Conversation>;
  ensureEventGroupConversation: (input: {
    eventId: string;
    title: string;
    creatorProfileId: string;
  }) => Promise<Conversation>;
  joinConversation: (profileId: string, conversationId: string) => Promise<ConversationMember>;
  leaveConversation: (profileId: string, conversationId: string) => Promise<void>;
  addConversationMember: (conversationId: string, profileId: string) => Promise<ConversationMember>;
  removeConversationMember: (conversationId: string, profileId: string) => Promise<void>;
  renameConversation: (conversationId: string, title: string) => Promise<Conversation>;
  sendMessage: (profileId: string, input: NewMessageInput) => Promise<Message>;
  joinEvent: (profileId: string, eventId: string) => Promise<EventParticipant>;
  leaveEvent: (profileId: string, eventId: string) => Promise<void>;
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

function upsertById<T extends { id: string }>(items: T[], item: T) {
  const existing = items.find((entry) => entry.id === item.id);
  if (!existing) {
    return [item, ...items];
  }
  return items.map((entry) => (entry.id === item.id ? item : entry));
}

function isMissingRelationError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  return (
    error.code === 'PGRST204' ||
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    error.message?.toLowerCase().includes('relation') ||
    error.message?.toLowerCase().includes('schema cache')
  );
}

function isDuplicateKeyError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  return (
    error.code === '23505' ||
    error.code === '409' ||
    error.message?.toLowerCase().includes('duplicate key')
  );
}

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
    conversations: [],
    conversationMembers: [],
    messages: [],
    eventParticipants: [],
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

    const [
      profilesRes,
      organizationsRes,
      donationsRes,
      requestsRes,
      eventsRes,
      commentsRes,
      conversationsRes,
      conversationMembersRes,
      messagesRes,
      eventParticipantsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('organizations').select('*').order('created_at', { ascending: false }),
      supabase.from('donations').select('*').order('created_at', { ascending: false }),
      supabase.from('requests').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*').order('created_at', { ascending: false }),
      supabase.from('comments').select('*').order('created_at', { ascending: false }),
      supabase.from('conversations').select('*').order('updated_at', { ascending: false }),
      supabase.from('conversation_members').select('*').order('joined_at', { ascending: true }),
      supabase.from('messages').select('*').order('created_at', { ascending: true }),
      supabase.from('event_participants').select('*').order('created_at', { ascending: true }),
    ]);

    const chatErrors = [
      conversationsRes.error,
      conversationMembersRes.error,
      messagesRes.error,
      eventParticipantsRes.error,
    ].filter((error) => error && !isMissingRelationError(error));

    const firstError =
      profilesRes.error ||
      organizationsRes.error ||
      donationsRes.error ||
      requestsRes.error ||
      eventsRes.error ||
      commentsRes.error ||
      chatErrors[0] ||
      null;

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
    const conversations = isMissingRelationError(conversationsRes.error)
      ? []
      : (conversationsRes.data ?? []).map(mapConversation);
    const conversationMembers = isMissingRelationError(conversationMembersRes.error)
      ? []
      : (conversationMembersRes.data ?? []).map(mapConversationMember);
    const messages = isMissingRelationError(messagesRes.error)
      ? []
      : (messagesRes.data ?? []).map(mapMessage);
    const eventParticipants = isMissingRelationError(eventParticipantsRes.error)
      ? []
      : (eventParticipantsRes.data ?? []).map(mapEventParticipant);

    setData({
      profiles,
      organizations,
      donations,
      requests,
      events,
      comments,
      conversations,
      conversationMembers,
      messages,
      eventParticipants,
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

  const addDonation: AppDataContextValue['addDonation'] = async (owner, input) => {
    if (!supabase) throw new Error('Supabase not configured');
    const imageUrl = input.imageFile ? await uploadImage(input.imageFile, 'donations') : null;

    const { data: row, error: insertError } = await supabase
      .from('donations')
      .insert({
        organization_id: owner.organizationId ?? null,
        profile_id: owner.profileId ?? null,
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

  const updateDonation: AppDataContextValue['updateDonation'] = async (donationId, input) => {
    if (!supabase) throw new Error('Supabase not configured');
    const imageUrl = input.imageFile ? await uploadImage(input.imageFile, 'donations') : input.imageUrl ?? null;

    const { data: row, error: updateError } = await supabase
      .from('donations')
      .update({
        title: input.title,
        description: input.description,
        category: input.category,
        quantity: input.quantity,
        expiry_date: input.expiryDate,
        pickup_address: input.pickupAddress,
        lat: input.lat,
        lng: input.lng,
        available_from: input.availableFrom,
        available_until: input.availableUntil,
        storage_type: input.storageType,
        notes: input.notes,
        image_url: imageUrl,
      })
      .eq('id', donationId)
      .select('*')
      .single();

    if (updateError || !row) {
      throw updateError ?? new Error('Failed to update donation');
    }

    const donation = mapDonation(row);
    setData((current) => ({
      ...current,
      donations: current.donations.map((entry) => (entry.id === donationId ? donation : entry)),
      aiInsights: buildInsights(
        current.donations.map((entry) => (entry.id === donationId ? donation : entry)),
        current.requests,
      ),
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

  const updateRequest: AppDataContextValue['updateRequest'] = async (requestId, input) => {
    if (!supabase) throw new Error('Supabase not configured');
    const imageUrl = input.imageFile ? await uploadImage(input.imageFile, 'requests') : input.imageUrl ?? null;

    const { data: row, error: updateError } = await supabase
      .from('requests')
      .update({
        title: input.title,
        description: input.description,
        comment: input.comment,
        people_count: input.peopleCount,
        urgency: input.urgency,
        food_type: input.foodType,
        location_text: input.locationText,
        lat: input.lat,
        lng: input.lng,
        image_url: imageUrl,
      })
      .eq('id', requestId)
      .select('*')
      .single();

    if (updateError || !row) {
      throw updateError ?? new Error('Failed to update request');
    }

    const request = mapRequest(row);
    setData((current) => ({
      ...current,
      requests: current.requests.map((entry) => (entry.id === requestId ? request : entry)),
      aiInsights: buildInsights(current.donations, current.requests.map((entry) => (entry.id === requestId ? request : entry))),
    }));
    return request;
  };

  const deleteRequest: AppDataContextValue['deleteRequest'] = async (requestId) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error: deleteError } = await supabase.from('requests').delete().eq('id', requestId);
    if (deleteError) {
      throw deleteError;
    }
    setData((current) => {
      const remainingRequests = current.requests.filter((entry) => entry.id !== requestId);
      return {
        ...current,
        requests: remainingRequests,
        comments: current.comments.filter((entry) => entry.requestId !== requestId),
        aiInsights: buildInsights(current.donations, remainingRequests),
      };
    });
  };

  const addEvent: AppDataContextValue['addEvent'] = async (owner, input) => {
    if (!supabase) throw new Error('Supabase not configured');
    const imageUrl = input.imageFile ? await uploadImage(input.imageFile, 'events') : null;

    const { data: row, error: insertError } = await supabase
      .from('events')
      .insert({
        organization_id: owner.organizationId,
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
    let createdConversation: Conversation | null = null;
    let createdConversationMember: ConversationMember | null = null;
    let createdParticipant: EventParticipant | null = null;

    if (input.createGroupChat !== false) {
      const { data: groupRow, error: groupError } = await supabase
        .from('conversations')
        .insert({
          type: 'group',
          title: `${input.title} Group`,
          event_id: event.id,
          created_by_profile_id: owner.profileId,
        })
        .select('*')
        .single();

      if (groupError && isDuplicateKeyError(groupError)) {
        const { data: existingGroup } = await supabase
          .from('conversations')
          .select('*')
          .eq('event_id', event.id)
          .eq('type', 'group')
          .limit(1);
        if (existingGroup?.[0]) {
          createdConversation = mapConversation(existingGroup[0]);
        }
      } else if (!groupError && groupRow) {
        createdConversation = mapConversation(groupRow);
      }

      if (createdConversation) {
        const { data: memberRow, error: memberError } = await supabase
          .from('conversation_members')
          .insert({
            conversation_id: createdConversation.id,
            profile_id: owner.profileId,
            role: 'admin',
          })
          .select('*')
          .single();

        if (memberError && isDuplicateKeyError(memberError)) {
          const { data: existingMember } = await supabase
            .from('conversation_members')
            .select('*')
            .eq('conversation_id', createdConversation.id)
            .eq('profile_id', owner.profileId)
            .limit(1);
          if (existingMember?.[0]) {
            createdConversationMember = mapConversationMember(existingMember[0]);
          }
        } else if (!memberError && memberRow) {
          createdConversationMember = mapConversationMember(memberRow);
        }
      }
    }

    const { data: participantRow, error: participantError } = await supabase
      .from('event_participants')
      .insert({
        event_id: event.id,
        profile_id: owner.profileId,
        status: 'going',
      })
      .select('*')
      .single();

    if (participantError && isDuplicateKeyError(participantError)) {
      const { data: existingParticipant } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', event.id)
        .eq('profile_id', owner.profileId)
        .limit(1);
      if (existingParticipant?.[0]) {
        createdParticipant = mapEventParticipant(existingParticipant[0]);
      }
    } else if (!participantError && participantRow) {
      createdParticipant = mapEventParticipant(participantRow);
    }

    setData((current) => {
      const nextConversations = createdConversation ? [createdConversation, ...current.conversations] : current.conversations;
      const nextMembers = createdConversationMember
        ? [createdConversationMember, ...current.conversationMembers]
        : current.conversationMembers;
      const nextParticipants = createdParticipant
        ? upsertById(current.eventParticipants, createdParticipant)
        : current.eventParticipants;
      return {
        ...current,
        events: [event, ...current.events],
        conversations: nextConversations,
        conversationMembers: nextMembers,
        eventParticipants: nextParticipants,
      };
    });
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

  const createGroupConversation: AppDataContextValue['createGroupConversation'] = async (profileId, input) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data: row, error: insertError } = await supabase
      .from('conversations')
      .insert({
        type: 'group',
        title: input.title,
        event_id: input.eventId ?? null,
        created_by_profile_id: profileId,
      })
      .select('*')
      .single();

    if (insertError || !row) {
      throw insertError ?? new Error('Failed to create group conversation');
    }

    const conversation = mapConversation(row);
    const uniqueMemberIds = Array.from(new Set([profileId, ...input.memberIds]));
    const memberRows = uniqueMemberIds.map((memberId) => ({
      conversation_id: conversation.id,
      profile_id: memberId,
      role: memberId === profileId ? 'admin' : 'member',
    }));

    const mappedMembers: ConversationMember[] = [];
    for (const memberRow of memberRows) {
      const { data: insertedMember, error: insertError } = await supabase
        .from('conversation_members')
        .insert(memberRow)
        .select('*')
        .single();

      if (insertError && isDuplicateKeyError(insertError)) {
        const { data: existingMember } = await supabase
          .from('conversation_members')
          .select('*')
          .eq('conversation_id', memberRow.conversation_id)
          .eq('profile_id', memberRow.profile_id)
          .limit(1);
        if (existingMember?.[0]) {
          mappedMembers.push(mapConversationMember(existingMember[0]));
        }
        continue;
      }

      if (insertError || !insertedMember) {
        throw insertError ?? new Error('Failed to add group members');
      }

      mappedMembers.push(mapConversationMember(insertedMember));
    }
    setData((current) => {
      const nextConversationMembers = mappedMembers.reduce(
        (accumulator, member) => upsertById(accumulator, member),
        current.conversationMembers,
      );
      return {
        ...current,
        conversations: upsertById(current.conversations, conversation),
        conversationMembers: nextConversationMembers,
      };
    });

    return conversation;
  };

  const ensureEventGroupConversation: AppDataContextValue['ensureEventGroupConversation'] = async (input) => {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: existingList } = await supabase
      .from('conversations')
      .select('*')
      .eq('event_id', input.eventId)
      .eq('type', 'group')
      .limit(1);

    const conversation =
      existingList?.[0]
        ? mapConversation(existingList[0])
        : await createGroupConversation(input.creatorProfileId, {
            title: input.title,
            memberIds: [],
            eventId: input.eventId,
          });

    const { data: adminRow, error: adminError } = await supabase
      .from('conversation_members')
      .insert({
        conversation_id: conversation.id,
        profile_id: input.creatorProfileId,
        role: 'admin',
      })
      .select('*')
      .single();

    if (adminError && isDuplicateKeyError(adminError)) {
      const { data: existingMember } = await supabase
        .from('conversation_members')
        .select('*')
        .eq('conversation_id', conversation.id)
        .eq('profile_id', input.creatorProfileId)
        .limit(1);
      if (!existingMember?.[0]) {
        throw adminError;
      }
      const adminMember = mapConversationMember(existingMember[0]);
      setData((current) => ({
        ...current,
        conversations: upsertById(current.conversations, conversation),
        conversationMembers: upsertById(current.conversationMembers, adminMember),
      }));
      return conversation;
    }

    if (adminError || !adminRow) {
      throw adminError ?? new Error('Failed to set conversation admin');
    }

    const adminMember = mapConversationMember(adminRow);
    setData((current) => ({
      ...current,
      conversations: upsertById(current.conversations, conversation),
      conversationMembers: upsertById(current.conversationMembers, adminMember),
    }));

    return conversation;
  };

  const createOrGetDirectConversation: AppDataContextValue['createOrGetDirectConversation'] = async (
    profileId,
    targetProfileId,
  ) => {
    if (!supabase) throw new Error('Supabase not configured');
    if (profileId === targetProfileId) {
      throw new Error('Cannot create a direct conversation with yourself');
    }

    const { data: myMemberships, error: membershipsError } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('profile_id', profileId);

    if (membershipsError) {
      throw membershipsError;
    }

    const conversationIds = (myMemberships ?? []).map((entry) => entry.conversation_id);
    if (conversationIds.length) {
      const { data: directConversations, error: directError } = await supabase
        .from('conversations')
        .select('*')
        .eq('type', 'direct')
        .in('id', conversationIds);

      if (directError) {
        throw directError;
      }

      const directIds = (directConversations ?? []).map((entry) => entry.id);
      if (directIds.length) {
        const { data: directMembers, error: directMembersError } = await supabase
          .from('conversation_members')
          .select('*')
          .in('conversation_id', directIds);

        if (directMembersError) {
          throw directMembersError;
        }

        const membersByConversation = new Map<string, ConversationMember[]>();
        (directMembers ?? []).forEach((row) => {
          const member = mapConversationMember(row);
          membersByConversation.set(member.conversationId, [
            ...(membersByConversation.get(member.conversationId) ?? []),
            member,
          ]);
        });

        const existingConversation = (directConversations ?? []).find((conversationRow) => {
          const members = membersByConversation.get(conversationRow.id) ?? [];
          if (members.length !== 2) {
            return false;
          }
          const memberIds = members.map((member) => member.profileId);
          return memberIds.includes(profileId) && memberIds.includes(targetProfileId);
        });

        if (existingConversation) {
          const mappedConversation = mapConversation(existingConversation);
          setData((current) => ({
            ...current,
            conversations: upsertById(current.conversations, mappedConversation),
            conversationMembers: (membersByConversation.get(existingConversation.id) ?? []).reduce(
              (accumulator, member) => upsertById(accumulator, member),
              current.conversationMembers,
            ),
          }));
          return mappedConversation;
        }
      }
    }

    const { data: conversationRow, error: createError } = await supabase
      .from('conversations')
      .insert({
        type: 'direct',
        created_by_profile_id: profileId,
      })
      .select('*')
      .single();

    if (createError || !conversationRow) {
      throw createError ?? new Error('Failed to create direct conversation');
    }

    const conversation = mapConversation(conversationRow);
    const memberPayloads = [
      {
        conversation_id: conversation.id,
        profile_id: profileId,
        role: 'admin',
      },
      {
        conversation_id: conversation.id,
        profile_id: targetProfileId,
        role: 'member',
      },
    ];

    const mappedMembers: ConversationMember[] = [];
    for (const payload of memberPayloads) {
      const { data: insertedMember, error: insertError } = await supabase
        .from('conversation_members')
        .insert(payload)
        .select('*')
        .single();

      if (insertError && isDuplicateKeyError(insertError)) {
        const { data: existingMember } = await supabase
          .from('conversation_members')
          .select('*')
          .eq('conversation_id', payload.conversation_id)
          .eq('profile_id', payload.profile_id)
          .limit(1);
        if (existingMember?.[0]) {
          mappedMembers.push(mapConversationMember(existingMember[0]));
        }
        continue;
      }

      if (insertError || !insertedMember) {
        throw insertError ?? new Error('Failed to create direct conversation members');
      }

      mappedMembers.push(mapConversationMember(insertedMember));
    }
    setData((current) => ({
      ...current,
      conversations: upsertById(current.conversations, conversation),
      conversationMembers: mappedMembers.reduce(
        (accumulator, member) => upsertById(accumulator, member),
        current.conversationMembers,
      ),
    }));

    return conversation;
  };

  const joinConversation: AppDataContextValue['joinConversation'] = async (profileId, conversationId) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data: existingMember } = await supabase
      .from('conversation_members')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('profile_id', profileId)
      .maybeSingle();

    if (existingMember && !Array.isArray(existingMember)) {
      const mappedExisting = mapConversationMember(existingMember);
      setData((current) => ({
        ...current,
        conversationMembers: upsertById(current.conversationMembers, mappedExisting),
      }));
      return mappedExisting;
    }

    const { data: row, error: insertError } = await supabase
      .from('conversation_members')
      .insert(
        {
          conversation_id: conversationId,
          profile_id: profileId,
          role: 'member',
        },
      )
      .select('*')
      .single();

    if (insertError || !row) {
      throw insertError ?? new Error('Failed to join conversation');
    }

    const member = mapConversationMember(row);
    setData((current) => ({
      ...current,
      conversationMembers: upsertById(current.conversationMembers, member),
    }));
    return member;
  };

  const leaveConversation: AppDataContextValue['leaveConversation'] = async (profileId, conversationId) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error: deleteError } = await supabase
      .from('conversation_members')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('profile_id', profileId);

    if (deleteError) {
      throw deleteError;
    }

    setData((current) => ({
      ...current,
      conversationMembers: current.conversationMembers.filter(
        (entry) => !(entry.conversationId === conversationId && entry.profileId === profileId),
      ),
    }));
  };

  const addConversationMember: AppDataContextValue['addConversationMember'] = async (
    conversationId,
    profileId,
  ) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data: row, error: insertError } = await supabase
      .from('conversation_members')
      .insert({
        conversation_id: conversationId,
        profile_id: profileId,
        role: 'member',
      })
      .select('*')
      .single();

    if (insertError && isDuplicateKeyError(insertError)) {
      const { data: existingMember } = await supabase
        .from('conversation_members')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('profile_id', profileId)
        .limit(1);
      if (!existingMember?.[0]) {
        throw insertError;
      }
      const member = mapConversationMember(existingMember[0]);
      setData((current) => ({
        ...current,
        conversationMembers: upsertById(current.conversationMembers, member),
      }));
      return member;
    }

    if (insertError || !row) {
      throw insertError ?? new Error('Failed to add conversation member');
    }

    const member = mapConversationMember(row);
    setData((current) => ({
      ...current,
      conversationMembers: upsertById(current.conversationMembers, member),
    }));
    return member;
  };

  const removeConversationMember: AppDataContextValue['removeConversationMember'] = async (
    conversationId,
    profileId,
  ) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error: deleteError } = await supabase
      .from('conversation_members')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('profile_id', profileId);

    if (deleteError) {
      throw deleteError;
    }

    setData((current) => ({
      ...current,
      conversationMembers: current.conversationMembers.filter(
        (entry) => !(entry.conversationId === conversationId && entry.profileId === profileId),
      ),
    }));
  };

  const renameConversation: AppDataContextValue['renameConversation'] = async (conversationId, title) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data: row, error: updateError } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId)
      .select('*')
      .single();

    if (updateError || !row) {
      throw updateError ?? new Error('Failed to rename conversation');
    }

    const conversation = mapConversation(row);
    setData((current) => ({
      ...current,
      conversations: upsertById(current.conversations, conversation),
    }));
    return conversation;
  };

  const sendMessage: AppDataContextValue['sendMessage'] = async (profileId, input) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data: row, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: input.conversationId,
        profile_id: profileId,
        content: input.content,
      })
      .select('*')
      .single();

    if (insertError || !row) {
      throw insertError ?? new Error('Failed to send message');
    }

    const message = mapMessage(row);
    setData((current) => ({
      ...current,
      messages: [...current.messages, message],
      conversations: current.conversations.map((conversation) =>
        conversation.id === input.conversationId
          ? { ...conversation, updatedAt: message.createdAt }
          : conversation,
      ),
    }));
    return message;
  };

  const joinEvent: AppDataContextValue['joinEvent'] = async (profileId, eventId) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data: row, error: insertError } = await supabase
      .from('event_participants')
      .insert({
        event_id: eventId,
        profile_id: profileId,
        status: 'going',
      })
      .select('*')
      .single();

    if (insertError && isDuplicateKeyError(insertError)) {
      const { data: existingParticipant } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('profile_id', profileId)
        .limit(1);
      if (!existingParticipant?.[0]) {
        throw insertError;
      }
      const participant = mapEventParticipant(existingParticipant[0]);
      setData((current) => ({
        ...current,
        eventParticipants: upsertById(current.eventParticipants, participant),
      }));
      return participant;
    }

    if (insertError || !row) {
      throw insertError ?? new Error('Failed to join event');
    }

    const participant = mapEventParticipant(row);
    setData((current) => ({
      ...current,
      eventParticipants: upsertById(current.eventParticipants, participant),
    }));
    return participant;
  };

  const leaveEvent: AppDataContextValue['leaveEvent'] = async (profileId, eventId) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error: deleteError } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('profile_id', profileId);

    if (deleteError) {
      throw deleteError;
    }

    setData((current) => ({
      ...current,
      eventParticipants: current.eventParticipants.filter(
        (entry) => !(entry.eventId === eventId && entry.profileId === profileId),
      ),
    }));
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
        updateDonation,
        addRequest,
        updateRequest,
        deleteRequest,
        addEvent,
        addComment,
        createOrGetDirectConversation,
        createGroupConversation,
        ensureEventGroupConversation,
        joinConversation,
        leaveConversation,
        addConversationMember,
        removeConversationMember,
        renameConversation,
        sendMessage,
        joinEvent,
        leaveEvent,
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

export type UserRole = 'user' | 'organization';
export type MarkerType = 'donation' | 'request' | 'organization' | 'event' | 'user-location';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type DonationStatus = 'active' | 'claimed' | 'expired';
export type RequestStatus = 'active' | 'fulfilled' | 'closed';
export type EventStatus = 'scheduled' | 'full' | 'completed';
export type ConversationType = 'direct' | 'group';
export type ConversationMemberRole = 'admin' | 'member';
export type EventParticipantStatus = 'going';
export type FoodCategory =
  | 'Meal Packs'
  | 'Fresh Produce'
  | 'Bakery'
  | 'Dairy'
  | 'Pantry Staples'
  | 'Infant Nutrition'
  | 'Prepared Meals'
  | 'Community Fridge';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Profile extends Coordinates {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  locationText: string;
  createdAt: string;
  onboardingComplete: boolean;
}

export interface Organization extends Coordinates {
  id: string;
  profileId: string;
  organizationName: string;
  address: string;
  organizationType: string;
  operatingHours: string;
  capacity: number;
  foodTypes: FoodCategory[];
  verified: boolean;
  createdAt: string;
}

export interface Donation extends Coordinates {
  id: string;
  organizationId?: string | null;
  profileId?: string | null;
  title: string;
  description: string;
  category: FoodCategory;
  quantity: string;
  expiryDate: string;
  pickupAddress: string;
  status: DonationStatus;
  createdAt: string;
  availableFrom: string;
  availableUntil: string;
  storageType: string;
  notes: string;
  imageUrl?: string;
}

export interface FoodRequest extends Coordinates {
  id: string;
  profileId: string;
  title: string;
  description: string;
  comment: string;
  peopleCount: number;
  urgency: UrgencyLevel;
  foodType: FoodCategory;
  locationText: string;
  status: RequestStatus;
  createdAt: string;
  imageUrl?: string;
}

export interface Event extends Coordinates {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  eventDate: string;
  address: string;
  foodType: FoodCategory;
  capacity: number;
  notes: string;
  status: EventStatus;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  eventId?: string | null;
  createdByProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMember {
  id: string;
  conversationId: string;
  profileId: string;
  role: ConversationMemberRole;
  joinedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  profileId: string;
  content: string;
  createdAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  profileId: string;
  status: EventParticipantStatus;
  createdAt: string;
}

export interface RequestComment {
  id: string;
  requestId: string;
  profileId: string;
  content: string;
  createdAt: string;
}

export interface ImpactStat {
  label: string;
  value: string;
  change: string;
  tone?: 'default' | 'success' | 'warning' | 'critical';
}

export interface ForecastPoint {
  label: string;
  demand: number;
  supply: number;
}

export interface CategoryForecast {
  category: FoodCategory;
  neededUnits: number;
  coverage: number;
}

export interface HotspotZone {
  id: string;
  area: string;
  riskScore: number;
  requestCount: number;
  donationCoverage: number;
  recommendation: string;
}

export interface ExpiryInsight {
  donationId: string;
  title: string;
  hoursLeft: number;
  locationText: string;
}

export interface PriorityAlert {
  id: string;
  title: string;
  detail: string;
  level: 'info' | 'warning' | 'critical';
  actionLabel: string;
  route: string;
}

export interface AIInsightsData {
  forecast: ForecastPoint[];
  categoryForecasts: CategoryForecast[];
  hotspots: HotspotZone[];
  expiryQueue: ExpiryInsight[];
  alerts: PriorityAlert[];
  smartRecommendations: string[];
  urgencyBreakdown: Array<{ name: string; value: number }>;
}

export interface MapMarker extends Coordinates {
  id: string;
  entityId: string;
  type: MarkerType;
  title: string;
  description: string;
  locationText: string;
  color: 'red' | 'yellow' | 'green' | 'blue' | 'purple';
  detailRoute: string;
  navigationLabel: string;
  meta: string;
}

export interface AppDataset {
  profiles: Profile[];
  organizations: Organization[];
  donations: Donation[];
  requests: FoodRequest[];
  events: Event[];
  comments: RequestComment[];
  conversations: Conversation[];
  conversationMembers: ConversationMember[];
  messages: Message[];
  eventParticipants: EventParticipant[];
  aiInsights: AIInsightsData;
}

export interface AuthSession {
  profileId: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  role: UserRole;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

export interface UserOnboardingInput extends Coordinates {
  name: string;
  phone?: string;
  locationText: string;
}

export interface OrganizationOnboardingInput extends Coordinates {
  organizationName: string;
  address: string;
  organizationType: string;
  operatingHours: string;
  capacity: number;
  foodTypes: FoodCategory[];
}

export interface NewDonationInput extends Coordinates {
  profileId?: string | null;
  title: string;
  description: string;
  category: FoodCategory;
  quantity: string;
  expiryDate: string;
  pickupAddress: string;
  availableFrom: string;
  availableUntil: string;
  storageType: string;
  notes: string;
  imageUrl?: string;
}

export interface NewRequestInput extends Coordinates {
  title: string;
  description: string;
  comment: string;
  peopleCount: number;
  urgency: UrgencyLevel;
  foodType: FoodCategory;
  locationText: string;
  imageUrl?: string;
}

export interface NewEventInput extends Coordinates {
  title: string;
  description: string;
  eventDate: string;
  address: string;
  foodType: FoodCategory;
  capacity: number;
  notes: string;
  createGroupChat?: boolean;
}

export interface NewCommentInput {
  requestId: string;
  content: string;
}

export interface NewMessageInput {
  conversationId: string;
  content: string;
}

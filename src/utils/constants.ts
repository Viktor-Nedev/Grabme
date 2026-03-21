import type { FoodCategory, UserRole } from '@/types';

export const STORAGE_KEYS = {
  auth: 'grabme.auth',
  data: 'grabme.data',
} as const;

export const ROUTES = {
  home: '/',
  auth: '/auth',
  onboarding: '/onboarding',
  userDashboard: '/dashboard/user',
  orgDashboard: '/dashboard/org',
  donationFeed: '/donations/feed',
  donationNew: '/donations/new',
  requests: '/requests',
  requestNew: '/requests/new',
  map: '/map',
  events: '/events',
  eventNew: '/events/new',
  aiInsights: '/ai/insights',
  aiAlerts: '/ai/alerts',
  profile: '/profile',
  settings: '/settings',
} as const;

export const FOOD_CATEGORIES: FoodCategory[] = [
  'Meal Packs',
  'Fresh Produce',
  'Bakery',
  'Dairy',
  'Pantry Staples',
  'Infant Nutrition',
  'Prepared Meals',
  'Community Fridge',
];

export const USER_ROLES: Array<{ value: UserRole; label: string; description: string }> = [
  {
    value: 'user',
    label: 'Regular User',
    description: 'Find nearby food, view the map, and create food requests.',
  },
  {
    value: 'organization',
    label: 'Organization',
    description: 'Coordinate donations, respond to urgent needs, and run events.',
  },
];

export const DEFAULT_MAP_BOUNDS = {
  minLat: 41.74,
  maxLat: 41.99,
  minLng: -87.78,
  maxLng: -87.54,
};

export const QUICK_STATS = [
  { label: 'Meals redirected this week', value: '4,820+' },
  { label: 'Requests fulfilled this month', value: '1,460+' },
  { label: 'Active community partners', value: '74' },
];

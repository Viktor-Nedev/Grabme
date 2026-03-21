import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';
import type { Donation, FoodRequest, UrgencyLevel } from '@/types';

export function formatDate(value: string, pattern = 'MMM d, yyyy') {
  return format(parseISO(value), pattern);
}

export function formatDateTime(value: string) {
  return format(parseISO(value), 'MMM d, yyyy • h:mm a');
}

export function timeFromNow(value: string) {
  return formatDistanceToNow(parseISO(value), { addSuffix: true });
}

export function isExpiringSoon(value: string, hours = 24) {
  const date = parseISO(value);
  const now = new Date();
  return isAfter(date, now) && isBefore(date, new Date(now.getTime() + hours * 60 * 60 * 1000));
}

export function urgencyTone(level: UrgencyLevel) {
  switch (level) {
    case 'critical':
      return 'bg-red-600 text-white';
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-emerald-100 text-emerald-700';
  }
}

export function urgencyRank(level: UrgencyLevel) {
  switch (level) {
    case 'critical':
      return 4;
    case 'high':
      return 3;
    case 'medium':
      return 2;
    default:
      return 1;
  }
}

export function getDonationMeta(donation: Donation) {
  return `${donation.quantity} • Expires ${formatDateTime(donation.expiryDate)}`;
}

export function getRequestMeta(request: FoodRequest) {
  return `${request.peopleCount} people • ${request.urgency} urgency`;
}

export function formatDistanceKm(originLat: number, originLng: number, targetLat: number, targetLng: number) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(targetLat - originLat);
  const dLng = toRadians(targetLng - originLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(originLat)) *
      Math.cos(toRadians(targetLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return `${(earthRadiusKm * c).toFixed(1)} km`;
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField, inputClassName } from '@/components/forms/FormField';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import type { FoodCategory } from '@/types';
import { FOOD_CATEGORIES, ROUTES } from '@/utils/constants';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { currentProfile, currentOrganization, refreshSession } = useAuth();
  const { completeOrganizationOnboarding, completeUserOnboarding } = useAppData();
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<FoodCategory[]>(currentOrganization?.foodTypes ?? []);
  const [submitting, setSubmitting] = useState(false);

  if (!currentProfile) {
    return null;
  }

  const handleUserSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setSubmitting(true);
    await completeUserOnboarding(currentProfile.id, {
      name: String(form.get('name')),
      phone: String(form.get('phone') ?? ''),
      locationText: String(form.get('locationText')),
      lat: Number(form.get('lat')),
      lng: Number(form.get('lng')),
    });
    await refreshSession();
    setSubmitting(false);
    navigate(ROUTES.userDashboard);
  };

  const handleOrganizationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setSubmitting(true);
    await completeOrganizationOnboarding(currentProfile.id, {
      organizationName: String(form.get('organizationName')),
      address: String(form.get('address')),
      organizationType: String(form.get('organizationType')),
      operatingHours: String(form.get('operatingHours')),
      capacity: Number(form.get('capacity')),
      foodTypes: selectedFoodTypes,
      lat: Number(form.get('lat')),
      lng: Number(form.get('lng')),
    });
    await refreshSession();
    setSubmitting(false);
    navigate(ROUTES.orgDashboard);
  };

  return (
    <section className="section-shell py-10">
      <div className="mx-auto max-w-4xl surface-card p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-red">Onboarding</p>
        <h1 className="mt-3 font-display text-4xl">
          {currentProfile.role === 'organization' ? 'Set up your organization workspace' : 'Complete your community profile'}
        </h1>
        <p className="mt-3 text-sm text-brand-gray">
          This information powers nearby matches, map markers, and role-based recommendations.
        </p>

        {currentProfile.role === 'user' ? (
          <form onSubmit={handleUserSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
            <FormField label="Name">
              <input name="name" defaultValue={currentProfile.name} className={inputClassName} required />
            </FormField>
            <FormField label="Phone (optional)">
              <input name="phone" defaultValue={currentProfile.phone ?? ''} className={inputClassName} />
            </FormField>
            <FormField label="Approximate location" className="md:col-span-2">
              <input name="locationText" defaultValue={currentProfile.locationText} className={inputClassName} required />
            </FormField>
            <FormField label="Latitude">
              <input name="lat" type="number" step="0.0001" defaultValue={currentProfile.lat} className={inputClassName} required />
            </FormField>
            <FormField label="Longitude">
              <input name="lng" type="number" step="0.0001" defaultValue={currentProfile.lng} className={inputClassName} required />
            </FormField>
            <button type="submit" className="btn-primary md:col-span-2" disabled={submitting}>
              Save Profile
            </button>
          </form>
        ) : (
          <form onSubmit={handleOrganizationSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
            <FormField label="Organization name">
              <input
                name="organizationName"
                defaultValue={currentOrganization?.organizationName ?? currentProfile.name}
                className={inputClassName}
                required
              />
            </FormField>
            <FormField label="Address">
              <input name="address" defaultValue={currentOrganization?.address ?? currentProfile.locationText} className={inputClassName} required />
            </FormField>
            <FormField label="Organization type">
              <input
                name="organizationType"
                defaultValue={currentOrganization?.organizationType ?? 'Food rescue NGO'}
                className={inputClassName}
                required
              />
            </FormField>
            <FormField label="Operating hours">
              <input
                name="operatingHours"
                defaultValue={currentOrganization?.operatingHours ?? 'Mon-Sat, 8:00 AM - 6:00 PM'}
                className={inputClassName}
                required
              />
            </FormField>
            <FormField label="Capacity">
              <input
                name="capacity"
                type="number"
                defaultValue={currentOrganization?.capacity ?? 120}
                className={inputClassName}
                required
              />
            </FormField>
            <FormField label="Latitude">
              <input name="lat" type="number" step="0.0001" defaultValue={currentProfile.lat} className={inputClassName} required />
            </FormField>
            <FormField label="Longitude">
              <input name="lng" type="number" step="0.0001" defaultValue={currentProfile.lng} className={inputClassName} required />
            </FormField>
            <div className="md:col-span-2">
              <p className="text-sm font-semibold">Food types handled</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {FOOD_CATEGORIES.map((category) => {
                  const selected = selectedFoodTypes.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setSelectedFoodTypes((current) =>
                          current.includes(category)
                            ? current.filter((entry) => entry !== category)
                            : [...current, category],
                        )
                      }
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        selected ? 'bg-brand-red text-white' : 'bg-brand-cream text-brand-gray'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
            <button type="submit" className="btn-primary md:col-span-2" disabled={submitting}>
              Save Organization Profile
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

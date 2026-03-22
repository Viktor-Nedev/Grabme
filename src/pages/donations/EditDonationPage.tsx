import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField, inputClassName } from '@/components/forms/FormField';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { FOOD_CATEGORIES } from '@/utils/constants';

export function EditDonationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { donations, updateDonation } = useAppData();
  const { currentProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const donation = donations.find((entry) => entry.id === id);
  if (!donation || !currentProfile) {
    return null;
  }

  const isOwner =
    (donation.profileId && donation.profileId === currentProfile.id) ||
    (!donation.profileId && currentProfile.role === 'organization');

  if (!isOwner) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    await updateDonation(donation.id, {
      title: String(form.get('title')),
      description: String(form.get('description')),
      category: form.get('category') as (typeof FOOD_CATEGORIES)[number],
      quantity: String(form.get('quantity')),
      expiryDate: new Date(`${String(form.get('expiryDate'))}T${String(form.get('expiryTime'))}:00`).toISOString(),
      pickupAddress: String(form.get('pickupAddress')),
      lat: Number(form.get('lat')),
      lng: Number(form.get('lng')),
      availableFrom: new Date(`${String(form.get('availableFrom'))}T${String(form.get('availableFromTime'))}:00`).toISOString(),
      availableUntil: new Date(`${String(form.get('availableUntil'))}T${String(form.get('availableUntilTime'))}:00`).toISOString(),
      storageType: String(form.get('storageType')),
      notes: String(form.get('notes')),
      imageUrl: donation.imageUrl,
      imageFile: form.get('image') instanceof File ? (form.get('image') as File) : null,
    });
    setSubmitting(false);
    navigate(`/donations/${donation.id}`);
  };

  return (
    <section className="section-shell py-10">
      <div className="mx-auto max-w-5xl surface-card p-8">
        <SectionHeading
          eyebrow="Edit Donation"
          title="Update your donation details"
          description="Changes are reflected in the feed and on the map."
        />
        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
          <FormField label="Title">
            <input name="title" className={inputClassName} defaultValue={donation.title} required />
          </FormField>
          <FormField label="Category">
            <select name="category" className={inputClassName} defaultValue={donation.category}>
              {FOOD_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Description" className="md:col-span-2">
            <textarea name="description" rows={4} className={inputClassName} defaultValue={donation.description} required />
          </FormField>
          <FormField label="Quantity">
            <input name="quantity" className={inputClassName} defaultValue={donation.quantity} required />
          </FormField>
          <FormField label="Storage type">
            <input name="storageType" className={inputClassName} defaultValue={donation.storageType} required />
          </FormField>
          <FormField label="Expiry date">
            <input name="expiryDate" type="date" className={inputClassName} defaultValue={donation.expiryDate.slice(0, 10)} required />
          </FormField>
          <FormField label="Expiry time">
            <input name="expiryTime" type="time" className={inputClassName} defaultValue={donation.expiryDate.slice(11, 16)} required />
          </FormField>
          <FormField label="Available from">
            <input name="availableFrom" type="date" className={inputClassName} defaultValue={donation.availableFrom.slice(0, 10)} required />
          </FormField>
          <FormField label="Available from time">
            <input name="availableFromTime" type="time" className={inputClassName} defaultValue={donation.availableFrom.slice(11, 16)} required />
          </FormField>
          <FormField label="Available until">
            <input name="availableUntil" type="date" className={inputClassName} defaultValue={donation.availableUntil.slice(0, 10)} required />
          </FormField>
          <FormField label="Available until time">
            <input name="availableUntilTime" type="time" className={inputClassName} defaultValue={donation.availableUntil.slice(11, 16)} required />
          </FormField>
          <FormField label="Pickup address" className="md:col-span-2">
            <input name="pickupAddress" defaultValue={donation.pickupAddress} className={inputClassName} required />
          </FormField>
          <FormField label="Latitude">
            <input name="lat" type="number" step="0.0001" defaultValue={donation.lat} className={inputClassName} required />
          </FormField>
          <FormField label="Longitude">
            <input name="lng" type="number" step="0.0001" defaultValue={donation.lng} className={inputClassName} required />
          </FormField>
          <FormField label="Notes" className="md:col-span-2">
            <textarea name="notes" rows={4} className={inputClassName} defaultValue={donation.notes} />
          </FormField>
          <FormField label="Donation image" className="md:col-span-2">
            <input type="file" name="image" accept="image/*" className={inputClassName} />
          </FormField>
          <button type="submit" className="btn-primary md:col-span-2" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </section>
  );
}

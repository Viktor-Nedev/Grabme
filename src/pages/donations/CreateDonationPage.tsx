import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField, inputClassName } from '@/components/forms/FormField';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { FOOD_CATEGORIES } from '@/utils/constants';

export function CreateDonationPage() {
  const navigate = useNavigate();
  const { addDonation } = useAppData();
  const { currentOrganization } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  if (!currentOrganization) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    const donation = await addDonation(currentOrganization.id, {
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
      imageUrl: '',
      imageFile: form.get('image') instanceof File ? (form.get('image') as File) : null,
    });
    setSubmitting(false);
    navigate(`/donations/${donation.id}`);
  };

  return (
    <section className="section-shell py-10">
      <div className="mx-auto max-w-5xl surface-card p-8">
        <SectionHeading
          eyebrow="Create Donation"
          title="Publish rescued food inventory"
          description="Everything posted here appears in the donation feed and on the public map."
        />
        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
          <FormField label="Title">
            <input name="title" className={inputClassName} placeholder="Fresh produce crates for family pickup" required />
          </FormField>
          <FormField label="Category">
            <select name="category" className={inputClassName} defaultValue="Meal Packs">
              {FOOD_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Description" className="md:col-span-2">
            <textarea name="description" rows={4} className={inputClassName} placeholder="Describe the donation, dietary notes, and packaging details." required />
          </FormField>
          <FormField label="Quantity">
            <input name="quantity" className={inputClassName} placeholder="60 meal packs" required />
          </FormField>
          <FormField label="Storage type">
            <input name="storageType" className={inputClassName} placeholder="Chilled, ambient, frozen" required />
          </FormField>
          <FormField label="Expiry date">
            <input name="expiryDate" type="date" className={inputClassName} required />
          </FormField>
          <FormField label="Expiry time">
            <input name="expiryTime" type="time" className={inputClassName} required />
          </FormField>
          <FormField label="Available from">
            <input name="availableFrom" type="date" className={inputClassName} required />
          </FormField>
          <FormField label="Available from time">
            <input name="availableFromTime" type="time" className={inputClassName} required />
          </FormField>
          <FormField label="Available until">
            <input name="availableUntil" type="date" className={inputClassName} required />
          </FormField>
          <FormField label="Available until time">
            <input name="availableUntilTime" type="time" className={inputClassName} required />
          </FormField>
          <FormField label="Pickup address" className="md:col-span-2">
            <input name="pickupAddress" defaultValue={currentOrganization.address} className={inputClassName} required />
          </FormField>
          <FormField label="Latitude">
            <input name="lat" type="number" step="0.0001" defaultValue={currentOrganization.lat} className={inputClassName} required />
          </FormField>
          <FormField label="Longitude">
            <input name="lng" type="number" step="0.0001" defaultValue={currentOrganization.lng} className={inputClassName} required />
          </FormField>
          <FormField label="Notes" className="md:col-span-2">
            <textarea name="notes" rows={4} className={inputClassName} placeholder="Mention dietary labels, first-come rules, or packing instructions." />
          </FormField>
          <FormField label="Donation image" className="md:col-span-2">
            <input type="file" name="image" accept="image/*" className={inputClassName} />
          </FormField>
          <button type="submit" className="btn-primary md:col-span-2" disabled={submitting}>
            Publish Donation
          </button>
        </form>
      </div>
    </section>
  );
}

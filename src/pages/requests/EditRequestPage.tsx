import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField, inputClassName } from '@/components/forms/FormField';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { FOOD_CATEGORIES } from '@/utils/constants';

export function EditRequestPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { requests, updateRequest } = useAppData();
  const { currentProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const request = requests.find((entry) => entry.id === id);
  if (!request || !currentProfile) {
    return null;
  }

  if (request.profileId !== currentProfile.id) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    await updateRequest(request.id, {
      title: String(form.get('title')),
      description: String(form.get('description')),
      comment: String(form.get('comment')),
      peopleCount: Number(form.get('peopleCount')),
      urgency: form.get('urgency') as 'low' | 'medium' | 'high' | 'critical',
      foodType: form.get('foodType') as (typeof FOOD_CATEGORIES)[number],
      locationText: String(form.get('locationText')),
      lat: Number(form.get('lat')),
      lng: Number(form.get('lng')),
      imageUrl: request.imageUrl,
      imageFile: form.get('image') instanceof File ? (form.get('image') as File) : null,
    });
    setSubmitting(false);
    navigate(`/requests/${request.id}`);
  };

  return (
    <section className="section-shell py-10">
      <div className="mx-auto max-w-5xl surface-card p-8">
        <SectionHeading
          eyebrow="Edit Request"
          title="Update your request details"
          description="Changes are reflected in the request feed and map markers."
        />
        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
          <FormField label="Title">
            <input name="title" className={inputClassName} defaultValue={request.title} required />
          </FormField>
          <FormField label="Number of people">
            <input name="peopleCount" type="number" min="1" className={inputClassName} defaultValue={request.peopleCount} required />
          </FormField>
          <FormField label="Description" className="md:col-span-2">
            <textarea name="description" rows={4} className={inputClassName} defaultValue={request.description} required />
          </FormField>
          <FormField label="Additional comment" className="md:col-span-2">
            <textarea name="comment" rows={3} className={inputClassName} defaultValue={request.comment} />
          </FormField>
          <FormField label="Urgency">
            <select name="urgency" className={inputClassName} defaultValue={request.urgency}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </FormField>
          <FormField label="Preferred food type">
            <select name="foodType" className={inputClassName} defaultValue={request.foodType}>
              {FOOD_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Location text" className="md:col-span-2">
            <input name="locationText" defaultValue={request.locationText} className={inputClassName} required />
          </FormField>
          <FormField label="Latitude">
            <input name="lat" type="number" step="0.0001" defaultValue={request.lat} className={inputClassName} required />
          </FormField>
          <FormField label="Longitude">
            <input name="lng" type="number" step="0.0001" defaultValue={request.lng} className={inputClassName} required />
          </FormField>
          <FormField label="Request image" className="md:col-span-2">
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

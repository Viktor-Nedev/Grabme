import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField, inputClassName } from '@/components/forms/FormField';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { FOOD_CATEGORIES } from '@/utils/constants';

export function CreateRequestPage() {
  const navigate = useNavigate();
  const { addRequest } = useAppData();
  const { currentProfile } = useAuth();
  const [shareLocation, setShareLocation] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!currentProfile) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    const request = await addRequest(currentProfile.id, {
      title: String(form.get('title')),
      description: String(form.get('description')),
      comment: String(form.get('comment')),
      peopleCount: Number(form.get('peopleCount')),
      urgency: form.get('urgency') as 'low' | 'medium' | 'high' | 'critical',
      foodType: form.get('foodType') as (typeof FOOD_CATEGORIES)[number],
      locationText: String(form.get('locationText')),
      lat: shareLocation ? currentProfile.lat : Number(form.get('lat')),
      lng: shareLocation ? currentProfile.lng : Number(form.get('lng')),
      imageUrl: '',
      imageFile: form.get('image') instanceof File ? (form.get('image') as File) : null,
    });
    setSubmitting(false);
    navigate(`/requests/${request.id}`);
  };

  return (
    <section className="section-shell py-10">
      <div className="mx-auto max-w-5xl surface-card p-8">
        <SectionHeading
          eyebrow="Create Request"
          title="Tell the community what food support you need"
          description="Every request appears in the requests feed and on the public map with urgency and location details."
        />
        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
          <FormField label="Title">
            <input name="title" className={inputClassName} placeholder="Hot meals for my family tonight" required />
          </FormField>
          <FormField label="Number of people">
            <input name="peopleCount" type="number" min="1" className={inputClassName} defaultValue={3} required />
          </FormField>
          <FormField label="Description" className="md:col-span-2">
            <textarea name="description" rows={4} className={inputClassName} placeholder="Explain what kind of food support is needed and why." required />
          </FormField>
          <FormField label="Additional comment" className="md:col-span-2">
            <textarea name="comment" rows={3} className={inputClassName} placeholder="Pickup constraints, allergies, or timing notes." />
          </FormField>
          <FormField label="Urgency">
            <select name="urgency" className={inputClassName} defaultValue="high">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </FormField>
          <FormField label="Preferred food type">
            <select name="foodType" className={inputClassName} defaultValue="Meal Packs">
              {FOOD_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Location text" className="md:col-span-2">
            <input name="locationText" defaultValue={currentProfile.locationText} className={inputClassName} required />
          </FormField>
          <label className="md:col-span-2 flex items-center gap-3 rounded-[20px] border border-brand-ink/8 bg-brand-cream/40 px-4 py-4 text-sm">
            <input type="checkbox" checked={shareLocation} onChange={() => setShareLocation((value) => !value)} />
            Share my saved location coordinates automatically
          </label>
          {!shareLocation ? (
            <>
              <FormField label="Latitude">
                <input name="lat" type="number" step="0.0001" defaultValue={currentProfile.lat} className={inputClassName} required />
              </FormField>
              <FormField label="Longitude">
                <input name="lng" type="number" step="0.0001" defaultValue={currentProfile.lng} className={inputClassName} required />
              </FormField>
            </>
          ) : null}
          <FormField label="Request image" className="md:col-span-2">
            <input type="file" name="image" accept="image/*" className={inputClassName} />
          </FormField>
          <button type="submit" className="btn-primary md:col-span-2" disabled={submitting}>
            Publish Request
          </button>
        </form>
      </div>
    </section>
  );
}

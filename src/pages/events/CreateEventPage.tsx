import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField, inputClassName } from '@/components/forms/FormField';
import { MapPicker } from '@/components/map/MapPicker';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { EUROPE_COORDS, FOOD_CATEGORIES } from '@/utils/constants';

export function CreateEventPage() {
  const navigate = useNavigate();
  const { addEvent } = useAppData();
  const { currentOrganization } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [useMapPick, setUseMapPick] = useState(true);
  const [coords, setCoords] = useState({
    lat: currentOrganization?.lat ?? EUROPE_COORDS.lat,
    lng: currentOrganization?.lng ?? EUROPE_COORDS.lng,
  });

  if (!currentOrganization) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    const createdEvent = await addEvent(currentOrganization.id, {
      title: String(form.get('title')),
      description: String(form.get('description')),
      eventDate: new Date(`${String(form.get('date'))}T${String(form.get('time'))}:00`).toISOString(),
      address: String(form.get('address')),
      lat: useMapPick ? coords.lat : Number(form.get('lat')),
      lng: useMapPick ? coords.lng : Number(form.get('lng')),
      foodType: form.get('foodType') as (typeof FOOD_CATEGORIES)[number],
      capacity: Number(form.get('capacity')),
      notes: String(form.get('notes')),
      imageFile: form.get('image') instanceof File ? (form.get('image') as File) : null,
    });
    setSubmitting(false);
    navigate(`/events/${createdEvent.id}`);
  };

  return (
    <section className="section-shell py-10">
      <div className="mx-auto max-w-5xl surface-card p-8">
        <SectionHeading
          eyebrow="Create Event"
          title="Launch a food distribution or community pickup event"
          description="New events appear on the events page and the public map immediately."
        />
        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
          <FormField label="Title">
            <input name="title" className={inputClassName} placeholder="Saturday neighborhood pantry drop" required />
          </FormField>
          <FormField label="Food type">
            <select name="foodType" className={inputClassName} defaultValue="Meal Packs">
              {FOOD_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Description" className="md:col-span-2">
            <textarea name="description" rows={4} className={inputClassName} placeholder="Describe who the event is for, what will be distributed, and any entry guidance." required />
          </FormField>
          <FormField label="Date">
            <input name="date" type="date" className={inputClassName} required />
          </FormField>
          <FormField label="Time">
            <input name="time" type="time" className={inputClassName} required />
          </FormField>
          <FormField label="Address" className="md:col-span-2">
            <input name="address" defaultValue={currentOrganization.address} className={inputClassName} required />
          </FormField>
          <label className="md:col-span-2 flex items-center gap-3 rounded-[20px] border border-brand-ink/8 bg-brand-cream/40 px-4 py-4 text-sm">
            <input type="checkbox" checked={useMapPick} onChange={() => setUseMapPick((value) => !value)} />
            Pick location on map
          </label>
          {useMapPick ? (
            <div className="md:col-span-2">
              <MapPicker value={coords} onChange={setCoords} />
            </div>
          ) : (
            <>
              <FormField label="Latitude">
                <input name="lat" type="number" step="0.0001" defaultValue={currentOrganization.lat} className={inputClassName} required />
              </FormField>
              <FormField label="Longitude">
                <input name="lng" type="number" step="0.0001" defaultValue={currentOrganization.lng} className={inputClassName} required />
              </FormField>
            </>
          )}
          <FormField label="Capacity">
            <input name="capacity" type="number" min="1" defaultValue={80} className={inputClassName} required />
          </FormField>
          <FormField label="Notes" className="md:col-span-2">
            <textarea name="notes" rows={4} className={inputClassName} placeholder="Accessibility notes, registration guidance, or volunteer needs." />
          </FormField>
          <FormField label="Event image" className="md:col-span-2">
            <input type="file" name="image" accept="image/*" className={inputClassName} />
          </FormField>
          <button type="submit" className="btn-primary md:col-span-2" disabled={submitting}>
            Publish Event
          </button>
        </form>
      </div>
    </section>
  );
}

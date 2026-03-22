import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField, inputClassName } from '@/components/forms/FormField';
import { MapPicker } from '@/components/map/MapPicker';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { EUROPE_COORDS, FOOD_CATEGORIES } from '@/utils/constants';

export function EditEventPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { events, updateEvent } = useAppData();
  const { currentOrganization } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [useMapPick, setUseMapPick] = useState(true);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const event = events.find((entry) => entry.id === id);
  const [coords, setCoords] = useState({
    lat: event?.lat ?? EUROPE_COORDS.lat,
    lng: event?.lng ?? EUROPE_COORDS.lng,
  });

  useEffect(() => {
    if (!event) return;
    setCoords({ lat: event.lat, lng: event.lng });
  }, [event]);

  if (!event || !currentOrganization) {
    return null;
  }

  if (currentOrganization.id !== event.organizationId) {
    return null;
  }

  const hasImage = Boolean(event.imageUrl && /^(https?:\/\/|data:image\/|\/)/.test(event.imageUrl));
  const showImage = hasImage && !removeImage && !imageFailed;

  const handleSubmit = async (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const form = new FormData(formEvent.currentTarget);
    setSubmitting(true);
    await updateEvent(event.id, {
      title: String(form.get('title')),
      description: String(form.get('description')),
      eventDate: new Date(`${String(form.get('date'))}T${String(form.get('time'))}:00`).toISOString(),
      address: String(form.get('address')),
      lat: useMapPick ? coords.lat : Number(form.get('lat')),
      lng: useMapPick ? coords.lng : Number(form.get('lng')),
      foodType: form.get('foodType') as (typeof FOOD_CATEGORIES)[number],
      capacity: Number(form.get('capacity')),
      notes: String(form.get('notes')),
      imageUrl: removeImage ? null : event.imageUrl ?? null,
      imageFile: form.get('image') instanceof File ? (form.get('image') as File) : null,
    });
    setSubmitting(false);
    navigate(`/events/${event.id}`);
  };

  return (
    <section className="section-shell py-10">
      <div className="mx-auto max-w-5xl surface-card p-8">
        <SectionHeading
          eyebrow="Edit Event"
          title="Update your event details"
          description="Changes reflect in the event feed and on the map immediately."
        />
        {showImage ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            onError={() => setImageFailed(true)}
            className="mt-6 h-48 w-full rounded-3xl object-cover"
          />
        ) : null}
        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
          <FormField label="Title">
            <input name="title" className={inputClassName} defaultValue={event.title} required />
          </FormField>
          <FormField label="Food type">
            <select name="foodType" className={inputClassName} defaultValue={event.foodType}>
              {FOOD_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Description" className="md:col-span-2">
            <textarea name="description" rows={4} className={inputClassName} defaultValue={event.description} required />
          </FormField>
          <FormField label="Date">
            <input name="date" type="date" className={inputClassName} defaultValue={event.eventDate.slice(0, 10)} required />
          </FormField>
          <FormField label="Time">
            <input name="time" type="time" className={inputClassName} defaultValue={event.eventDate.slice(11, 16)} required />
          </FormField>
          <FormField label="Address" className="md:col-span-2">
            <input name="address" defaultValue={event.address} className={inputClassName} required />
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
                <input name="lat" type="number" step="0.0001" defaultValue={event.lat} className={inputClassName} required />
              </FormField>
              <FormField label="Longitude">
                <input name="lng" type="number" step="0.0001" defaultValue={event.lng} className={inputClassName} required />
              </FormField>
            </>
          )}
          <FormField label="Capacity">
            <input name="capacity" type="number" min="1" defaultValue={event.capacity} className={inputClassName} required />
          </FormField>
          <FormField label="Notes" className="md:col-span-2">
            <textarea name="notes" rows={4} className={inputClassName} defaultValue={event.notes} />
          </FormField>
          <FormField label="Event image" className="md:col-span-2">
            <input type="file" name="image" accept="image/*" className={inputClassName} />
          </FormField>
          {hasImage ? (
            <label className="flex items-center gap-3 rounded-[20px] border border-brand-ink/8 bg-brand-cream/40 px-4 py-4 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={removeImage}
                onChange={() => setRemoveImage((value) => !value)}
              />
              Remove current image (event can be image-free)
            </label>
          ) : null}
          <button type="submit" className="btn-primary md:col-span-2" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </section>
  );
}

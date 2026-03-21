import { FormField, inputClassName } from '@/components/forms/FormField';
import { SectionHeading } from '@/components/common/SectionHeading';

export function SettingsPage() {
  return (
    <div className="surface-card p-8">
      <SectionHeading
        eyebrow="Settings"
        title="Notifications, privacy, and pickup preferences"
        description="These controls are mocked for the demo and are ready to connect to Supabase profile settings later."
      />
      <form className="mt-8 grid gap-5 md:grid-cols-2">
        <FormField label="Notifications">
          <select className={inputClassName} defaultValue="instant">
            <option value="instant">Instant updates</option>
            <option value="hourly">Hourly digest</option>
            <option value="off">Off</option>
          </select>
        </FormField>
        <FormField label="Language">
          <select className={inputClassName} defaultValue="english">
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="bulgarian">Bulgarian</option>
          </select>
        </FormField>
        <FormField label="Preferred radius">
          <select className={inputClassName} defaultValue="5">
            <option value="3">3 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
          </select>
        </FormField>
        <FormField label="Location sharing">
          <select className={inputClassName} defaultValue="approximate">
            <option value="approximate">Approximate only</option>
            <option value="precise">Precise for pickups</option>
            <option value="off">Do not share</option>
          </select>
        </FormField>
        <FormField label="Pickup preference">
          <select className={inputClassName} defaultValue="community">
            <option value="community">Community pickups</option>
            <option value="direct">Direct pickup points</option>
            <option value="events">Events only</option>
          </select>
        </FormField>
      </form>
    </div>
  );
}

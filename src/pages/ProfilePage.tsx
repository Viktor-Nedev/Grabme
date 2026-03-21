import { SectionHeading } from '@/components/common/SectionHeading';
import { RoleBadge } from '@/components/common/RoleBadge';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';

export function ProfilePage() {
  const { requests } = useAppData();
  const { currentProfile, currentOrganization, logout } = useAuth();

  if (!currentProfile) {
    return null;
  }

  const myRequests = requests.filter((request) => request.profileId === currentProfile.id);

  return (
    <div className="space-y-6">
      <div className="surface-card p-8">
        <RoleBadge role={currentProfile.role} verified={Boolean(currentOrganization?.verified)} />
        <SectionHeading title={currentProfile.name} description={currentProfile.email} />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="surface-muted p-4">
            <p className="text-sm text-brand-gray">Phone</p>
            <p className="mt-2 font-semibold">{currentProfile.phone ?? 'Not provided'}</p>
          </div>
          <div className="surface-muted p-4">
            <p className="text-sm text-brand-gray">Saved location</p>
            <p className="mt-2 font-semibold">{currentProfile.locationText}</p>
          </div>
          {currentProfile.role === 'organization' && currentOrganization ? (
            <>
              <div className="surface-muted p-4">
                <p className="text-sm text-brand-gray">Organization type</p>
                <p className="mt-2 font-semibold">{currentOrganization.organizationType}</p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-sm text-brand-gray">Operating hours</p>
                <p className="mt-2 font-semibold">{currentOrganization.operatingHours}</p>
              </div>
              <div className="surface-muted p-4 md:col-span-2">
                <p className="text-sm text-brand-gray">Food categories handled</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentOrganization.foodTypes.map((item) => (
                    <span key={item} className="rounded-full bg-brand-yellow/20 px-3 py-1 text-sm font-medium text-brand-ink">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="surface-muted p-4 md:col-span-2">
              <p className="text-sm text-brand-gray">Request history</p>
              <p className="mt-2 font-semibold">{myRequests.length} requests posted</p>
            </div>
          )}
        </div>
        <div className="mt-8 flex">
          <button type="button" onClick={logout} className="btn-primary">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

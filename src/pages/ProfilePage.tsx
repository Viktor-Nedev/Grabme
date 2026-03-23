import { useEffect, useState } from 'react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Avatar } from '@/components/common/Avatar';
import { RoleBadge } from '@/components/common/RoleBadge';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { FormField, inputClassName } from '@/components/forms/FormField';

export function ProfilePage() {
  const { requests, refreshAll } = useAppData();
  const { currentProfile, currentOrganization, logout, refreshSession } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentProfile?.avatarUrl ?? null);
  const [profileForm, setProfileForm] = useState({
    name: currentProfile?.name ?? '',
    phone: currentProfile?.phone ?? '',
    locationText: currentProfile?.locationText ?? '',
  });
  const [orgForm, setOrgForm] = useState({
    organizationName: currentOrganization?.organizationName ?? '',
    address: currentOrganization?.address ?? '',
    organizationType: currentOrganization?.organizationType ?? '',
    operatingHours: currentOrganization?.operatingHours ?? '',
    capacity: currentOrganization?.capacity ?? 0,
    showOnMap: currentOrganization?.showOnMap ?? true,
  });

  useEffect(() => {
    if (!currentProfile) return;
    setProfileForm({
      name: currentProfile.name,
      phone: currentProfile.phone ?? '',
      locationText: currentProfile.locationText ?? '',
    });
    setAvatarPreview(currentProfile.avatarUrl ?? null);
  }, [currentProfile]);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [avatarFile]);

  useEffect(() => {
    if (!currentOrganization) return;
    setOrgForm({
      organizationName: currentOrganization.organizationName,
      address: currentOrganization.address,
      organizationType: currentOrganization.organizationType,
      operatingHours: currentOrganization.operatingHours ?? '',
      capacity: currentOrganization.capacity ?? 0,
      showOnMap: currentOrganization.showOnMap,
    });
  }, [currentOrganization]);

  if (!currentProfile) {
    return null;
  }

  const myRequests = requests.filter((request) => request.profileId === currentProfile.id);

  return (
    <div className="space-y-6">
      <div className="surface-card p-8">
        <RoleBadge role={currentProfile.role} verified={Boolean(currentOrganization?.verified)} />
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Avatar name={currentProfile.name} src={avatarPreview} className="size-16 border border-white shadow-sm" />
          <SectionHeading title={currentProfile.name} description={currentProfile.email} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="surface-muted p-4">
            <p className="text-sm text-brand-gray">Phone</p>
            <p className="mt-2 font-semibold">{currentProfile.phone ?? 'Not provided'}</p>
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

        <div className="mt-8">
          <button type="button" className="btn-ghost" onClick={() => setEditing((value) => !value)}>
            {editing ? 'Close editor' : 'Edit profile'}
          </button>
        </div>

        {editing ? (
          <form
            className="mt-6 grid gap-5 md:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!supabase) return;
              setSaving(true);
              let avatarUrl = currentProfile.avatarUrl ?? null;
              if (avatarFile) {
                const filename = `avatars/${currentProfile.id}-${Date.now()}-${avatarFile.name}`;
                const { error: uploadError } = await supabase.storage
                  .from('grabme-assets')
                  .upload(filename, avatarFile, { cacheControl: '3600', upsert: false });
                if (!uploadError) {
                  const { data: publicUrl } = supabase.storage.from('grabme-assets').getPublicUrl(filename);
                  avatarUrl = publicUrl.publicUrl;
                }
              }
              await supabase
                .from('profiles')
                .update({
                  name: profileForm.name,
                  phone: profileForm.phone || null,
                  location_text: profileForm.locationText,
                  avatar_url: avatarUrl,
                })
                .eq('id', currentProfile.id);

              if (currentProfile.role === 'organization' && currentOrganization) {
                await supabase
                  .from('organizations')
                  .update({
                    organization_name: orgForm.organizationName,
                    address: orgForm.address,
                    organization_type: orgForm.organizationType,
                    operating_hours: orgForm.operatingHours,
                    capacity: Number(orgForm.capacity),
                    show_on_map: orgForm.showOnMap,
                  })
                  .eq('id', currentOrganization.id);
              }

              await refreshSession();
              await refreshAll();
              setSaving(false);
              setEditing(false);
            }}
          >
            <FormField label="Name">
              <input
                className={inputClassName}
                value={profileForm.name}
                onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </FormField>
            <FormField label="Profile photo">
              <input
                type="file"
                accept="image/*"
                className={inputClassName}
                onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
              />
            </FormField>
            <FormField label="Phone">
              <input
                className={inputClassName}
                value={profileForm.phone}
                onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </FormField>
            <FormField label="Approximate location" hint="Country, State, City/Town" className="md:col-span-2">
              <input
                className={inputClassName}
                value={profileForm.locationText}
                onChange={(event) => setProfileForm((current) => ({ ...current, locationText: event.target.value }))}
                required
              />
            </FormField>

            {currentProfile.role === 'organization' ? (
              <>
                <FormField label="Organization name">
                  <input
                    className={inputClassName}
                    value={orgForm.organizationName}
                    onChange={(event) => setOrgForm((current) => ({ ...current, organizationName: event.target.value }))}
                    required
                  />
                </FormField>
                <FormField label="Address">
                  <input
                    className={inputClassName}
                    value={orgForm.address}
                    onChange={(event) => setOrgForm((current) => ({ ...current, address: event.target.value }))}
                    required
                  />
                </FormField>
                <FormField label="Organization type">
                  <input
                    className={inputClassName}
                    value={orgForm.organizationType}
                    onChange={(event) => setOrgForm((current) => ({ ...current, organizationType: event.target.value }))}
                    required
                  />
                </FormField>
                <FormField label="Operating hours">
                  <input
                    className={inputClassName}
                    value={orgForm.operatingHours}
                    onChange={(event) => setOrgForm((current) => ({ ...current, operatingHours: event.target.value }))}
                  />
                </FormField>
                <FormField label="Capacity">
                  <input
                    type="number"
                    className={inputClassName}
                    value={orgForm.capacity}
                    onChange={(event) => setOrgForm((current) => ({ ...current, capacity: Number(event.target.value) }))}
                  />
                </FormField>
                <label className="flex items-center gap-3 rounded-[20px] border border-brand-ink/8 bg-brand-cream/40 px-4 py-4 text-sm md:col-span-2">
                  <input
                    type="checkbox"
                    checked={orgForm.showOnMap}
                    onChange={() => setOrgForm((current) => ({ ...current, showOnMap: !current.showOnMap }))}
                  />
                  Show organization on the map (pickup hub)
                </label>
              </>
            ) : null}

            <button type="submit" className="btn-primary md:col-span-2" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        ) : null}
        <div className="mt-8 flex">
          <button type="button" onClick={logout} className="btn-primary">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

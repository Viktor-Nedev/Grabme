import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CalendarDays, MapPinned, Navigation, Pencil, Trash2, Users } from 'lucide-react';
import { MiniMapPreview } from '@/components/map/MiniMapPreview';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { useProtectedNavigation } from '@/hooks/useProtectedNavigation';
import { formatDateTime } from '@/utils/formatters';
import { buildNavigationUrl } from '@/utils/map';
import { ROUTES } from '@/utils/constants';

export function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const protectedNavigate = useProtectedNavigation();
  const {
    events,
    organizations,
    eventParticipants,
    conversations,
    conversationMembers,
    joinEvent,
    leaveEvent,
    ensureEventGroupConversation,
    joinConversation,
    deleteEvent,
  } = useAppData();
  const { currentProfile } = useAuth();
  const [working, setWorking] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [autoJoinDone, setAutoJoinDone] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const event = events.find((entry) => entry.id === id);
  const organization = organizations.find((entry) => entry.id === event?.organizationId);
  const hasImage = Boolean(event?.imageUrl && /^(https?:\/\/|data:image\/|\/)/.test(event.imageUrl));
  const showImage = hasImage && !imageFailed;
  const participants = event ? eventParticipants.filter((participant) => participant.eventId === event.id) : [];
  const participantCount = participants.length;
  const hasJoined = Boolean(currentProfile && participants.some((participant) => participant.profileId === currentProfile.id));

  const eventConversation =
    event ? conversations.find((conversation) => conversation.eventId === event.id) ?? null : null;
  const inEventGroup = Boolean(
    currentProfile &&
      eventConversation &&
      conversationMembers.some(
        (member) => member.conversationId === eventConversation.id && member.profileId === currentProfile.id,
      ),
  );
  const isEventOwner = Boolean(currentProfile && organization && currentProfile.id === organization.profileId);

  const handleOpenGroupChat = async () => {
    if (!event) {
      return;
    }
    if (!currentProfile) {
      protectedNavigate(`/events/${event.id}?openChat=1`);
      return;
    }

    setWorking(true);
    setNote(null);
    try {
      let groupConversation = eventConversation;
      if (!groupConversation && isEventOwner) {
        groupConversation = await ensureEventGroupConversation({
          eventId: event.id,
          title: `${event.title} Group`,
          creatorProfileId: currentProfile.id,
        });
      }

      if (!groupConversation) {
        setNote('Event group is not available yet. Ask the organizer to enable it.');
        return;
      }

      if (!inEventGroup) {
        await joinConversation(currentProfile.id, groupConversation.id);
      }
      navigate(`${ROUTES.chat}?conversation=${groupConversation.id}`);
    } catch (err) {
      setNote(err instanceof Error ? err.message : 'Unable to open the event group chat right now.');
    } finally {
      setWorking(false);
    }
  };

  const handleParticipation = async () => {
    if (!event) {
      return;
    }
    if (!currentProfile) {
      protectedNavigate(`/events/${event.id}`);
      return;
    }

    setWorking(true);
    setNote(null);
    try {
      if (hasJoined) {
        await leaveEvent(currentProfile.id, event.id);
      } else {
        await joinEvent(currentProfile.id, event.id);
      }
    } finally {
      setWorking(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event || !isEventOwner) {
      return;
    }
    const confirmed = window.confirm('Delete this event? This cannot be undone.');
    if (!confirmed) {
      return;
    }
    setWorking(true);
    setNote(null);
    try {
      await deleteEvent(event.id);
      navigate(ROUTES.events);
    } catch (err) {
      setNote(err instanceof Error ? err.message : 'Unable to delete the event right now.');
    } finally {
      setWorking(false);
    }
  };

  useEffect(() => {
    if (!event) {
      return;
    }
    if (searchParams.get('openChat') === '1') {
      void handleOpenGroupChat();
    }
  }, [event, searchParams]);

  useEffect(() => {
    if (!event || !currentProfile || !isEventOwner || autoJoinDone) {
      return;
    }
    setAutoJoinDone(true);
    void (async () => {
      try {
        if (!hasJoined) {
          await joinEvent(currentProfile.id, event.id);
        }
        if (eventConversation && !inEventGroup) {
          await joinConversation(currentProfile.id, eventConversation.id);
        }
      } catch {
        // Swallow auto-join errors; user can manually join.
      }
    })();
  }, [autoJoinDone, currentProfile, event, eventConversation, hasJoined, inEventGroup, isEventOwner, joinConversation, joinEvent]);

  if (!event || !organization) {
    return null;
  }

  return (
    <section className="section-shell py-10">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-8">
          {showImage ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              onError={() => setImageFailed(true)}
              className="mb-6 h-56 w-full rounded-3xl object-cover"
            />
          ) : null}
          <SectionHeading eyebrow={event.foodType} title={event.title} description={event.description} />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">Organizer</p>
              <p className="mt-2 font-semibold">{organization.organizationName}</p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">Date and time</p>
              <p className="mt-2 font-semibold">{formatDateTime(event.eventDate)}</p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">Capacity</p>
              <p className="mt-2 font-semibold">{event.capacity}</p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">Participants</p>
              <p className="mt-2 font-semibold">{participantCount} joined</p>
            </div>
            <div className="surface-muted p-4 md:col-span-2">
              <p className="text-sm text-brand-gray">Location</p>
              <p className="mt-2 font-semibold">{event.address}</p>
              <p className="mt-2 text-sm text-brand-gray">{event.notes}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <MiniMapPreview
              markers={[
                {
                  id: `event-${event.id}`,
                  entityId: event.id,
                  type: 'event',
                  title: event.title,
                  description: event.description,
                  locationText: event.address,
                  color: 'purple',
                  detailRoute: `/events/${event.id}`,
                  navigationLabel: organization.organizationName,
                  meta: 'Community event',
                  lat: event.lat,
                  lng: event.lng,
                },
              ]}
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={`/map?focus=event:${event.id}`} className="btn-primary">
                <MapPinned className="size-4" />
                View on Map
              </Link>
              <a href={buildNavigationUrl(event.address, event.lat, event.lng)} target="_blank" rel="noreferrer" className="btn-ghost">
                <Navigation className="size-4" />
                Navigate
              </a>
              <button type="button" onClick={handleParticipation} className="btn-secondary" disabled={working}>
                <Users className="size-4" />
                {hasJoined ? 'Cancel Participation' : 'I Will Attend'}
              </button>
              <button type="button" onClick={handleOpenGroupChat} className="btn-ghost" disabled={working}>
                {inEventGroup ? 'Open Group Chat' : 'Join Event Group'}
              </button>
              {isEventOwner ? (
                <>
                  <Link to={`/events/${event.id}/edit`} className="btn-ghost" aria-label="Edit event">
                    <Pencil className="size-4" />
                    Edit Event
                  </Link>
                  <button type="button" onClick={handleDeleteEvent} className="btn-ghost text-red-600" disabled={working}>
                    <Trash2 className="size-4" />
                    Delete Event
                  </button>
                </>
              ) : null}
            </div>
            {note ? <p className="mt-2 text-sm text-red-600">{note}</p> : null}
          </div>
          <div className="surface-card p-6">
            <div className="flex items-center gap-3 text-brand-red">
              <CalendarDays className="size-5" />
              <p className="font-semibold">Distribution snapshot</p>
            </div>
            <p className="mt-3 text-sm text-brand-gray">
              This event is visible on the public map so community members can discover it even before they log in.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

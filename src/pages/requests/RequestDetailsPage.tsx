import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MessageCircle, MessageSquareMore, Navigation, PackagePlus, Trash2 } from 'lucide-react';
import { MiniMapPreview } from '@/components/map/MiniMapPreview';
import { Avatar } from '@/components/common/Avatar';
import { SectionHeading } from '@/components/common/SectionHeading';
import { inputClassName } from '@/components/forms/FormField';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { useProtectedNavigation } from '@/hooks/useProtectedNavigation';
import { ROUTES } from '@/utils/constants';
import { buildNavigationUrl } from '@/utils/map';
import { formatDateTime, urgencyTone } from '@/utils/formatters';

export function RequestDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const protectedNavigate = useProtectedNavigation();
  const { requests, profiles, comments, addComment, deleteRequest, createOrGetDirectConversation } = useAppData();
  const { currentProfile } = useAuth();
  const [comment, setComment] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [chatStarting, setChatStarting] = useState(false);
  const navigate = useNavigate();
  const request = requests.find((entry) => entry.id === id);
  const requester = profiles.find((entry) => entry.id === request?.profileId);
  const requestComments = comments.filter((entry) => entry.requestId === id);

  if (!request || !requester) {
    return null;
  }
  const isOwner = currentProfile?.id === request.profileId;

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentProfile || !comment.trim()) {
      return;
    }

    await addComment(currentProfile.id, {
      requestId: request.id,
      content: comment.trim(),
    });
    setComment('');
  };

  const handleStartChat = async () => {
    if (!requester || requester.id === currentProfile?.id) {
      return;
    }

    if (!currentProfile) {
      protectedNavigate(`/requests/${request.id}?openChat=1`);
      return;
    }

    setChatStarting(true);
    try {
      const conversation = await createOrGetDirectConversation(currentProfile.id, requester.id);
      navigate(`${ROUTES.chat}?conversation=${conversation.id}`);
    } finally {
      setChatStarting(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('openChat') === '1') {
      void handleStartChat();
    }
  }, [searchParams]);

  return (
    <section className="section-shell py-10">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-8">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${urgencyTone(request.urgency)}`}>
            {request.urgency.toUpperCase()}
          </span>
          <SectionHeading title={request.title} description={request.description} />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">People count</p>
              <p className="mt-2 font-semibold">{request.peopleCount}</p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm text-brand-gray">Posted</p>
              <p className="mt-2 font-semibold">{formatDateTime(request.createdAt)}</p>
            </div>
            <div className="surface-muted p-4 md:col-span-2">
              <p className="text-sm text-brand-gray">Location</p>
              <p className="mt-2 font-semibold">{request.locationText}</p>
            </div>
            <div className="surface-muted p-4 md:col-span-2">
              <p className="text-sm text-brand-gray">Additional comment</p>
              <p className="mt-2 text-sm text-brand-gray">{request.comment || 'No additional note provided.'}</p>
            </div>
          </div>

          <div className="mt-8">
            <SectionHeading title="Comments" description="Organizations and community members can coordinate here." />
            <div className="mt-5 space-y-3">
              {requestComments.map((entry) => (
                <div key={entry.id} className="surface-muted p-4">
                  <p className="font-semibold">{profiles.find((profile) => profile.id === entry.profileId)?.name ?? 'Community member'}</p>
                  <p className="mt-2 text-sm text-brand-gray">{entry.content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleCommentSubmit} className="mt-5 space-y-3">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                className={`${inputClassName}`}
                placeholder={currentProfile ? 'Add a coordination comment' : 'Login to add a comment'}
                disabled={!currentProfile}
              />
              <button type="submit" className="btn-primary" disabled={!currentProfile}>
                <MessageSquareMore className="size-4" />
                Add Comment
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <MiniMapPreview
              markers={[
                {
                  id: `request-${request.id}`,
                  entityId: request.id,
                  type: 'request',
                  title: request.title,
                  description: request.description,
                  locationText: request.locationText,
                  color: request.urgency === 'critical' || request.urgency === 'high' ? 'red' : 'yellow',
                  detailRoute: `/requests/${request.id}`,
                  navigationLabel: requester.name,
                  meta: 'Community request',
                  lat: request.lat,
                  lng: request.lng,
                },
              ]}
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={`/map?focus=request:${request.id}`} className="btn-primary">
                View on Map
              </Link>
              <a
                href={buildNavigationUrl(request.locationText, request.lat, request.lng)}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <Navigation className="size-4" />
                Navigate
              </a>
              <button type="button" onClick={() => protectedNavigate('/donations/new')} className="btn-secondary">
                <PackagePlus className="size-4" />
                Offer Food
              </button>
              {!isOwner ? (
                <button type="button" onClick={handleStartChat} className="btn-ghost" disabled={chatStarting}>
                  <MessageCircle className="size-4" />
                  Chat
                </button>
              ) : null}
              {isOwner ? (
                <>
                  <Link to={`/requests/${request.id}/edit`} className="btn-ghost">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn-ghost text-red-600 hover:text-red-700"
                    disabled={deleting}
                    onClick={async () => {
                      if (!window.confirm('Delete this request? This cannot be undone.')) {
                        return;
                      }
                      setDeleting(true);
                      try {
                        await deleteRequest(request.id);
                        navigate('/requests');
                      } finally {
                        setDeleting(false);
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              ) : null}
            </div>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gray">Posted by</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={requester.name} src={requester.avatarUrl ?? null} className="size-9" />
              <div>
                <h3 className="font-display text-2xl">{requester.name}</h3>
                <p className="mt-1 text-sm text-brand-gray">{requester.locationText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

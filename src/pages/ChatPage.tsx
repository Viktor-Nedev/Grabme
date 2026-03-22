import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LogOut,
  MessageCircle,
  PencilLine,
  SendHorizontal,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { inputClassName } from '@/components/forms/FormField';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';

export function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentProfile } = useAuth();
  const {
    profiles,
    events,
    conversations,
    conversationMembers,
    messages,
    joinConversation,
    leaveConversation,
    addConversationMember,
    removeConversationMember,
    renameConversation,
    sendMessage,
  } = useAppData();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    searchParams.get('conversation'),
  );
  const [messageText, setMessageText] = useState('');
  const [groupName, setGroupName] = useState('');
  const [addingMemberId, setAddingMemberId] = useState('');
  const [working, setWorking] = useState(false);

  const myMemberships = useMemo(
    () =>
      conversationMembers.filter((member) => member.profileId === currentProfile?.id),
    [conversationMembers, currentProfile?.id],
  );

  const myConversationIds = useMemo(
    () => new Set(myMemberships.map((member) => member.conversationId)),
    [myMemberships],
  );

  const myConversations = useMemo(
    () =>
      conversations
        .filter((conversation) => myConversationIds.has(conversation.id))
        .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()),
    [conversations, myConversationIds],
  );

  const directConversations = myConversations.filter((conversation) => conversation.type === 'direct');
  const groupConversations = myConversations.filter((conversation) => conversation.type === 'group');

  useEffect(() => {
    const requestedConversation = searchParams.get('conversation');
    if (requestedConversation) {
      setSelectedConversationId(requestedConversation);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedConversationId && myConversations.length) {
      const nextId = myConversations[0].id;
      setSelectedConversationId(nextId);
      navigate(`${ROUTES.chat}?conversation=${nextId}`, { replace: true });
    }
  }, [myConversations, navigate, selectedConversationId]);

  const selectedConversation =
    myConversations.find((conversation) => conversation.id === selectedConversationId) ?? null;

  const selectedMembers = selectedConversation
    ? conversationMembers.filter((member) => member.conversationId === selectedConversation.id)
    : [];
  const mySelectedMembership = selectedMembers.find((member) => member.profileId === currentProfile?.id) ?? null;
  const isGroupAdmin = Boolean(
    selectedConversation?.type === 'group' && mySelectedMembership?.role === 'admin',
  );

  const selectedMessages = selectedConversation
    ? messages
        .filter((message) => message.conversationId === selectedConversation.id)
        .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
    : [];

  const groupMemberIds = new Set(selectedMembers.map((member) => member.profileId));
  const addableProfiles = profiles.filter((profile) => !groupMemberIds.has(profile.id));

  const resolveConversationTitle = (conversationId: string) => {
    const conversation = conversations.find((entry) => entry.id === conversationId);
    if (!conversation || !currentProfile) {
      return 'Conversation';
    }

    if (conversation.type === 'direct') {
      const members = conversationMembers
        .filter((member) => member.conversationId === conversation.id)
        .map((member) => member.profileId);
      const otherId = members.find((memberId) => memberId !== currentProfile.id);
      return profiles.find((profile) => profile.id === otherId)?.name ?? 'Direct chat';
    }

    if (conversation.eventId) {
      const event = events.find((entry) => entry.id === conversation.eventId);
      if (event) {
        return `${event.title} Group`;
      }
    }

    return conversation.title ?? 'Group chat';
  };

  const resolveMemberCount = (conversationId: string) =>
    conversationMembers.filter((member) => member.conversationId === conversationId).length;

  const openConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    navigate(`${ROUTES.chat}?conversation=${conversationId}`, { replace: true });
  };

  if (!currentProfile) {
    return null;
  }

  return (
    <section className="section-shell py-10">
      <SectionHeading
        eyebrow="Chat"
        title="Direct chats and group coordination"
        description="Use direct conversations for one-to-one support and event groups for community coordination."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.28fr_0.48fr_0.24fr]">
        <div className="surface-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gray">Direct chats</p>
          <div className="mt-3 space-y-2">
            {directConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                  selectedConversationId === conversation.id
                    ? 'border-brand-red bg-brand-red/5'
                    : 'border-brand-ink/10 bg-white'
                }`}
                onClick={() => openConversation(conversation.id)}
              >
                <p className="text-sm font-semibold">{resolveConversationTitle(conversation.id)}</p>
                <p className="mt-1 text-xs text-brand-gray">Private conversation</p>
              </button>
            ))}
            {!directConversations.length ? (
              <p className="rounded-2xl bg-brand-cream/60 px-3 py-3 text-xs text-brand-gray">
                No direct chats yet. Use a `Chat` button from requests or donations.
              </p>
            ) : null}
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gray">Groups</p>
          <div className="mt-3 space-y-2">
            {groupConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                  selectedConversationId === conversation.id
                    ? 'border-brand-red bg-brand-red/5'
                    : 'border-brand-ink/10 bg-white'
                }`}
                onClick={() => openConversation(conversation.id)}
              >
                <p className="text-sm font-semibold">{resolveConversationTitle(conversation.id)}</p>
                <p className="mt-1 text-xs text-brand-gray">
                  {resolveMemberCount(conversation.id)} members
                </p>
              </button>
            ))}
            {!groupConversations.length ? (
              <p className="rounded-2xl bg-brand-cream/60 px-3 py-3 text-xs text-brand-gray">
                No group chats yet. Event groups appear here after creation or join.
              </p>
            ) : null}
          </div>
        </div>

        <div className="surface-card flex min-h-[620px] flex-col p-5">
          {selectedConversation ? (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-brand-ink/10 pb-4">
                <div>
                  <p className="font-display text-2xl">{resolveConversationTitle(selectedConversation.id)}</p>
                  <p className="mt-1 text-sm text-brand-gray">
                    {selectedConversation.type === 'group' ? 'Group conversation' : 'Direct conversation'}
                  </p>
                </div>
                {selectedConversation.eventId ? (
                  <Link to={`/events/${selectedConversation.eventId}`} className="btn-ghost px-4 py-2 text-sm">
                    Open Event
                  </Link>
                ) : null}
              </div>

              <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                {selectedMessages.map((message) => {
                  const isMine = message.profileId === currentProfile.id;
                  const sender = profiles.find((profile) => profile.id === message.profileId);
                  return (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        isMine
                          ? 'ml-auto bg-brand-red text-white'
                          : 'bg-brand-cream/70 text-brand-ink'
                      }`}
                    >
                      <p className="text-xs font-semibold opacity-80">
                        {isMine ? 'You' : sender?.name ?? 'Member'}
                      </p>
                      <p className="mt-1 text-sm">{message.content}</p>
                      <p className="mt-2 text-[11px] opacity-70">{formatDateTime(message.createdAt)}</p>
                    </div>
                  );
                })}
                {!selectedMessages.length ? (
                  <div className="rounded-2xl bg-brand-cream/70 p-4 text-sm text-brand-gray">
                    No messages yet. Start the conversation.
                  </div>
                ) : null}
              </div>

              <form
                className="mt-4 flex gap-2 border-t border-brand-ink/10 pt-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!messageText.trim()) return;
                  setWorking(true);
                  try {
                    await sendMessage(currentProfile.id, {
                      conversationId: selectedConversation.id,
                      content: messageText.trim(),
                    });
                    setMessageText('');
                  } finally {
                    setWorking(false);
                  }
                }}
              >
                <input
                  className={inputClassName}
                  placeholder="Type a message"
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  disabled={!mySelectedMembership || working}
                />
                <button type="submit" className="btn-primary px-4 py-3" disabled={!mySelectedMembership || working}>
                  <SendHorizontal className="size-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl bg-brand-cream/50 text-center text-brand-gray">
              <div>
                <MessageCircle className="mx-auto size-8 text-brand-red" />
                <p className="mt-3 text-sm">Select a conversation to start chatting.</p>
              </div>
            </div>
          )}
        </div>

        <div className="surface-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gray">Group controls</p>
          {!selectedConversation ? (
            <p className="mt-3 text-sm text-brand-gray">Pick a conversation to see details.</p>
          ) : selectedConversation.type === 'direct' ? (
            <div className="mt-3 rounded-2xl bg-brand-cream/60 p-4 text-sm text-brand-gray">
              This is a private conversation between two people.
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              <div className="rounded-2xl bg-brand-cream/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <UsersRound className="size-4 text-brand-red" />
                  {selectedMembers.length} members
                </div>
                <div className="mt-3 space-y-2">
                  {selectedMembers.map((member) => {
                    const profile = profiles.find((entry) => entry.id === member.profileId);
                    const canRemove =
                      isGroupAdmin &&
                      member.profileId !== currentProfile.id;
                    return (
                      <div key={member.id} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
                        <div>
                          <p className="text-sm font-semibold">{profile?.name ?? 'Member'}</p>
                          <p className="text-xs text-brand-gray">
                            {member.role === 'admin' ? 'Admin' : 'Member'}
                          </p>
                        </div>
                        {member.role === 'admin' ? (
                          <ShieldCheck className="size-4 text-brand-red" />
                        ) : canRemove ? (
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-600"
                            onClick={async () => {
                              setWorking(true);
                              try {
                                await removeConversationMember(selectedConversation.id, member.profileId);
                              } finally {
                                setWorking(false);
                              }
                            }}
                            disabled={working}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              {isGroupAdmin ? (
                <>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm font-semibold">Rename group</p>
                    <form
                      className="mt-3 flex gap-2"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        if (!groupName.trim()) return;
                        setWorking(true);
                        try {
                          await renameConversation(selectedConversation.id, groupName.trim());
                          setGroupName('');
                        } finally {
                          setWorking(false);
                        }
                      }}
                    >
                      <input
                        className={inputClassName}
                        placeholder={selectedConversation.title ?? 'Group title'}
                        value={groupName}
                        onChange={(event) => setGroupName(event.target.value)}
                      />
                      <button type="submit" className="btn-ghost px-4 py-3" disabled={working}>
                        <PencilLine className="size-4" />
                      </button>
                    </form>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm font-semibold">Add member</p>
                    <div className="mt-3 flex gap-2">
                      <select
                        className={inputClassName}
                        value={addingMemberId}
                        onChange={(event) => setAddingMemberId(event.target.value)}
                      >
                        <option value="">Select profile</option>
                        {addableProfiles.map((profile) => (
                          <option key={profile.id} value={profile.id}>
                            {profile.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn-ghost px-4 py-3"
                        onClick={async () => {
                          if (!addingMemberId) return;
                          setWorking(true);
                          try {
                            await addConversationMember(selectedConversation.id, addingMemberId);
                            setAddingMemberId('');
                          } finally {
                            setWorking(false);
                          }
                        }}
                        disabled={working || !addingMemberId}
                      >
                        <UserPlus className="size-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : null}

              <button
                type="button"
                className="btn-ghost w-full justify-center text-sm"
                onClick={async () => {
                  setWorking(true);
                  try {
                    await leaveConversation(currentProfile.id, selectedConversation.id);
                    setSelectedConversationId(null);
                    navigate(ROUTES.chat, { replace: true });
                  } finally {
                    setWorking(false);
                  }
                }}
                disabled={working}
              >
                <LogOut className="size-4" />
                Leave group
              </button>
            </div>
          )}

          {selectedConversation && !mySelectedMembership ? (
            <button
              type="button"
              className="btn-secondary mt-4 w-full justify-center text-sm"
              onClick={async () => {
                setWorking(true);
                try {
                  await joinConversation(currentProfile.id, selectedConversation.id);
                } finally {
                  setWorking(false);
                }
              }}
              disabled={working}
            >
              Join conversation
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

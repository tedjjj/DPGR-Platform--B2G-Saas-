
// Side effect hook for handling data or state updates.
import React, { useEffect, useMemo, useState } from 'react';
import './Messagerie.css';
import { authFetch } from '../api/jwtClient';

const readJson = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const truncate = (value, max = 90) => {
  const text = (value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
};

const buildSubject = (content, id) => {
  const firstLine = (content || '')
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  return truncate(firstLine || `Message #${id}`, 70);
};

const formatFullName = (nom, prenom) => {
  return [nom, prenom].filter(Boolean).join(' ').trim() || 'Utilisateur';
};

const getInitials = (nom, prenom) => {
  const initials = `${nom?.[0] || ''}${prenom?.[0] || ''}`.toUpperCase();
  return initials || '??';
};

const getAvatarColor = (id) => {
  const colors = ['#1e3a5f', '#3b4f70', '#2d4a6b', '#1a3a5c', '#355c7d'];
  return colors[id % colors.length];
};

const formatDateParts = (isoString) => {
  if (!isoString) return { date: '', time: '' };

  const date = new Date(isoString);
  return {
    date: date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';

  return new Date(isoString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mapReply = (reply, currentUserName) => {
  const authorName = formatFullName(reply.assistant_nom, reply.assistant_prenom);

  return {
    id: reply.id,
    author: authorName === currentUserName ? 'Votre reponse' : authorName,
    date: formatDateTime(reply.date_reponse),
    text: reply.contenu || '',
  };
};

const buildReadByLabel = (lusPar, currentUserName) => {
  // lusPar: array of {nom, prenom} objects or strings from API
  if (!Array.isArray(lusPar) || lusPar.length === 0) return null;
  const names = lusPar.map((u) => {
    const name = typeof u === 'string' ? u : formatFullName(u.nom, u.prenom);
    return name === currentUserName ? 'Vous' : name;
  });
  return names.join(', ');
};

const mapMessage = (message, currentUserName) => {
  const senderName = formatFullName(message.chercheur_nom, message.chercheur_prenom);
  const { date, time } = formatDateParts(message.date_envoi);

  // Support both old est_lu boolean and new lus_par array
  const lusPar = message.lus_par;
  let readBy = null;
  if (Array.isArray(lusPar) && lusPar.length > 0) {
    readBy = buildReadByLabel(lusPar, currentUserName);
  } else if (message.est_lu) {
    readBy = 'Vous';
  }

  return {
    id: message.id,
    chercheurId: message.chercheur,
    senderName,
    initials: getInitials(message.chercheur_nom, message.chercheur_prenom),
    avatarColor: getAvatarColor(message.id),
    subject: buildSubject(message.contenu, message.id),
    preview: truncate(message.contenu, 110),
    date,
    time,
    unread: !message.est_lu,
    readBy,
    lusPar: Array.isArray(lusPar) ? lusPar : [],
    fullText: message.contenu || '',
    estRepondu: Boolean(message.est_repondu),
    replies: Array.isArray(message.reponses)
      ? message.reponses.map((reply) => mapReply(reply, currentUserName))
      : [],
  };
};

// Small UI icon used in the interface.
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);
// Small UI icon used in the interface.
const FilterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39A.998.998 0 0 0 18.95 4H5.04c-.83 0-1.3.95-.79 1.61z"/>
  </svg>
);
// Small UI icon used in the interface.
const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);
// Small UI icon used in the interface.
const MailOpenIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1.95c-.525 0-1.05.15-1.5.45l-7.5 5.1C2.38 7.9 2 8.6 2 9.3V19c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9.3c0-.7-.38-1.4-1-1.8l-7.5-5.1c-.45-.3-.975-.45-1.5-.45zm0 2l7 4.76V9l-7 4.5L5 9V8.71L12 3.95zM4 19V11l8 5 8-5v8H4z"/>
  </svg>
);
// Small UI icon used in the interface.
const MailGreenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#16a34a">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);
// Small UI icon used in the interface.
const MailGrayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#9ca3af">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);
// Small UI icon used in the interface.
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
  </svg>
);
// Small UI icon used in the interface.
const ReplyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
  </svg>
);
// Small UI icon used in the interface.
const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);
// Small UI icon used in the interface.
const EnvelopeIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

// React component: MsgDetailContent.
const MsgDetailContent = ({ selectedMsg, replyText, setReplyText, handleMarkRead, handleSend, sending, markingRead }) => (
  <>
    <div className="msg-detail-header">
      <div className="msg-detail-avatar" style={{ background: selectedMsg.avatarColor }}>
        {selectedMsg.initials}
      </div>
      <div className="msg-detail-meta" style={{ flex: 1 }}>
        <div className="msg-detail-name">{selectedMsg.senderName}</div>
        <div className="msg-detail-date">{selectedMsg.date}, {selectedMsg.time}</div>
        <div className="msg-detail-subject">{selectedMsg.subject}</div>
        {selectedMsg.readBy && (
          <div className="msg-detail-readby">
            <CheckIcon /> Lu par: {selectedMsg.readBy}
          </div>
        )}
      </div>
      <button
        className="msg-detail-icon-btn"
        title="Marquer comme lu"
        onClick={handleMarkRead}
        disabled={!selectedMsg.unread || markingRead}
      >
        {selectedMsg.unread ? <MailGrayIcon /> : <MailGreenIcon />}
      </button>
    </div>

    <div className="msg-detail-body">
      <div className="msg-bubble">
        <div className="msg-bubble-text">{selectedMsg.fullText}</div>
        <div className="msg-bubble-author">- {selectedMsg.senderName}</div>
      </div>

      {selectedMsg.replies.map((reply) => (
        <div key={reply.id} className="msg-reply-bubble">
          <div className="msg-reply-header">
            <ReplyIcon /> {reply.author} • {reply.date}
          </div>
          <div className="msg-reply-text">{reply.text}</div>
        </div>
      ))}
    </div>

    <div className="msg-compose">
      <textarea
        className="msg-compose-input"
        placeholder="Tapez votre reponse..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        rows={2}
      />
      <div className="msg-compose-actions">
        <button className="msg-btn-mark" onClick={handleMarkRead} disabled={!selectedMsg.unread || markingRead}>
          {markingRead ? 'Traitement...' : 'Marquer comme lu'}
        </button>
        <button className="msg-btn-send" onClick={handleSend} disabled={sending || !replyText.trim()}>
          <SendIcon /> {sending ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </div>
  </>
);

// React component: Messagerie.
const Messagerie = ({ onUnreadChange, targetConversation }) => {
// State management using React hooks.
  const [messages, setMessages] = useState([]);
// State management using React hooks.
  const [selected, setSelected] = useState(null);
// State management using React hooks.
  const [mobileOpen, setMobileOpen] = useState(null); // id of expanded item on mobile
// State management using React hooks.
  const [filter, setFilter] = useState('tous');
// State management using React hooks.
  const [search, setSearch] = useState('');
// State management using React hooks.
  const [replyText, setReplyText] = useState('');
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [sending, setSending] = useState(false);
// State management using React hooks.
  const [markingRead, setMarkingRead] = useState(false);
// State management using React hooks.
  const [error, setError] = useState('');
// State management using React hooks.
  const [currentUserName, setCurrentUserName] = useState('');
// State management using React hooks.
  const [pendingTarget, setPendingTarget] = useState(null);

// Side effect hook for handling data or state updates.
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        setError('');

        const [meRes, messagesRes] = await Promise.all([
          authFetch('/users/me/'),
          authFetch('/messagerie/'),
        ]);

        const [meData, messagesData] = await Promise.all([
          readJson(meRes),
          readJson(messagesRes),
        ]);

        if (!meRes.ok) {
          throw new Error(meData?.detail || "Impossible de charger l'utilisateur.");
        }

        if (!messagesRes.ok) {
          throw new Error(messagesData?.detail || 'Impossible de charger les messages.');
        }

        const userName = formatFullName(meData?.nom, meData?.prenom);
        const normalized = Array.isArray(messagesData)
          ? messagesData.map((message) => mapMessage(message, userName))
          : [];

        setCurrentUserName(userName);
        setMessages(normalized);
        setSelected((prev) => {
          if (prev && normalized.some((message) => message.id === prev)) return prev;
          return normalized[0]?.id ?? null;
        });
      } catch (err) {
        setError(err.message || 'Impossible de charger les messages.');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  const filtered = useMemo(() => {
    return messages.filter((message) => {
      const matchFilter =
        filter === 'tous' ? true
          : filter === 'nonlus' ? message.unread
            : filter === 'lus' ? !message.unread
              : true;

      const q = search.trim().toLowerCase();
      const matchSearch = !q
        || message.senderName.toLowerCase().includes(q)
        || message.subject.toLowerCase().includes(q)
        || message.preview.toLowerCase().includes(q)
        || message.fullText.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [messages, filter, search]);

  const unreadCount = messages.filter((message) => message.unread).length;
  const selectedMsg = selected != null ? messages.find((message) => message.id === selected) : null;

// Side effect hook for handling data or state updates.
  useEffect(() => {
    if (!targetConversation) {
      setPendingTarget(null);
      return;
    }

    const matchedMessage = messages.find((message) =>
      message.chercheurId === targetConversation.chercheurId
      || message.senderName === targetConversation.chercheurName
    );

    if (matchedMessage) {
      setSelected(matchedMessage.id);
      setMobileOpen(matchedMessage.id);
      setReplyText('');
      setPendingTarget(null);
      return;
    }

    setSelected(null);
    setMobileOpen(null);
    setReplyText('');
    setPendingTarget(targetConversation);
  }, [messages, targetConversation]);

// Side effect hook for handling data or state updates.
  useEffect(() => {
    if (typeof onUnreadChange === 'function') {
      onUnreadChange(unreadCount);
    }
  }, [unreadCount, onUnreadChange]);

  const handleSelect = (id) => {
    setSelected(id);
    setMobileOpen((prev) => (prev === id ? null : id));
    setReplyText('');
  };

  const handleMarkRead = async () => {
    if (!selectedMsg || !selectedMsg.unread) return;

    try {
      setMarkingRead(true);
      setError('');

      const response = await authFetch(`/messagerie/${selectedMsg.id}/marquer-lu/`, {
        method: 'POST',
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data?.detail || 'Impossible de marquer le message comme lu.');
      }

      setMessages((prev) => prev.map((message) => (
        message.id === selectedMsg.id
          ? {
              ...message,
              unread: false,
              readBy: message.readBy
                ? message.readBy.split(', ').includes('Vous')
                  ? message.readBy
                  : `${message.readBy}, Vous`
                : 'Vous',
              lusPar: [...(message.lusPar || []), { nom: currentUserName.split(' ')[0], prenom: currentUserName.split(' ').slice(1).join(' ') }],
            }
          : message
      )));
    } catch (err) {
      setError(err.message || 'Impossible de marquer le message comme lu.');
    } finally {
      setMarkingRead(false);
    }
  };

  const handleSend = async () => {
    if (!replyText.trim() || !selectedMsg) return;

    try {
      setSending(true);
      setError('');

      const response = await authFetch(`/messagerie/${selectedMsg.id}/repondre/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: replyText.trim() }),
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data?.detail || "Impossible d'envoyer la reponse.");
      }

      const nextReply = mapReply(data, currentUserName);

      setMessages((prev) => prev.map((message) => (
        message.id === selectedMsg.id
          ? {
              ...message,
              unread: false,
              readBy: message.readBy
                ? message.readBy.split(', ').includes('Vous')
                  ? message.readBy
                  : `${message.readBy}, Vous`
                : 'Vous',
              estRepondu: true,
              replies: [...message.replies, nextReply],
            }
          : message
      )));
      setReplyText('');
    } catch (err) {
      setError(err.message || "Impossible d'envoyer la reponse.");
    } finally {
      setSending(false);
    }
  };

// Render the component JSX.
  return (
    <div className="msg-layout">
      <div className="msg-panels">
        <div className="msg-panel msg-inbox">
          <div className="msg-search-wrap">
            <div className="msg-search-wrapper">
              <span className="msg-search-icon"><SearchIcon /></span>
              <input
                className="msg-search"
                placeholder="Rechercher un message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="msg-filters">
            <button
              className={`msg-filter-btn ${filter === 'tous' ? 'active' : ''}`}
              onClick={() => setFilter('tous')}
            >
              <FilterIcon /> Tous ({messages.length})
            </button>
            <button
              className={`msg-filter-btn ${filter === 'nonlus' ? 'active' : ''}`}
              onClick={() => setFilter('nonlus')}
            >
              <MailIcon /> Non lus ({unreadCount})
            </button>
            <button
              className={`msg-filter-btn ${filter === 'lus' ? 'active' : ''}`}
              onClick={() => setFilter('lus')}
            >
              <MailOpenIcon /> Lus
            </button>
          </div>

          <div className="msg-list">
            {loading ? (
              <div style={{ padding: '24px 16px', color: '#64748b', textAlign: 'center' }}>
                Chargement des messages...
              </div>
            ) : null}

            {!loading && error ? (
              <div style={{ padding: '18px 16px', color: '#dc2626', textAlign: 'center' }}>
                {error}
              </div>
            ) : null}

            {!loading && !error && filtered.length === 0 ? (
              <div style={{ padding: '24px 16px', color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>
                Aucun message trouve.
              </div>
            ) : null}

            {!loading && !error && filtered.map((msg) => (
              <React.Fragment key={msg.id}>
                <div
                  className={`msg-item ${msg.unread ? 'unread' : ''} ${selected === msg.id ? 'selected' : ''}`}
                  onClick={() => handleSelect(msg.id)}
                >
                  <div className="msg-item-avatar" style={{ background: msg.avatarColor }}>
                    {msg.initials}
                  </div>
                  <div className="msg-item-body">
                    <div className="msg-item-top">
                      <span className="msg-item-name">
                        {msg.senderName}
                        {msg.unread && <span className="msg-unread-dot" />}
                      </span>
                      <span className="msg-item-time">
                        {msg.date}<br />{msg.time}
                      </span>
                    </div>
                    <div className="msg-item-subject">{msg.subject}</div>
                    <div className="msg-item-preview">{msg.preview}</div>
                    {msg.readBy && (
                      <div className="msg-item-read-info">
                        <CheckIcon /> Lu par: {msg.readBy}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile accordion: detail panel opens inline below the banner */}
                {mobileOpen === msg.id && (
                  <div className="msg-panel msg-detail msg-detail-mobile">
                    <MsgDetailContent
                      selectedMsg={msg}
                      replyText={replyText}
                      setReplyText={setReplyText}
                      handleMarkRead={handleMarkRead}
                      handleSend={handleSend}
                      sending={sending}
                      markingRead={markingRead}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Desktop detail panel */}
        <div className="msg-panel msg-detail msg-detail-desktop">
          {!selectedMsg && pendingTarget ? (
            <div className="msg-empty">
              <EnvelopeIcon />
              <p>Aucune conversation existante avec {pendingTarget.chercheurName}.</p>
              <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: 360, textAlign: 'center' }}>
                Le backend actuel permet a l assistant d ouvrir et repondre aux messages existants, mais pas de creer le premier message depuis cette vue.
              </p>
            </div>
          ) : !selectedMsg ? (
            <div className="msg-empty">
              <EnvelopeIcon />
              <p>{loading ? 'Chargement...' : 'Selectionnez un message pour l afficher'}</p>
            </div>
          ) : (
            <MsgDetailContent
              selectedMsg={selectedMsg}
              replyText={replyText}
              setReplyText={setReplyText}
              handleMarkRead={handleMarkRead}
              handleSend={handleSend}
              sending={sending}
              markingRead={markingRead}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Messagerie;

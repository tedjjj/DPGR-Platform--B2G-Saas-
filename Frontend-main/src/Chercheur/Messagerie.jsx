import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './Messagerie.css';
import { getProfil, getMessagerieMessages, postMessagerieMessage } from '../api/chercheur';

// ── Icons ──
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const MailIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 7L2 7" />
  </svg>
);

const MailOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12l-10-7L2 12" />
    <rect x="2" y="12" width="20" height="10" rx="2" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const initialsFromUser = (user) => {
  const p = user?.prenom?.[0] || '';
  const n = user?.nom?.[0] || '';
  const s = `${p}${n}`.toUpperCase();
  return s || 'CH';
};

const formatMessageDate = (iso, t) => {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    const day = date.getDate();
    const months = [
      t('Janvier'), t('Février'), t('Mars'), t('Avril'), t('Mai'), t('Juin'),
      t('Juillet'), t('Août'), t('Septembre'), t('Octobre'), t('Novembre'), t('Décembre')
    ];
    const timePart = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}, ${timePart}`;
  } catch {
    return String(iso);
  }
};

/** Map API Message + nested reponses → UI thread */
const mapApiMessageToUi = (msg, userInitials, t) => {
  const dateStr = formatMessageDate(msg.date_envoi, t);
  const raw = String(msg.contenu || '').trim();
  const firstLine = raw.split(/\r?\n/)[0] || '';
  const sujet = firstLine.length > 72 ? `${firstLine.slice(0, 72)}…` : (firstLine || t('Message'));

  const conversation = [
    {
      id: `out-${msg.id}`,
      auteur: t('Vous'),
      initiales: userInitials,
      date: dateStr,
      contenu: msg.contenu || '',
      estMoi: true,
    },
    ...(Array.isArray(msg.reponses) ? msg.reponses : []).map((r) => {
      const nomComplet = [r.assistant_prenom, r.assistant_nom].filter(Boolean).join(' ');
      return {
        id: `in-${r.id}`,
        auteur: nomComplet ? `${t('Assistant')} (${nomComplet})` : t('Assistant DPGR'),
        initiales:
          `${(r.assistant_prenom || '')[0] || ''}${(r.assistant_nom || '')[0] || ''}`.toUpperCase() || 'AS',
        date: formatMessageDate(r.date_reponse, t),
        contenu: r.contenu || '',
        estMoi: false,
      };
    }),
  ];

  return {
    id: msg.id,
    sujet,
    date: dateStr,
    statut: msg.est_repondu ? t('Répondu') : t('En attente'),
    lu: Boolean(msg.est_lu),
    conversation,
  };
};

const StatutBadge = ({ statut }) => {
  const { t } = useTranslation();
  const cls =
    statut === t('Répondu') ? 'badge-repondu'
    : statut === t('En attente') ? 'badge-attente'
    : 'badge-repondu';
  return <span className={`msg-badge ${cls}`}>{statut}</span>;
};

const MessageListView = ({ messages, onSelect, onNew, loading }) => {
  const { t } = useTranslation();
  return (
    <div className="msg-list-wrapper">
      <div className="msg-list-header">
        <div>
          <h2 className="msg-list-title">{t("Mes messages")}</h2>
          <p className="msg-list-sub">{t("Communication avec l'équipe DPGR")}</p>
        </div>
        <button type="button" className="btn-nouveau" onClick={onNew} disabled={loading}>
          <PlusIcon /> {t("Nouveau message")}
        </button>
      </div>

      <div className="msg-list">
        {loading && messages.length === 0 ? (
          <p className="msg-hint">{t("Chargement des messages…")}</p>
        ) : null}
        {!loading && messages.length === 0 ? (
          <p className="msg-hint">{t("Aucun message pour le moment. Envoyez un premier message à l'équipe DPGR.")}</p>
        ) : null}
      {messages.map((msg) => (
        <div
          key={msg.id}
          role="button"
          tabIndex={0}
          className={`msg-item ${!msg.lu ? 'msg-item-unread' : ''}`}
          onClick={() => onSelect(msg)}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(msg)}
        >
          <div className="msg-item-icon">
            {msg.lu ? <MailOpenIcon /> : <MailIcon />}
          </div>
          <div className="msg-item-body">
            <div className="msg-item-sujet">{msg.sujet}</div>
            <div className="msg-item-date">{msg.date}</div>
          </div>
          <StatutBadge statut={msg.statut} />
        </div>
      ))}
      </div>
    </div>
  );
};

const MessageDetailView = ({ message, onBack }) => {
  const { t } = useTranslation();
  return (
    <div className="msg-detail-wrapper">
      <div className="msg-detail-header">
        <div className="msg-detail-icon"><MailIcon size={22} /></div>
        <div>
          <div className="msg-detail-sujet">{message.sujet}</div>
          <div className="msg-detail-date">{message.date}</div>
        </div>
        <StatutBadge statut={message.statut} />
      </div>

    <div className="msg-conversation">
      {message.conversation.map((msg) => (
        <div
          key={msg.id}
          className={`msg-bubble-wrap ${msg.estMoi ? 'bubble-right' : 'bubble-left'}`}
        >
          <div className={`msg-avatar ${msg.estMoi ? 'avatar-gold' : 'avatar-navy'}`}>
            {msg.initiales}
          </div>
          <div className="msg-bubble">
            <div className="bubble-author">{msg.auteur}</div>
            <div className="bubble-date">{msg.date}</div>
            <div className="bubble-text">{msg.contenu}</div>
          </div>
        </div>
      ))}



        {message.statut === t('En attente') && (
          <div className="msg-pending-notice">
            {t("En attente de réponse de l'équipe DPGR")}
          </div>
        )}
      </div>
      <div>
      <button type="button" className="btn-retour" onClick={onBack}>
        <ArrowLeftIcon /> {t("Retour aux messages")}
      </button>
      </div>
    </div>
  );
};

const NouveauMessageView = ({ onBack, onSend, sending, error }) => {
  const { t } = useTranslation();
  const [objet, setObjet] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const body = message.trim();
    if (!body) return;
    const subj = objet.trim();
    const contenu = subj ? `${subj}\n\n${body}` : body;
    onSend(contenu);
  };

  return (
    <div className="msg-nouveau-wrapper">
      <div className="msg-nouveau-header">
        <div className="msg-nouveau-icon"><MailIcon size={22} /></div>
        <div>
          <div className="msg-nouveau-title">{t("Nouveau message")}</div>
          <div className="msg-nouveau-sub">{t("Contactez l'équipe DPGR")}</div>
        </div>
      </div>

      {error ? <div className="msg-banner msg-banner--error">{error}</div> : null}

      <div className="msg-nouveau-form">
        <div className="form-field">
          <label className="form-label">{t("Destinataire")}</label>
          <div className="form-input form-input-disabled">{t("Équipe DPGR - Assistants")}</div>
        </div>

        <div className="form-field">
          <label className="form-label">
            {t("Objet")} <span className="form-optional">({t("optionnel")})</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder={t("Ex: Question concernant ma demande de stage")}
            value={objet}
            onChange={(e) => setObjet(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="form-label">
            {t("Message")} <span className="form-required">*</span>
          </label>
          <textarea
            className="form-textarea"
            placeholder={t("Décrivez votre question ou demande en détail...")}
            rows={7}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={4000}
          />
          <div className="form-char-count">{message.length} / 4000 {t("caractères")}</div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-annuler" onClick={onBack} disabled={sending}>
            {t("Annuler")}
          </button>
          <button type="button" className="btn-envoyer" onClick={handleSend} disabled={sending || !message.trim()}>
            <SendIcon /> {sending ? t('Envoi…') : t('Envoyer le message')}
          </button>
        </div>
      </div>
    </div>
  );
};

const Messagerie = ({ setActive: _setActive }) => {
  const { t } = useTranslation();
  const [view, setView] = useState('list');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInitials, setUserInitials] = useState('CH');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadMessages = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const [profil, rawList] = await Promise.all([
        getProfil().catch(() => null),
        getMessagerieMessages(),
      ]);
      if (profil) {
        setUserInitials(initialsFromUser(profil));
      }
      const mapped = rawList.map((m) => mapApiMessageToUi(m, profil ? initialsFromUser(profil) : 'CH', t));
      setMessages(mapped);
    } catch (e) {
      setError(e?.message || t('Impossible de charger la messagerie.'));
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSelect = (msg) => {
    setSelectedMessage(msg);
    setView('detail');
  };

  const handleSend = async (contenu) => {
    setSending(true);
    setError('');
    try {
      await postMessagerieMessage(contenu);
      setView('list');
      await loadMessages();
    } catch (e) {
      setError(e?.message || t("Erreur lors de l'envoi."));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="messagerie-container">
      {error && view === 'list' ? (
        <div className="msg-banner msg-banner--error msg-banner--top">{error}</div>
      ) : null}

      {view === 'list' && (
        <MessageListView
          messages={messages}
          onSelect={handleSelect}
          onNew={() => { setError(''); setView('nouveau'); }}
          loading={loading}
        />
      )}
      {view === 'detail' && selectedMessage && (
        <MessageDetailView
          message={selectedMessage}
          onBack={() => setView('list')}
        />
      )}
      {view === 'nouveau' && (
        <NouveauMessageView
          onBack={() => { setError(''); setView('list'); }}
          onSend={handleSend}
          sending={sending}
          error={error}
        />
      )}
    </div>
  );
};

export default Messagerie;

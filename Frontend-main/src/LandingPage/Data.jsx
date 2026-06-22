const USER_FEEDBACKS_KEY = 'landing-user-feedbacks';

export const saveUserFeedback = (message, meta = {}) => {
  if (typeof window === 'undefined') return;
  const trimmed = String(message || '').trim();
  if (!trimmed) return;

  const entry = {
    id: `usr-${Date.now()}`,
    name: meta.name || '',
    grade: meta.grade || 'Chercheur',
    univ: meta.univ || 'ESI',
    star: meta.star || ' ★ ★ ★ ★ ★',
    message: trimmed,
  };

  try {
    const existing = JSON.parse(localStorage.getItem(USER_FEEDBACKS_KEY) || '[]');
    const safeExisting = Array.isArray(existing) ? existing : [];
    localStorage.setItem(USER_FEEDBACKS_KEY, JSON.stringify([entry, ...safeExisting].slice(0, 20)));
  } catch {
    localStorage.setItem(USER_FEEDBACKS_KEY, JSON.stringify([entry]));
  }
};

export const getLandingFeedbacks = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(USER_FEEDBACKS_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

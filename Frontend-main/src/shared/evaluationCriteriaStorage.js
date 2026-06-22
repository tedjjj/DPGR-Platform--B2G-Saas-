import { authFetch } from '../api/jwtClient';

const STORAGE_KEY = 'evaluation-criteria-config';

export const CRITERIA_RESERVED_WORDS = new Set([
  'if',
  'else',
  'return',
  'true',
  'false',
  'null',
  'undefined',
  'Math',
  'min',
  'max',
  'round',
  'floor',
  'ceil',
  'abs',
  'pow',
  'sqrt',
  'log',
  'exp',
  'sin',
  'cos',
  'tan',
]);

export const extractFormulaVariables = (formula = '') => {
  const matches = String(formula).match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  const unique = [];

  matches.forEach((rawToken) => {
    const token = rawToken.trim();
    if (!token || CRITERIA_RESERVED_WORDS.has(token)) return;
    if (!Number.isNaN(Number(token))) return;
    if (!unique.includes(token)) unique.push(token);
  });

  return unique;
};

export const readEvaluationCriteria = (fallback = []) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const writeEvaluationCriteria = (criteria = []) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(criteria));
  } catch {
    // Ignore storage failures.
  }
};

export const fetchAndCacheEvaluationCriteria = async (sessionId) => {
  try {
    const res = await authFetch(`/parametres/sessions/${sessionId}/criteres/`);
    const data = await res.json();
    const criteria = Array.isArray(data) ? data : (data.results || []);
    writeEvaluationCriteria(criteria);
    return criteria;
  } catch (error) {
    console.error('Error fetching evaluation criteria:', error);
    return [];
  }
};


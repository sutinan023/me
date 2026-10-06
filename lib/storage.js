export const RESULT_KEY = "pte.latestResult.v9";
export const HISTORY_KEY = "pte.history.v9";
export const ANSWERS_KEY = "pte.answers.v9";

export const LEGACY_RESULT = {
  id: "legacy-isfj-2026-10-06",
  type: "ISFJ",
  name: "The Steady Supporter",
  dims: { EI:79, SN:46, TF:56, JP:38 },
  createdAt: "2026-10-06T10:45:00+07:00",
  source: "legacy"
};

export function getLatestResult() {
  if (typeof window === "undefined") return LEGACY_RESULT;
  try {
    return JSON.parse(localStorage.getItem(RESULT_KEY)) || LEGACY_RESULT;
  } catch { return LEGACY_RESULT; }
}

export function saveLatestResult(result) {
  localStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function getHistory() {
  if (typeof window === "undefined") return [];
  try {
    const items = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    if (!items.some(x => x.id === LEGACY_RESULT.id)) {
      items.unshift(LEGACY_RESULT);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    }
    return items;
  } catch { return [LEGACY_RESULT]; }
}

export function addHistory(result) {
  const items = getHistory();
  const fingerprint = `${result.type}-${result.dims.EI}-${result.dims.SN}-${result.dims.TF}-${result.dims.JP}`;
  const last = items[items.length - 1];
  const lastFp = last ? `${last.type}-${last.dims.EI}-${last.dims.SN}-${last.dims.TF}-${last.dims.JP}` : "";
  if (fingerprint !== lastFp) items.push(result);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

export function saveAnswers(answers) {
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
}

export function getAnswers(count) {
  try {
    const a = JSON.parse(localStorage.getItem(ANSWERS_KEY));
    return Array.isArray(a) && a.length === count ? a : Array(count).fill(null);
  } catch { return Array(count).fill(null); }
}

export function clearAnswers() {
  localStorage.removeItem(ANSWERS_KEY);
}

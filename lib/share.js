export function isValidResult(result) {
  return /^[EI][SN][TF][JP]$/.test(result?.type || '') &&
    ['EI', 'SN', 'TF', 'JP'].every(key =>
      Number.isFinite(result?.dims?.[key]) && result.dims[key] >= 0 && result.dims[key] <= 100);
}

export function encodeLocalShare(result) {
  if (!isValidResult(result)) throw new Error('ข้อมูลผลลัพธ์ไม่ถูกต้อง');
  const payload = { v:1, type:result.type, ei:result.dims.EI, sn:result.dims.SN, tf:result.dims.TF, jp:result.dims.JP };
  const text = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(text))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

export function decodeLocalShare(token) {
  try {
    if (typeof token !== 'string' || token.length > 1000 || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
    let s = token.replace(/-/g,"+").replace(/_/g,"/");
    while (s.length % 4) s += "=";
    const payload = JSON.parse(decodeURIComponent(escape(atob(s))));
    if (payload.v !== 1) return null;
    const result = { type: payload.type, dims:{ EI:payload.ei, SN:payload.sn, TF:payload.tf, JP:payload.jp } };
    return isValidResult(result) ? result : null;
  } catch { return null; }
}

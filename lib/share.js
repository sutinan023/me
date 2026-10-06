export function encodeLocalShare(result) {
  const payload = { v:1, type:result.type, ei:result.dims.EI, sn:result.dims.SN, tf:result.dims.TF, jp:result.dims.JP };
  const text = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(text))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

export function decodeLocalShare(token) {
  try {
    let s = token.replace(/-/g,"+").replace(/_/g,"/");
    while (s.length % 4) s += "=";
    const payload = JSON.parse(decodeURIComponent(escape(atob(s))));
    if (payload.v !== 1) return null;
    return { type: payload.type, dims:{ EI:payload.ei, SN:payload.sn, TF:payload.tf, JP:payload.jp } };
  } catch { return null; }
}

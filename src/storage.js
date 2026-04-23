// ═══════════════════════════════════════════════════════════
// STORAGE LAYER
// Compatible with the window.storage API used in the original artifact.
// Backed by localStorage, with optional Apps Script sync for multi-device.
// ═══════════════════════════════════════════════════════════

const LS_PREFIX = "timelab:";

// Apps Script endpoint — set in Settings, persisted in localStorage
const GAS_CONFIG_KEY = "timelab:config:gas_url";
const GAS_TOKEN_KEY = "timelab:config:gas_token";

export const getGasConfig = () => ({
  url: localStorage.getItem(GAS_CONFIG_KEY) || "",
  token: localStorage.getItem(GAS_TOKEN_KEY) || "",
});

export const setGasConfig = ({ url, token }) => {
  if (url !== undefined) localStorage.setItem(GAS_CONFIG_KEY, url);
  if (token !== undefined) localStorage.setItem(GAS_TOKEN_KEY, token);
};

// ─── Core storage (drop-in replacement for window.storage) ──────────
class LocalStorage {
  async get(key, shared = false) {
    try {
      const v = localStorage.getItem(key);
      if (v === null) return null;
      return { key, value: v, shared };
    } catch (e) {
      throw new Error(`get failed: ${e.message}`);
    }
  }

  async set(key, value, shared = false) {
    try {
      localStorage.setItem(key, value);
      return { key, value, shared };
    } catch (e) {
      // Quota exceeded is the most common error
      if (e.name === "QuotaExceededError" || e.code === 22) {
        throw new Error("storage_quota_exceeded");
      }
      throw e;
    }
  }

  async delete(key, shared = false) {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true, shared };
    } catch (e) {
      throw new Error(`delete failed: ${e.message}`);
    }
  }

  async list(prefix = "", shared = false) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    return { keys, prefix, shared };
  }
}

// Install as window.storage so the rest of the app works unchanged
if (typeof window !== "undefined" && !window.storage) {
  window.storage = new LocalStorage();
}

// ─── Apps Script sync layer ─────────────────────────────────────────
// The Apps Script exposes two endpoints via POST:
//   { action: "pull", token } → returns full state
//   { action: "push", token, payload } → upserts state
//   { action: "upload_photo", token, watchId, photoId, dataUrl } → stores in Drive, returns URL
//   { action: "delete_photo", token, watchId, photoId }
//   { action: "ping", token } → returns {ok: true}

const callGas = async (action, extra = {}) => {
  const { url, token } = getGasConfig();
  if (!url) throw new Error("gas_not_configured");
  const body = JSON.stringify({ action, token, ...extra });
  const res = await fetch(url, {
    method: "POST",
    // Apps Script requires text/plain to avoid CORS preflight
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body,
  });
  if (!res.ok) throw new Error(`gas_http_${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
};

export const pingGas = async () => {
  try {
    const r = await callGas("ping");
    return { ok: true, ...r };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

export const pullFromGas = async () => {
  const data = await callGas("pull");
  return data.state || null;
};

// Pull con sync previo: lee Excel madre, sobreescribe Sheet CRM y devuelve estado
export const pullWithSyncFromGas = async () => {
  const data = await callGas("pull_with_sync");
  return data.state || null;
};

// Solo dispara el sync desde Excel madre (sin devolver estado)
export const syncFromMasterGas = async () => {
  return await callGas("sync_from_master");
};

export const pushToGas = async (payload) => {
  return await callGas("push", { payload });
};

export const uploadPhotoToGas = async (watchId, photoId, dataUrl) => {
  const r = await callGas("upload_photo", { watchId, photoId, dataUrl });
  return r.url || null;
};

export const deletePhotoFromGas = async (watchId, photoId) => {
  return await callGas("delete_photo", { watchId, photoId });
};

// ─── Invoice system (v10) ───────────────────────────────────────────
export const invoicePreviewGas = async (params) => {
  return await callGas("invoice_preview", { params });
};

export const invoiceGenerateGas = async (params) => {
  return await callGas("invoice_generate", { params });
};

export const listPendingInvoicesGas = async () => {
  return await callGas("invoice_pending_list");
};

// ─── Sync queue (operations to retry if offline) ────────────────────
const QUEUE_KEY = "timelab:sync:queue";

export const queueOp = (op) => {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  queue.push({ ...op, ts: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const drainQueue = async () => {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  if (queue.length === 0) return { drained: 0 };
  const remaining = [];
  let drained = 0;
  for (const op of queue) {
    try {
      if (op.type === "photo_upload") {
        await uploadPhotoToGas(op.watchId, op.photoId, op.dataUrl);
      } else if (op.type === "photo_delete") {
        await deletePhotoFromGas(op.watchId, op.photoId);
      }
      drained++;
    } catch {
      remaining.push(op);
    }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { drained, remaining: remaining.length };
};

// ─── Last sync timestamp ────────────────────────────────────────────
export const getLastSync = () => {
  const v = localStorage.getItem("timelab:sync:last");
  return v ? new Date(v) : null;
};

export const setLastSync = (date = new Date()) => {
  localStorage.setItem("timelab:sync:last", date.toISOString());
};

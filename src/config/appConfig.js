const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const rawAdminPortalUrl = import.meta.env.VITE_ADMIN_PORTAL_URL || "http://localhost:3001/admin";

export const API_BASE_URL = trimTrailingSlash(rawApiBaseUrl);
export const API_PREFIX = "/api/v1";
export const API_ROOT = `${API_BASE_URL}${API_PREFIX}`;

// TODO: Move to deployment env configuration when environments are finalized.
export const ADMIN_PORTAL_URL = rawAdminPortalUrl;


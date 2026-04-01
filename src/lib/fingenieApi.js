import { API_ROOT } from "../config/appConfig";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

const parseJsonIfPresent = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return response.json();
};

const buildUrl = (path, query) => {
  const url = new URL(`${API_ROOT}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

const request = async (path, { method = "GET", token, body, query } = {}) => {
  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      ...DEFAULT_HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await parseJsonIfPresent(response);
  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
};

export const fingenieApi = {
  loginUser: ({ email, password }) =>
    request("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  loginAdmin: ({ email, password }) =>
    request("/admin/login", {
      method: "POST",
      body: { email, password },
    }),

  getProfileComplete: (token) => request("/profile/complete", { token }),
  getEntitlements: (token) => request("/entitlements/me", { token }),
  getPlans: (token) => request("/billing/plans", { token }),
  createCheckout: ({ token, planCode }) =>
    request("/billing/checkout", {
      method: "POST",
      token,
      body: {
        planCode,
        gateway: "PAYOS",
      },
    }),

  getMyReview: (token) => request("/reviews/me", { token }),
  createMyReview: ({ token, rating, title, comment }) =>
    request("/reviews", {
      method: "POST",
      token,
      body: { rating, title, comment },
    }),
  updateMyReview: ({ token, rating, title, comment }) =>
    request("/reviews/me", {
      method: "PUT",
      token,
      body: { rating, title, comment },
    }),

  getPublicReviews: (limit = 12) =>
    request("/reviews/public", {
      query: { limit },
    }),
};


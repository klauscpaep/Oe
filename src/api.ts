const API_BASE = ""; // Relative paths will hit Express on port 3000

export function getAuthToken(): string | null {
  return localStorage.getItem("vidi_token");
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem("vidi_token", token);
  } else {
    localStorage.removeItem("vidi_token");
  }
}

async function request(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.error || "Bir hata oluştu.") as any;
    if (data.banned) {
      err.banned = data.banned;
      err.userId = data.userId;
      err.username = data.username;
      err.email = data.email;
      err.reason = data.reason;
    }
    throw err;
  }

  return data;
}

export const api = {
  // Database Setup / Reset
  install: () => request("/api/install", { method: "POST" }),
  health: () => fetch("/api/health").then(r => r.json()),

  // Auth
  register: (payload: any) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: any) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/api/auth/me"),
  updateProfile: (payload: any) => request("/api/profile/update", { method: "POST", body: JSON.stringify(payload) }),
  deleteAccount: () => request("/api/profile/delete", { method: "POST" }),
  toggle2FA: () => request("/api/auth/2fa/toggle", { method: "POST" }),
  regenerateApiKey: () => request("/api/api-key/regenerate", { method: "POST" }),
  submitBanAppeal: (payload: { userId: string; username: string; email: string; reason: string; appealMessage: string }) => 
    request("/api/auth/ban-appeal", { method: "POST", body: JSON.stringify(payload) }),

  // Video / Audio Downloader
  getVideoInfo: (url: string, platform?: string) => request("/api/video/info", { method: "POST", body: JSON.stringify({ url, platform }) }),
  startDownload: (payload: { title: string; url: string; format: string; quality: string; userId: string | null; platform: string }) => 
    request("/api/video/download", { method: "POST", body: JSON.stringify(payload) }),
  getDownloadHistory: () => request("/api/profile/downloads"),

  // Blog
  getBlog: () => request("/api/blog"),

  // Announcements
  getAnnouncements: () => request("/api/announcements"),

  // Tickets
  getTickets: () => request("/api/tickets"),
  createTicket: (payload: { subject: string; message: string }) => request("/api/tickets", { method: "POST", body: JSON.stringify(payload) }),
  replyTicket: (id: string, message: string) => request(`/api/tickets/${id}/reply`, { method: "POST", body: JSON.stringify({ message }) }),

  // Premium
  getSettings: () => request("/api/settings"),
  activatePremium: (plan: "premium" | "vip", cardDetails?: { cardName: string; cardNumber: string; cardExpiry: string; cvv: string }) => 
    request("/api/premium/activate", { method: "POST", body: JSON.stringify({ plan, ...cardDetails }) }),

  // Admin APIs
  admin: {
    getDashboard: () => request("/api/admin/dashboard"),
    getUsers: () => request("/api/admin/users"),
    getAnnouncements: () => request("/api/admin/announcements"),
    getTickets: () => request("/api/admin/tickets"),
    updateTicketStatus: (id: string, status: "open" | "answered" | "closed") => 
      request(`/api/admin/tickets/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
    deleteTicket: (id: string) => request(`/api/admin/tickets/${id}`, { method: "DELETE" }),
    userAction: (userId: string, payload: { action: string; reason?: string; plan?: string }) => 
      request(`/api/admin/users/${userId}/action`, { method: "POST", body: JSON.stringify(payload) }),
    createBlog: (payload: any) => request("/api/admin/blog", { method: "POST", body: JSON.stringify(payload) }),
    deleteBlog: (id: string) => request(`/api/admin/blog/${id}`, { method: "DELETE" }),
    createAnnouncement: (payload: any) => request("/api/admin/announcements", { method: "POST", body: JSON.stringify(payload) }),
    deleteAnnouncement: (id: string) => request(`/api/admin/announcements/${id}`, { method: "DELETE" }),
    saveSettings: (settings: { key: string; value: string }[]) => request("/api/admin/settings", { method: "POST", body: JSON.stringify({ settings }) }),
    clearCache: () => request("/api/admin/clear-cache", { method: "POST" }),
    clearLogs: () => request("/api/admin/clear-logs", { method: "POST" }),
    getBanAppeals: () => request("/api/admin/ban-appeals"),
    actionBanAppeal: (id: string, action: "approve" | "reject") => 
      request(`/api/admin/ban-appeals/${id}/action`, { method: "POST", body: JSON.stringify({ action }) })
  }
};

export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "banned";
  avatar: string;
  apiKey?: string;
  premiumStatus: "free" | "premium" | "vip";
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface Download {
  id: string;
  userId: string | null;
  title: string;
  url: string;
  format: string;
  quality: string;
  size: string;
  status: "pending" | "converting" | "ready" | "failed";
  platform: string;
  downloadUrl?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "banner" | "popup" | "normal";
  status: "active" | "draft";
  isPinned: boolean;
  createdAt: string;
}

export interface TicketReply {
  id: string;
  senderRole: "user" | "admin";
  senderName: string;
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: "open" | "answered" | "closed";
  replies: TicketReply[];
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  image: string;
  categoryId: string;
  views: number;
  readTime: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface SystemStats {
  totalDownloads: number;
  totalUsers: number;
  premiumUsers: number;
  openTickets: number;
  hardware: {
    cpuUsage: number;
    ramUsage: number;
    diskUsage: number;
  };
}

export interface CountryStat {
  name: string;
  count: number;
  percentage: number;
}

export interface DeviceStat {
  name: string;
  count: number;
  percentage: number;
}

export interface BrowserStat {
  name: string;
  count: number;
  percentage: number;
}

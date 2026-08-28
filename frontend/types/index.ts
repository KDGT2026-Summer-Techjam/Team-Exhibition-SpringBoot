export type User = {
  id: string;
  username: string;
  email: string;
};

export type ItinerarySummary = {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  isOwner: boolean;
};

export type ShioriDay = {
  id: string;
  dayNumber: number;
  tripDate: string;
  title?: string;
  notes?: string;
  estimatedCost?: number;
  representativePhotoId?: string;
  isEditable?: boolean;
  isCommentOpen?: boolean;
};

export type RoadmapItem = {
  id: string;
  dayId: string;
  startsAt: string;
  endsAt?: string;
  title: string;
  amount?: number;
};

export type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  targetType: "shiori" | "shiori_day" | "roadmap_item" | "photo";
  targetId: string;
  targetField?: string;
  createdAt: string;
};

export type Photo = {
  id: string;
  dayId: string;
  dayNumber: number;
  userId: string;
  userName: string;
  imageUrl: string;
  isDeleted: boolean;
  likeCount: number;
  createdAt: string;
};

export type Member = {
  userId: string;
  username: string;
  role: "owner" | "member";
  status: "active" | "left" | "banned";
  joinedAt: string;
};

export type PackingContribution = {
  userId: string;
  userName: string;
  /** 1以上 */
  quantity: number;
};

export type PackingItem = {
  id: string;
  label: string;
  /** 1以上。デフォルト 1 */
  requiredCount: number;
  contributions: PackingContribution[];
};

export type ItineraryDetail = {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isEditable: boolean;
  isCommentOpen: boolean;
  promises?: string;
  packingItems: PackingItem[];
  ownerId: string;
  isOwner: boolean;
  days: ShioriDay[];
  roadmapItems: RoadmapItem[];
  comments: Comment[];
};

export type Invitation = {
  code: string;
  shioriTitle: string;
  /** 招待リンクを発行したユーザーの表示名（API 未提供時は省略） */
  inviterName?: string;
  message?: string;
  status: "pending" | "accepted" | "expired";
};

export type Severity = "petty" | "light" | "medium" | "heavy";

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type GuideCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type Rule = {
  id: string;
  category_id: string | null;
  code: string;
  title: string;
  body: string;
  severity: Severity;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Guide = {
  id: string;
  category_id: string | null;
  title: string;
  body: string;
  sort_order: number;
};

export type AdminRole = "owner" | "editor";

export type AdminUser = {
  user_id: string;
  email: string;
  display_name: string | null;
  role: AdminRole;
  created_at: string;
};
export type Severity = "normal" | "warning" | "severe";

export type Category = {
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
  title: string;
  body: string;
  sort_order: number;
};

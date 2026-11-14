export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  sort: number;
};

export type Publisher = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
};

export type Author = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  photo_url: string | null;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sku: string | null;
  isbn: string | null;
  pages: number | null;
  binding: string | null;
  year: number | null;
  translator: string | null;
  dimensions: string | null;
  cover_url: string | null;
  images: string[];
  category_id: string | null;
  publisher_id: string | null;
  author_id: string | null;
  is_set: boolean;
  is_featured: boolean;
  is_new: boolean;
  active: boolean;
  created_at: string;
  author?: Pick<Author, "name" | "slug"> | null;
  publisher?: Pick<Publisher, "name" | "slug"> | null;
  category?: Pick<Category, "name" | "slug"> | null;
};

export type OrderStatus = "nova" | "potvrdjena" | "poslana" | "isporucena" | "otkazana";

export type Order = {
  id: string;
  number: number;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  note: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  /** Currency the order is charged in (amounts on the order and its items are in it). */
  currency: "RSD" | "EUR";
  payment_method: string;
  status: OrderStatus;
  tracking_number: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  title: string;
  price: number;
  quantity: number;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  is_admin: boolean;
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  nova: "Nova",
  potvrdjena: "Potvrđena",
  poslana: "Poslana",
  isporucena: "Isporučena",
  otkazana: "Otkazana",
};

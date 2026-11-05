import { createClient } from "@supabase/supabase-js";
export const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )
    : null;
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  size: string | null;
  status: "Disponible" | "Reservado" | "Vendido";
  images: string[];
  created_at: string;
};

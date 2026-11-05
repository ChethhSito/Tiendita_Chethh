import type { Product } from "./supabase";

// Datos ficticios para visualizar el catálogo. Eliminar al conectar Supabase.
export const mockProducts: Product[] = [
  { id: "demo-1", name: "Audífonos inalámbricos", description: "Audífonos de ejemplo en buen estado, con estuche de carga.", price: 95, category: "Tecnología", condition: "Buen estado", size: null, status: "Disponible", images: [], created_at: "2026-11-05T12:00:00Z" },
  { id: "demo-2", name: "Zapatillas urbanas", description: "Par de muestra para visualizar cómo se presenta una publicación.", price: 120, category: "Zapatillas", condition: "Poco uso", size: "38", status: "Disponible", images: [], created_at: "2026-11-04T12:00:00Z" },
  { id: "demo-3", name: "Casaca de jean", description: "Prenda de ejemplo para probar el catálogo y sus filtros.", price: 70, category: "Ropa", condition: "Buen estado", size: "M", status: "Reservado", images: [], created_at: "2026-11-03T12:00:00Z" },
  { id: "demo-4", name: "Reloj de pulsera", description: "Accesorio ficticio para la vista de demostración.", price: 55, category: "Accesorios", condition: "Buen estado", size: null, status: "Disponible", images: [], created_at: "2026-11-02T12:00:00Z" },
  { id: "demo-5", name: "Teclado compacto", description: "Producto ficticio para probar una ficha vendida.", price: 80, category: "Tecnología", condition: "Buen estado", size: null, status: "Vendido", images: [], created_at: "2026-11-01T12:00:00Z" },
  { id: "demo-6", name: "Mochila pequeña", description: "Accesorio de muestra. Precio y descripción inventados.", price: 45, category: "Accesorios", condition: "Poco uso", size: null, status: "Disponible", images: [], created_at: "2026-10-31T12:00:00Z" },
];

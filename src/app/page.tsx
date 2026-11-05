"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search, X, Pencil, LogOut } from "lucide-react";
import { supabase, Product } from "@/lib/supabase";
import { mockProducts } from "@/lib/mock-products";
import Link from "next/link";
const categories = ["Todo", "Tecnología", "Ropa", "Zapatillas", "Accesorios"];
const empty = {
  name: "",
  description: "",
  price: "",
  category: "Tecnología",
  condition: "Buen estado",
  size: "",
  status: "Disponible",
  images: [] as string[],
};
const price = (n: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(n);
const whatsapp = (name: string) =>
  `https://wa.me/51${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "926907632"}?text=${encodeURIComponent(`Hola, vi ${name} en La Tiendita de Chethh. ¿Sigue disponible?`)}`;
export default function Home() {
  const [items, setItems] = useState<Product[]>([]),
    [loading, setLoading] = useState(true),
    [category, setCategory] = useState("Todo"),
    [status, setStatus] = useState("Todos"),
    [query, setQuery] = useState(""),
    [sort, setSort] = useState("recent"),
    [selected, setSelected] = useState<Product | null>(null),
    [admin, setAdmin] = useState(false),
    [signed, setSigned] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [form, setForm] = useState(empty),
    [editing, setEditing] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function load() {
    if (!supabase) {
      setItems(mockProducts);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    else setItems(data as Product[]);
    setLoading(false);
  }
  useEffect(() => {
    load();
    supabase?.auth.getSession().then(({ data }) => setSigned(!!data.session));
    const sub = supabase?.auth.onAuthStateChange((_e, s) => setSigned(!!s));
    return () => sub?.data.subscription.unsubscribe();
  }, []);
  const shown = useMemo(
    () =>
      items
        .filter(
          (p) =>
            (category === "Todo" || p.category === category) &&
            (status === "Todos" || p.status === status) &&
            `${p.name} ${p.description}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "low"
            ? a.price - b.price
            : sort === "high"
              ? b.price - a.price
              : a.status === "Vendido" && b.status !== "Vendido"
                ? 1
                : b.status === "Vendido" && a.status !== "Vendido"
                  ? -1
                  : new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
        ),
    [items, category, status, query, sort],
  );
  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    setMessage(
      error ? "Revisa el correo y la contraseña." : "Sesión iniciada.",
    );
  }
  async function upload(files: FileList | null) {
    if (!files?.length || !supabase) return;
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw Error("Inicia sesión.");
      const urls = await Promise.all(
        Array.from(files).map(async (file) => {
          const r = await fetch("/api/cloudinary-sign", {
            headers: { Authorization: `Bearer ${data.session!.access_token}` },
          });
          if (!r.ok) throw Error("No se pudo autorizar la foto.");
          const p = await r.json();
          const body = new FormData();
          body.append("file", file);
          for (const k of ["api_key", "timestamp", "signature", "folder"])
            body.append(k, String(p[k === "api_key" ? "apiKey" : k]));
          const up = await fetch(
            `https://api.cloudinary.com/v1_1/${p.cloudName}/image/upload`,
            { method: "POST", body },
          );
          if (!up.ok) throw Error("No se pudo subir la foto.");
          return (await up.json()).secure_url as string;
        }),
      );
      setForm((v) => ({ ...v, images: [...v.images, ...urls] }));
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      condition: form.condition,
      size: form.size || null,
      status: form.status,
      images: form.images,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing)
      : await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setForm(empty);
    setEditing(null);
    setMessage("Producto guardado.");
    load();
  }
  function edit(p: Product) {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      condition: p.condition,
      size: p.size || "",
      status: p.status,
      images: p.images || [],
    });
    setEditing(p.id);
    window.scrollTo(0, 0);
  }
  return (
    <>
      <div className="announcement">
        Objetos con historia, listos para una nueva.
      </div>
      <header>
        <div className="shell nav">
          <button className="logo" onClick={() => setAdmin(false)}>
            la tiendita <span>de chethh</span>
          </button>
          <nav>
            <button
              onClick={() => {
                setAdmin(false);
                setTimeout(
                  () =>
                    document
                      .getElementById("catalogo")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  50,
                );
              }}
            >
              Explorar productos
            </button>
            <a href={whatsapp("un producto")} target="_blank">
              Escríbeme ↗
            </a>
          </nav>
        </div>
      </header>
      {admin ? (
        <main className="shell admin">
          <div className="section-head">
            <div>
              <small>MI ESPACIO</small>
              <h1>Administrar productos</h1>
            </div>
            <button onClick={() => setAdmin(false)}>Volver al catálogo</button>
          </div>
          {!supabase ? (
            <p>Configura Supabase para activar el panel.</p>
          ) : !signed ? (
            <form className="panel login" onSubmit={login}>
              <h2>Ingresar</h2>
              <label>
                Correo
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                Contraseña
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button className="primary" disabled={busy}>
                Entrar
              </button>
            </form>
          ) : (
            <div className="admin-grid">
              <form className="panel form" onSubmit={save}>
                <h2>{editing ? "Editar producto" : "Nuevo producto"}</h2>
                <label>
                  Nombre
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>
                <label>
                  Descripción
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </label>
                <div className="fields">
                  <label>
                    Precio (S/)
                    <input
                      type="number"
                      min="0"
                      step=".01"
                      required
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Categoría
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      {categories.slice(1).map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="fields">
                  <label>
                    Estado de uso
                    <input
                      value={form.condition}
                      onChange={(e) =>
                        setForm({ ...form, condition: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Talla
                    <input
                      value={form.size}
                      onChange={(e) =>
                        setForm({ ...form, size: e.target.value })
                      }
                    />
                  </label>
                </div>
                <label>
                  Disponibilidad
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    {["Disponible", "Reservado", "Vendido"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="upload">
                  + Añadir fotos
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={busy}
                    onChange={(e) => upload(e.target.files)}
                  />
                </label>
                <div className="uploaded">
                  {form.images.map((url) => (
                    <div key={url}>
                      <img src={url} alt="Foto subida" />
                      <button
                        type="button"
                        aria-label="Quitar foto"
                        onClick={() =>
                          setForm({
                            ...form,
                            images: form.images.filter((x) => x !== url),
                          })
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button className="primary" disabled={busy}>
                  {busy
                    ? "Procesando..."
                    : editing
                      ? "Guardar cambios"
                      : "Publicar producto"}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setForm(empty);
                    }}
                  >
                    Cancelar edición
                  </button>
                )}
              </form>
              <div className="panel list">
                <div className="list-title">
                  <h2>Publicaciones ({items.length})</h2>
                  <button
                    title="Cerrar sesión"
                    onClick={() => supabase?.auth.signOut()}
                  >
                    <LogOut size={18} />
                  </button>
                </div>
                {items.map((p) => (
                  <div className="list-item" key={p.id}>
                    <div className="thumb">
                      {p.images?.[0] && <img src={p.images[0]} alt="" />}
                    </div>
                    <div>
                      <b>{p.name}</b>
                      <small>
                        {price(p.price)} · {p.status}
                      </small>
                    </div>
                    <button
                      aria-label={`Editar ${p.name}`}
                      onClick={() => edit(p)}
                    >
                      <Pencil size={17} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {message && <p role="status">{message}</p>}
        </main>
      ) : (
        <>
          <main>
            <section className="shell catalog" id="catalogo"><div className="catalog-intro"><p>Una tiendita de cosas que todavía tienen mucho por dar.</p><Link href="/sobre-mi">Conoce la historia de la tiendita ↗</Link></div>
              <div className="section-head">
                <div>
                  <small>EL CATÁLOGO</small>
                  <h2>Lo que hay en la tiendita</h2>
                </div>
                <p>
                  Explora con calma. Si algo te gusta, conversemos por WhatsApp.
                </p>
              </div>
              <div className="tabs">
                {categories.map((c) => (
                  <button
                    className={category === c ? "active" : ""}
                    key={c}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="tools">
                <label>
                  <Search size={18} />
                  <input
                    placeholder="Buscar algo especial..."
                    aria-label="Buscar productos"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Disponibilidad"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {["Todos", "Disponible", "Reservado", "Vendido"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  aria-label="Orden"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="recent">Más recientes</option>
                  <option value="low">Menor precio</option>
                  <option value="high">Mayor precio</option>
                </select>
              </div>
              {!supabase && <p className="demo-banner">Vista de demostración · Los productos y precios son ficticios.</p>}
              <p className="count">
                {shown.length} {shown.length === 1 ? "producto" : "productos"}
              </p>
              {loading ? (
                <div className="empty">Cargando...</div>
              ) : shown.length ? (
                <div className="grid">
                  {shown.map((p) => (
                    <button
                      className="card"
                      key={p.id}
                      onClick={() => setSelected(p)}
                    >
                      <div className="card-img">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} />
                        ) : (
                          <span>Sin foto</span>
                        )}
                        <span className={`badge ${p.status.toLowerCase()}`}>
                          {p.status}
                        </span>
                      </div>
                      <div className="card-meta">
                        {p.category}
                        <ArrowUpRight size={17} />
                      </div>
                      <h3>{p.name}</h3>
                      <b>{price(p.price)}</b>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <span>Sin foto</span>
                  <h3>
                    {items.length
                      ? "No encontramos coincidencias"
                      : "Pronto habrá cositas por aquí"}
                  </h3>
                  <p>
                    {items.length
                      ? "Prueba otra búsqueda o cambia los filtros."
                      : "Estamos preparando los primeros productos."}
                  </p>
                  {items.length > 0 && (
                    <button
                      onClick={() => {
                        setQuery("");
                        setCategory("Todo");
                        setStatus("Todos");
                      }}
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              )}
            </section>
            <section className="contact">
              <div className="shell contact-inner">
                <div>
                  <small>¿ALGO LLAMÓ TU ATENCIÓN?</small>
                  <h2>
                    Conversemos
                    <br />
                    por WhatsApp.
                  </h2>
                </div>
                <a href={whatsapp("un producto")} target="_blank">
                  Escríbeme <ArrowUpRight />
                </a>
              </div>
            </section>
          </main>
          <footer className="shell">
            <b>la tiendita de chethh</b>
            <span>Con cariño, Chethh.</span>
            <button onClick={() => setAdmin(true)}>Administrar</button>
          </footer>
        </>
      )}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              aria-label="Cerrar"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>
            <div className="gallery">
              {selected.images?.length ? (
                selected.images.map((url, i) => (
                  <img
                    src={url}
                    key={url}
                    alt={`${selected.name}, foto ${i + 1}`}
                  />
                ))
              ) : (
                <div>Sin foto</div>
              )}
            </div>
            <div className="detail">
              <span className={`badge ${selected.status.toLowerCase()}`}>
                {selected.status}
              </span>
              <small>{selected.category}</small>
              <h2>{selected.name}</h2>
              <strong>{price(selected.price)}</strong>
              <p>{selected.description}</p>
              <dl>
                <dt>Estado</dt>
                <dd>{selected.condition}</dd>
                {selected.size && (
                  <>
                    <dt>Talla</dt>
                    <dd>{selected.size}</dd>
                  </>
                )}
              </dl>
              {selected.status !== "Vendido" && !!supabase && (
                <a
                  className="primary"
                  href={whatsapp(selected.name)}
                  target="_blank"
                >
                  Consultar por WhatsApp ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



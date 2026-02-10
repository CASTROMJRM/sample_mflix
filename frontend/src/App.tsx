import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const limit = 12;

  async function cargar() {
    try {
      setCargando(true);
      setError("");

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (q.trim()) params.set("q", q.trim());

      const res = await fetch(`${API_URL}/api/movies?${params.toString()}`);
      if (!res.ok) throw new Error("Falló la petición");

      const data = await res.json();
      setMovies(data.movies);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError("No se pudieron cargar los datos. Revisa backend y URI.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function buscar(e) {
    e.preventDefault();
    setPage(1);
    // carga inmediata con page=1
    setTimeout(cargar, 0);
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Películas — sample_mflix</h1>

      <form onSubmit={buscar} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por título (ej. batman)"
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
        />
        <button style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}>
          Buscar
        </button>
      </form>

      {error && (
        <div style={{ background: "#fee2e2", padding: 12, borderRadius: 12, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {movies.map((m) => (
            <div
              key={m._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                overflow: "hidden",
                background: "black",
              }}
            >
              <div style={{ height: 220, background: "#f3f4f6" }}>
                {m.poster ? (
                  <img
                    src={m.poster}
                    alt={m.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : null}
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 800 }}>{m.title}</div>
                <div style={{ color: "#6b7280", marginTop: 4 }}>
                  {m.year ?? "—"} • {m.rated ?? "NR"} • {m.runtime ? `${m.runtime} min` : "—"}
                </div>
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  {(m.genres || []).slice(0, 3).join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 18 }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}
        >
          Anterior
        </button>

        <div>
          Página <b>{page}</b> de <b>{totalPages}</b>
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import "./App.css";

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
    setTimeout(cargar, 0);
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Películas</h1>
        
        <form onSubmit={buscar} className="search-container">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título (ej. batman)"
            className="search-input"
          />
          <button type="submit" className="search-button">
            Buscar
          </button>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </header>

      <main style={{ padding: "0 4vw" }}>
        {cargando ? (
          <div className="loading-message">Cargando películas...</div>
        ) : movies.length === 0 && !cargando ? (
          <div className="loading-message" style={{ color: '#888' }}>
            No se encontraron películas
          </div>
        ) : (
          <div className="movies-grid">
            {movies.map((m) => (
              <div key={m._id} className="movie-card">
                <div className="movie-poster-container">
                  {m.poster ? (
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="movie-poster"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement.innerHTML = 
                          '<div class="poster-placeholder">Sin Imagen</div>';
                      }}
                    />
                  ) : (
                    <div className="poster-placeholder">Sin Imagen</div>
                  )}
                </div>

                <div className="movie-info">
                  <h3 className="movie-title">{m.title}</h3>
                  <div className="movie-meta">
                    <span>{m.year ?? "—"}</span>
                    <span className="meta-separator">•</span>
                    <span>{m.rated ?? "NR"}</span>
                    <span className="meta-separator">•</span>
                    <span>{m.runtime ? `${m.runtime} min` : "—"}</span>
                  </div>
                  <div className="movie-genres">
                    {(m.genres || []).slice(0, 3).join(" • ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pagination-container">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="pagination-button"
          >
            Anterior
          </button>

          <div className="pagination-info">
            Página <b>{page}</b> de <b>{totalPages}</b>
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="pagination-button"
          >
            Siguiente
          </button>
        </div>
      </main>
    </div>
  );
}
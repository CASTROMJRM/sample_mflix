import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:4000";

function renderStars(stars) {
  if (typeof stars !== "number") return "";
  const fullStars = Math.round(stars);
  return "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}


export default function App() {
  const [movies, setMovies] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetail, setMovieDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

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
    } catch {
      setError("No se pudieron cargar los datos. Revisa backend y URI.");
    } finally {
      setCargando(false);
    }
  }

    async function abrirDetalle(movie) {
    setSelectedMovie(movie);
    setMovieDetail(null);
    setDetailError("");

    try {
      setDetailLoading(true);
      const res = await fetch(`${API_URL}/api/movies/${movie._id}`);
      if (!res.ok) throw new Error("No se pudo cargar el detalle");
      const data = await res.json();
      setMovieDetail(data);
    } catch {
      setDetailError("No se pudo cargar la información completa de esta película.");
    } finally {
      setDetailLoading(false);
    }
  }

  function cerrarDetalle() {
    setSelectedMovie(null);
    setMovieDetail(null);
    setDetailError("");
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

  const detail = movieDetail || selectedMovie;

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

        {error && <div className="error-message">{error}</div>}
      </header>

      <main style={{ padding: "0 4vw" }}>
        {cargando ? (
          <div className="loading-message">Cargando películas...</div>
        ) : movies.length === 0 ? (
          <div className="loading-message" style={{ color: "#888" }}>
            No se encontraron películas
          </div>
        ) : (
          <div className="movies-grid">
            {movies.map((m) => (

             <button
                key={m._id}
                className="movie-card"
                type="button"
                onClick={() => abrirDetalle(m)}
              >
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
                    {m.ratingInfo?.hasComments && (
                    <div className="movie-stars" title="Calificación por comentarios">
                      {renderStars(m.ratingInfo.stars)}
                    </div>
                  )}
                </div>
                  </div>
                </button>
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
          {selectedMovie && (
        <div className="modal-overlay" onClick={cerrarDetalle}>
          <article className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={cerrarDetalle}>
              ×
            </button>

            {detailLoading ? (
              <p className="loading-message">Cargando detalle...</p>
            ) : detailError ? (
              <p className="error-message">{detailError}</p>
            ) : (
              detail && (
                <>
                  <h2>{detail.title}</h2>
                  <p className="modal-meta">
                    {detail.year ?? "—"} • {detail.rated ?? "NR"} • {detail.runtime ?? "—"} min
                  </p>

                  {detail.ratingInfo?.hasComments ? (
                    <p className="detail-stars">
                      {renderStars(detail.ratingInfo.stars)}
                      <span>
                        {detail.ratingInfo.commentsCount} comentarios
                        {detail.ratingInfo.imdbRating
                          ? ` · IMDb ${detail.ratingInfo.imdbRating}/10`
                          : ""}
                      </span>
                    </p>
                  ) : (
                    <p className="detail-no-comments">Sin comentarios para mostrar estrellas.</p>
                  )}

                  <p className="modal-plot">
                    {detail.fullplot || "Esta película no tiene descripción completa."}
                  </p>

                  <div className="modal-sections">
                    <div>
                      <h4>Directores</h4>
                      <p>{(detail.directors || []).join(", ") || "No disponible"}</p>
                    </div>
                    <div>
                      <h4>Reparto</h4>
                      <p>{(detail.cast || []).slice(0, 8).join(", ") || "No disponible"}</p>
                    </div>
                    <div>
                      <h4>Géneros</h4>
                      <p>{(detail.genres || []).join(" • ") || "No disponible"}</p>
                    </div>
                  </div>

                  <section className="comments-section">
                    <h4>Comentarios recientes</h4>
                    {!detail.comments?.length ? (
                      <p className="detail-no-comments">Esta película aún no tiene comentarios.</p>
                    ) : (
                      <ul>
                        {detail.comments.map((comment) => (
                          <li key={comment._id}>
                            <strong>{comment.name || comment.email || "Usuario"}</strong>
                            <span>{formatDate(comment.date)}</span>
                            <p>{comment.text}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </>
              )
            )}
          </article>
        </div>
      )}
    </div>
  );
}
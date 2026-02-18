import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movieRows, setMovieRows] = useState([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState('');
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState('');
  const [hoveredFeaturedId, setHoveredFeaturedId] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get('/videos');
        setVideos(res.data || []);
      } catch (error) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchMovies = async () => {
      const TMDB_KEY = '1cae65afa1d1e4a62b0074978c2369af';
      const TMDB_IMG = 'https://image.tmdb.org/t/p';
      const postersPerRow = 8;
      const maxGenres = 6;
      try {
        // Fetch genre list
        const genreRes = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_KEY}`);
        const genreData = await genreRes.json();
        const genreIdToName = {};
        (genreData.genres || []).forEach((g) => { genreIdToName[g.id] = g.name; });

        // Fetch popular movies (3 pages = 60 movies)
        const pages = [1, 2, 3];
        const requests = pages.map((page) =>
          fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&page=${page}`)
        );
        const responses = await Promise.all(requests);
        const payloads = await Promise.all(responses.map((r) => r.json()));
        const allMovies = payloads.flatMap((p) => p.results || []);

        const genreMap = new Map();
        const genreCounts = {};

        allMovies.forEach((movie) => {
          if (!movie.poster_path) return;
          const poster = `${TMDB_IMG}/w342${movie.poster_path}`;
          (movie.genre_ids || []).forEach((gid) => {
            const name = genreIdToName[gid];
            if (!name) return;
            genreCounts[name] = (genreCounts[name] || 0) + 1;
            if (!genreMap.has(name)) genreMap.set(name, []);
            genreMap.get(name).push({ imdbID: String(movie.id), title: movie.title, poster });
          });
        });

        const sortedGenres = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([genre]) => genre);
        const selectedGenres = sortedGenres.slice(0, maxGenres);
        const rows = selectedGenres
          .map((genre) => ({
            genre,
            items: (genreMap.get(genre) || []).slice(0, postersPerRow),
          }))
          .filter((row) => row.items.length > 0);

        setMovieRows(rows);
        setMoviesError('');
      } catch (error) {
        setMovieRows([]);
        setMoviesError('Failed to load movie posters.');
      } finally {
        setMoviesLoading(false);
      }
    };

    const fetchFeaturedMovies = async () => {
      const TMDB_KEY = '1cae65afa1d1e4a62b0074978c2369af';
      const TMDB_IMG = 'https://image.tmdb.org/t/p';
      try {
        const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}`);
        const payload = await res.json();
        const top = (payload.results || []).filter((m) => m.poster_path).slice(0, 10);

        // Fetch trailers for each
        const withTrailers = await Promise.all(
          top.map(async (movie) => {
            try {
              const vRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${TMDB_KEY}`);
              const vData = await vRes.json();
              const trailer = (vData.results || []).find(
                (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
              );
              return {
                imdbID: String(movie.id),
                title: movie.title,
                poster: `${TMDB_IMG}/w500${movie.poster_path}`,
                trailerKey: trailer ? trailer.key : null,
              };
            } catch {
              return {
                imdbID: String(movie.id),
                title: movie.title,
                poster: `${TMDB_IMG}/w500${movie.poster_path}`,
                trailerKey: null,
              };
            }
          })
        );

        setFeaturedMovies(withTrailers);
        setFeaturedError('');
      } catch (error) {
        setFeaturedMovies([]);
        setFeaturedError('Failed to load featured movies.');
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchVideos();
    fetchMovies();
    fetchFeaturedMovies();
  }, []);

  const handleFeaturedMove = (direction) => {
    if (!featuredMovies.length) {
      return;
    }
    setFeaturedIndex((prevIndex) => {
      const nextIndex = prevIndex + direction;
      if (nextIndex < 0) {
        return featuredMovies.length - 1;
      }
      if (nextIndex >= featuredMovies.length) {
        return 0;
      }
      return nextIndex;
    });
  };

  const getWrappedItems = (startIndex, count, direction) => {
    if (!featuredMovies.length) {
      return [];
    }
    const items = [];
    for (let i = 1; i <= count; i += 1) {
      const offset = direction === 'left' ? -i : i;
      const index = (startIndex + offset + featuredMovies.length) % featuredMovies.length;
      items.push(featuredMovies[index]);
    }
    return items;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Most popular</h2>
            <span className="text-sm text-gray-400">Hover for trailer</span>
          </div>

          {featuredLoading ? (
            <p className="text-gray-300">Loading featured movies...</p>
          ) : featuredError ? (
            <p className="text-gray-300">{featuredError}</p>
          ) : featuredMovies.length === 0 ? (
            <p className="text-gray-300">No featured movies found.</p>
          ) : (
            <div className="flex items-center justify-center gap-4">
              {getWrappedItems(featuredIndex, 3, 'left').reverse().map((movie) => (
                <div
                  key={movie.imdbID}
                  className="hidden sm:block w-[120px] md:w-[150px] lg:w-[170px]"
                  onMouseEnter={() => setHoveredFeaturedId(movie.imdbID)}
                  onMouseLeave={() => setHoveredFeaturedId(null)}
                >
                  <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-900">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="h-full w-full object-cover opacity-80"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}

              {featuredMovies[featuredIndex] && (
                <div
                  className="w-[220px] sm:w-[260px] md:w-[300px] lg:w-[340px] relative"
                  onMouseEnter={() => setHoveredFeaturedId(featuredMovies[featuredIndex].imdbID)}
                  onMouseLeave={() => setHoveredFeaturedId(null)}
                >
                  <div
                    className={`aspect-[2/3] overflow-hidden rounded-lg bg-gray-900 transition-transform duration-200 ${
                      hoveredFeaturedId === featuredMovies[featuredIndex].imdbID
                        ? 'scale-105 shadow-xl ring-1 ring-white/10'
                        : 'scale-100'
                    }`}
                  >
                    <img
                      src={featuredMovies[featuredIndex].poster}
                      alt={featuredMovies[featuredIndex].title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    {hoveredFeaturedId === featuredMovies[featuredIndex].imdbID && featuredMovies[featuredIndex].trailerKey && (
                      <div className="absolute inset-0 bg-black flex flex-col justify-end">
                        <iframe
                          className="absolute inset-0 h-full w-full"
                          src={`https://www.youtube.com/embed/${featuredMovies[featuredIndex].trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${featuredMovies[featuredIndex].trailerKey}&modestbranding=1&rel=0&showinfo=0`}
                          title={featuredMovies[featuredIndex].title}
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          style={{ border: 'none' }}
                        />
                        <div className="relative p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <div className="text-sm font-semibold">{featuredMovies[featuredIndex].title}</div>
                          <div className="text-xs text-gray-300 mt-1">▶ Trailer</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleFeaturedMove(-1)}
                      className="h-9 w-9 rounded-full bg-gray-900/80 hover:bg-gray-800 flex items-center justify-center"
                      aria-label="Previous movie"
                    >
                      &#8592;
                    </button>
                    <div className="text-sm text-gray-300 text-center flex-1 line-clamp-1">
                      {featuredMovies[featuredIndex].title}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFeaturedMove(1)}
                      className="h-9 w-9 rounded-full bg-gray-900/80 hover:bg-gray-800 flex items-center justify-center"
                      aria-label="Next movie"
                    >
                      &#8594;
                    </button>
                  </div>
                </div>
              )}

              {getWrappedItems(featuredIndex, 3, 'right').map((movie) => (
                <div
                  key={movie.imdbID}
                  className="hidden sm:block w-[120px] md:w-[150px] lg:w-[170px]"
                  onMouseEnter={() => setHoveredFeaturedId(movie.imdbID)}
                  onMouseLeave={() => setHoveredFeaturedId(null)}
                >
                  <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-900">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="h-full w-full object-cover opacity-80"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <h1 className="text-3xl font-bold mb-6">Latest videos</h1>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Trending movies</h2>
            <span className="text-sm text-gray-400">Powered by TMDB</span>
          </div>

          {moviesLoading ? (
            <p className="text-gray-300">Loading movie posters...</p>
          ) : moviesError ? (
            <p className="text-gray-300">{moviesError}</p>
          ) : movieRows.length === 0 ? (
            <p className="text-gray-300">No posters found.</p>
          ) : (
            <div className="space-y-8">
              {movieRows.map((row) => (
                <div key={row.genre}>
                  <h3 className="text-lg font-semibold mb-3">{row.genre}</h3>
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                    {row.items.map((movie) => (
                      <a
                        key={movie.imdbID}
                        href={`https://www.themoviedb.org/movie/${movie.imdbID}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group"
                      >
                        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-gray-900">
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <div className="mt-2 text-xs text-gray-300 line-clamp-1">
                          {movie.title}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {loading ? (
          <p className="text-gray-300">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-gray-300">No videos yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Link
                key={video._id}
                to={`/video/${video._id}`}
                className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition"
              >
                <div className="text-lg font-semibold mb-2">{video.title}</div>
                <div className="text-sm text-gray-400 line-clamp-2">
                  {video.description || 'No description'}
                </div>
                <div className="text-xs text-gray-500 mt-3">
                  {video.category || 'Uncategorized'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

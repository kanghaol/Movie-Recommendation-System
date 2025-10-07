export default function Footer() {
  return (
    <footer className="mt-10 py-6 text-center text-sm text-gray-400 border-t border-slate-700">
      <p className="opacity-80">
        This product uses the{" "}
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition"
        >
          TMDB API
        </a>{" "}
        but is not endorsed or certified by TMDB.
      </p>
    </footer>
  );
}

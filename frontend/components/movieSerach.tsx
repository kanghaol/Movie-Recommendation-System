// pages/index.tsx

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

export default function MovieSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [highlight, setHighlight] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLUListElement | null>(null);

  // Debounce hook for efficient API calls
  function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  }

  const debouncedQuery = useDebounce(query, 300); // 300 ms debounce

  // Fetch search results from Flask API
  useEffect(() => {
    if (debouncedQuery) {
      // Backend runs on port 8080 in this repo; adjust if your backend uses a different port
      fetch(
        `http://localhost:8080/search/title?q=${encodeURIComponent(
          debouncedQuery
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          // Extract only titles
          setResults(
            Array.isArray(data)
              ? data.map((movie: { title: any }) => movie.title)
              : []
          );
          setHighlight(null);
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
          setResults([]);
        });
    } else {
      setResults([]); // Clear results if query is empty
      setHighlight(null);
    }
  }, [debouncedQuery]);

  // keyboard navigation for results
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h: number | null) =>
        h === null ? 0 : Math.min(results.length - 1, (h as number) + 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h: number | null) =>
        h === null ? results.length - 1 : Math.max(0, (h as number) - 1)
      );
    } else if (e.key === "Enter") {
      if (highlight !== null) {
        setQuery(results[highlight]);
        setResults([]);
      }
    } else if (e.key === "Escape") {
      setResults([]);
      setHighlight(null);
    }
  }

  return (
    <div className="movie-search p-4 max-w-3xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {/* search icon */}
          <svg
            className="h-5 w-5 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
            />
          </svg>
        </div>

        <Input
          ref={inputRef}
          placeholder="Search movies, e.g. 'Inception'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-11 rounded-full border-gray-200 shadow-sm focus:shadow-md transition-all"
        />

        {query && (
          <button
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults([]);
              setHighlight(null);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50">
            <svg
              className="h-4 w-4 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {results.length > 0 && (
        <ul
          ref={resultsRef}
          role="listbox"
          aria-label="Search suggestions"
          className="results mt-2 max-h-64 overflow-auto bg-white border border-gray-100 rounded-lg shadow-lg animate-slide-down">
          {results.map((title: string, index: number) => (
            <li
              key={index}
              role="option"
              aria-selected={highlight === index ? "true" : "false"}
              onMouseDown={() => {
                /* use onMouseDown to avoid blur before click */ setQuery(
                  title
                );
                setResults([]);
              }}
              onMouseEnter={() => setHighlight(index)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                highlight === index
                  ? "bg-gray-100 scale-101"
                  : "transform transition-transform duration-150 hover:scale-101"
              }`}>
              <div className="text-sm font-medium">{title}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";


 
interface Movie {
    id: string;
    title: string;
    poster?: string;
}

interface MovieDetails {
    id: string;
    title: string;
    overview: string;
    releaseDate: string;
    runtime: string;
    genres: string[];
    productionCompanies: string[];
    popularity: string;
    voteAverage: string;
    voteCount: string;
}

export default function MovieSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [showRecommendations, setShowRecommendations] = useState(false);

    function useDebounce(value: string, delay: number) {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    }

    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
    if (!debouncedQuery) {
        setResults([]);
        return;
    }

    const controller = new AbortController();

    fetch(`http://localhost:8080/search/title?q=${debouncedQuery}`, {
        signal: controller.signal
    })
        .then((res) => res.json())
        .then((data) => {
        setResults(data.map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            poster: movie.poster || null,
        })));
        })
        .catch((error) => {
        if (error.name !== "AbortError") {
            console.error("Error fetching search results:", error);
            setError("Failed to fetch search results");
        }
        });

    return () => controller.abort(); // cancel previous request
    }, [debouncedQuery]);


    const handleLike = async (movieId: string) => {
        try {
            const response = await fetch('http://localhost:8080/api/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ movieId }),
            });
            if (!response.ok) throw new Error('Failed to like movie');
            alert('Movie liked successfully!');
        } catch (error) {
            console.error("Error liking movie:", error);
            setError("Failed to like movie");
        }
    };

    const handleDislike = async (movieId: string) => {
        try {
            const response = await fetch('http://localhost:8080/api/dislike', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ movieId }),
            });
            if (!response.ok) throw new Error('Failed to dislike movie');
            alert('Movie disliked successfully!');
        } catch (error) {
            console.error("Error disliking movie:", error);
            setError("Failed to dislike movie");
        }
    };

    const MakeRecommendation = async (movieTitle: string) => {
        try {
            const response = await fetch('http://localhost:8080/api/MakeRecommendation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ movieTitle }),
            });
            if (!response.ok) throw new Error('Failed to Make Recommendation');
            const data = await response.json();
            setRecommendations(data.Recommendations);
            setIsDialogOpen(true);
            setShowRecommendations(true);
        } catch (error) {
            console.error("Error Making Recommendation:", error);
            setError("Failed to Make Recommendation");
        }
    };

    const fetchMovieDetails = async (movieId: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/movie/details?id=${movieId}`);
            if (!response.ok) throw new Error("Failed to fetch movie details");
            const data = await response.json();
            setSelectedMovie(data);
            setIsDialogOpen(true);
            setShowRecommendations(false);
        } catch (error) {
            console.error("Error fetching movie details:", error);
            setError("Failed to fetch movie details");
        }
    };

    
    return (
        <div className="movie-search p-8 space-y-4 bg-slate-900 min-h-screen text-gray-100">
            {error && <p className="text-red-400">{error}</p>}
            <Input
                placeholder="Search for a movie..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-3 border border-slate-700 rounded-2xl bg-slate-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <ul className="results mt-6 space-y-4">
            {Array.from(new Map(results.map((m) => [m.id, m])).values()).map((movie, index) => (
                <motion.li
                key={movie.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="flex items-center justify-between p-4 rounded-3xl bg-[#1e1e1e] text-gray-100 
                            shadow-[8px_8px_16px_#151515,-8px_-8px_16px_#272727]
                            hover:shadow-[4px_4px_8px_#151515,-4px_-4px_8px_#272727]
                            hover:scale-[1.02] transition-transform duration-300 border border-transparent hover:border-blue-600"
                >
                {/* Poster Thumbnail */}
                {movie.poster ? (
                    <motion.img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-14 h-20 object-cover rounded-2xl shadow-inner border border-slate-700"
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    loading="lazy"
                    />
                ) : (
                    <div className="w-14 h-20 rounded-2xl bg-slate-700 flex items-center justify-center text-gray-400 text-xs">
                    No Img
                    </div>
                )}

                {/* Movie Title */}
                <span
                    className="flex-1 ml-4 text-lg font-semibold text-blue-400 hover:text-blue-300 cursor-pointer transition"
                    onClick={() => fetchMovieDetails(movie.id)}
                >
                    {movie.title}
                </span>

                {/* Buttons */}
                <div className="space-x-2 flex-shrink-0">
                    <button
                    className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl 
                                shadow-[inset_2px_2px_4px_#151515,inset_-2px_-2px_4px_#272727] 
                                hover:from-blue-700 hover:to-indigo-700 transition"
                    onClick={() => MakeRecommendation(movie.title)}
                    >
                    Find Similar
                    </button>
                    <button
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl 
                                shadow-[inset_2px_2px_4px_#151515,inset_-2px_-2px_4px_#272727] transition"
                    onClick={() => handleLike(movie.id)}
                    >
                    Like
                    </button>
                    <button
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl 
                                shadow-[inset_2px_2px_4px_#151515,inset_-2px_-2px_4px_#272727] transition"
                    onClick={() => handleDislike(movie.id)}
                    >
                    Dislike
                    </button>
                </div>
                </motion.li>
            ))}
            </ul>



            {selectedMovie && (
                <Dialog open={isDialogOpen && !showRecommendations} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="hidden">Open</button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedMovie.title}</DialogTitle>
                            <DialogDescription>
                                <p><strong>Overview:</strong> {selectedMovie.overview}</p>
                                <p><strong>Release Date:</strong> {selectedMovie.releaseDate}</p>
                                <p><strong>Runtime:</strong> {selectedMovie.runtime} mins</p>
                                <p><strong>Genres:</strong> {selectedMovie.genres.join(", ")}</p>
                                <p><strong>Production Companies:</strong> {selectedMovie.productionCompanies.join(", ")}</p>
                                <p><strong>Popularity:</strong> {selectedMovie.popularity}</p>
                                <p><strong>Average Vote:</strong> {selectedMovie.voteAverage}</p>
                                <p><strong>Vote Count:</strong> {selectedMovie.voteCount}</p>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            )}

            {recommendations &&(
                <Dialog open={isDialogOpen && showRecommendations} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <button className="hidden">Open</button>
                </DialogTrigger>

                <DialogContent className="bg-transparent border-0 shadow-none p-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="relative w-[90vw] max-w-4xl mx-auto p-8 rounded-3xl 
                            bg-[#1e1e1e] text-gray-100
                            shadow-[8px_8px_16px_#151515,-8px_-8px_16px_#272727]"
                >
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-blue-400 drop-shadow">
                    Recommendations
                    </DialogTitle>
                </DialogHeader>

                <ul className="mt-6 space-y-4 flex flex-col">
                {recommendations.map((rec, index) => (
                    <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.07 }}
                    className="flex items-center gap-4 px-6 py-4 rounded-xl bg-[#1e1e1e]
                        shadow-[inset_4px_4px_8px_#151515,inset_-4px_-4px_8px_#272727]
                        hover:shadow-[inset_2px_2px_4px_#151515,inset_-2px_-2px_4px_#272727]
                        cursor-pointer transition text-gray-300 hover:text-blue-300"
                    >
                    {/* Poster Thumbnail */}
                    {rec.poster && (
                        <img
                            src={rec.poster}
                            alt={rec.title}
                            className="w-16 h-24 object-cover rounded-md shadow-md"
                        />
                    )}

                    {/* Movie Title */}
                    <span className="text-lg font-semibold">{rec.title || rec}</span>
                    </motion.li>
                ))}
                </ul>

                </motion.div>
            </DialogContent>
            </Dialog>

            )}
             <Footer />
        </div>
    );
}

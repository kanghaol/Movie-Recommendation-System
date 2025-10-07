'use client'
import { useState, useEffect } from 'react';

export default function Profile() {
    const [userData, setUserData] = useState({
        name: '',
        likes: [],
        dislikes: []
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8080/api/profile', {
            method: 'GET',
            credentials: 'include', 
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch profile");
                }
                return res.json();
            })
            .then((data) => setUserData(data))
            .catch((error) => setError(error.message));
    }, []);

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="p-4 max-w-3xl mx-auto">
            {/* User Name */}
            <h1 className="text-3xl font-bold text-center mb-6">{userData.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Likes Column */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Liked Movies</h2>
                    <ul className="space-y-2">
                        {userData.likes.length > 0 ? (
                            userData.likes.map((movie, index) => (
                                <li key={index} className="p-2 border rounded-lg">
                                    {movie}
                                </li>
                            ))
                        ) : (
                            <p>No liked movies</p>
                        )}
                    </ul>
                </div>

                {/* Dislikes Column */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Disliked Movies</h2>
                    <ul className="space-y-2">
                        {userData.dislikes.length > 0 ? (
                            userData.dislikes.map((movie, index) => (
                                <li key={index} className="p-2 border rounded-lg">
                                    {movie}
                                </li>
                            ))
                        ) : (
                            <p>No disliked movies</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

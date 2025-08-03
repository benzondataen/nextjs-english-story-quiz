// english-story-quiz/src/app/page.tsx

"use client";

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';

// Define the Story interface based on the API response
interface Story {
  id: string;
  title: string;
  level: string;
}

const levels = ['Beginner', 'Intermediate', 'Advanced'];

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('https://n8n-prod.sengsalee.dev/webhook/get-all-story/');
        if (!response.ok) {
          throw new Error('Failed to fetch stories.');
        }
        const data = await response.json();
        setStories(data);
      } catch (err) {
        setError("Could not fetch stories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Use useMemo to re-calculate filtered and sorted stories only when dependencies change
  const filteredAndSortedStories = useMemo(() => {
    let filteredStories = stories;
    if (filterLevel !== 'All') {
      filteredStories = stories.filter(story => story.level === filterLevel);
    }

    // Sort the stories based on level (Beginner, Intermediate, Advanced)
    const sortedStories = [...filteredStories].sort((a, b) => {
      const levelA = levels.indexOf(a.level);
      const levelB = levels.indexOf(b.level);
      if (sortOrder === 'asc') {
        return levelA - levelB;
      } else {
        return levelB - levelA;
      }
    });

    return sortedStories;
  }, [stories, filterLevel, sortOrder]);

  if (loading) return <div className="flex justify-center items-center h-screen text-xl">Loading stories...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500 text-xl">{error}</div>;
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">English Stories</h1>
      
      {/* Filter and Sort Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="filter-level" className="font-medium text-gray-700">Filter by Level:</label>
          <select
            id="filter-level"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="All">All</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="sort-order" className="font-medium text-gray-700">Sort by Level:</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
      
      {filteredAndSortedStories.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500 text-xl">No stories available for this level.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedStories.map((story) => (
            <Link href={`/story/${story.id}`} key={story.id} className="block">
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer border border-gray-200">
                <h2 className="text-2xl font-semibold mb-2 text-indigo-600">{story.title}</h2>
                <p className="text-gray-500">Level: <span className="font-medium">{story.level}</span></p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
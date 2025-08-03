// english-story-quiz/src/app/story/[id]/page.tsx

"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link'; // Import Link component

interface StoryDetail {
  id: string;
  title: string;
  content: string;
  level: string;
}

interface Vocab {
  id: string;
  word: string;
  meaning: string;
  story_id: string;
}

export default function StoryDetailPage() {
  const params = useParams();
  const storyId = params.id as string;

  const [story, setStory] = useState<StoryDetail | null>(null);
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch story details
        const storyResponse = await fetch('https://n8n-prod.sengsalee.dev/webhook/get-story-by-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: storyId }),
        });
        if (!storyResponse.ok) throw new Error('Failed to fetch story details.');
        const storyData = await storyResponse.json();
        setStory(storyData);

        // Fetch vocabulary for the story
        const vocabResponse = await fetch('https://n8n-prod.sengsalee.dev/webhook/get-vocab-by-story-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ story_id: storyId }),
        });
        if (!vocabResponse.ok) throw new Error('Failed to fetch vocabulary.');
        const vocabData = await vocabResponse.json();
        setVocabs(vocabData);
      } catch (err) {
        setError("Could not fetch the story. Please check the ID.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storyId]);

  if (loading) return <div className="flex justify-center items-center h-screen text-xl">Loading story...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500 text-xl">{error}</div>;
  if (!story) return <div className="flex justify-center items-center h-screen text-gray-500 text-xl">Story not found.</div>;

  return (
    <main className="container mx-auto px-4 py-8 relative">
      <div className="absolute top-8 left-4">
        <Link href="/" className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-200">
          Home
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-4 text-center text-gray-800">{story.title}</h1>
      <p className="text-center text-gray-500 mb-8">Level: <span className="font-medium">{story.level}</span></p>

      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Story Content</h2>
        <p className="whitespace-pre-line text-lg text-gray-700">{story.content}</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Vocabulary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vocabs.length > 0 ? (
            vocabs.map((vocab) => (
              <div key={vocab.id} className="p-4 bg-gray-100 rounded-lg">
                <p className="font-bold text-lg text-gray-800">{vocab.word}</p>
                <p className="text-gray-600">{vocab.meaning}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No vocabulary found for this story.</p>
          )}
        </div>
      </div>
    </main>
  );
}
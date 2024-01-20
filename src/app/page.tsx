'use client';
import React, { useState } from 'react';
import CardFlip from '@/components/CardFlip';

export default function Home() {
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-[url('/game/blackjack/blackjackTable.webp')]">
      <h1 className="text-4xl font-bold border-white text-gray-900">
        Select Card Game
      </h1>
      <div className="flex flex-wrap justify-center">
        <CardFlip gameName="blackjack" />
        <CardFlip gameName="poker" />
        <CardFlip gameName="speed" />
        <CardFlip gameName="war" />
      </div>
    </main>
  );
}

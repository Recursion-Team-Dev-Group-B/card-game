'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CardImage from '@/components/CardImage';
import ReactCardFlip from 'react-card-flip';

type Props = {
  gameName: string;
};

const CardFlip = ({ gameName }: Props) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();

  const flipCard = (): void => {
    setIsFlipped((prev) => !prev);
  };

  const handleClick = (e: any) => {
    e.preventDefault();
    router.push(`/${gameName}`);
  };

  return (
    <div className="mr-8 ml-12 mt-12">
      <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
        {/* 
        
        <CardImage
          url={`/assets/${gameName}.png`}
          alt={gameName}
          flipCard={flipCard}
        /> */}
        <div className="w-200 h-300 bg-white" onMouseLeave={flipCard}>
          <img className="w-200 h-200" src="/assets/casino.webp" />
          <div className="w-200 h-100 items-center justify-center bg-black">
            <button
              type="button"
              className="w-200  my-5 h-14 text-2xl font-xl border-white text-gray-900 focus:outline-none text-white bg-red-700 hover:bg-red-900 focus:ring-4 focus:ring-red-300 rounded-lg px-2 py-2.5 me-2 mb-2 dark:focus:ring-red-900"
              onClick={handleClick}
            >
              {`Play ${gameName}`}
            </button>
          </div>
        </div>
        <div className="w-200 h-300 bg-white" onMouseLeave={flipCard}>
          <img className="w-200 h-200" src="/assets/casino.webp" />
          <div className="w-200 h-100 items-center justify-center bg-black">
            <button
              type="button"
              className="w-200  my-5 h-14 text-2xl font-xl border-white text-gray-900 focus:outline-none text-white bg-red-700 hover:bg-red-900 focus:ring-4 focus:ring-red-300 rounded-lg px-2 py-2.5 me-2 mb-2 dark:focus:ring-red-900"
              onClick={handleClick}
            >
              {`Play ${gameName}`}
            </button>
          </div>
        </div> 
      </ReactCardFlip>
    </div>
  );
};

export default CardFlip;

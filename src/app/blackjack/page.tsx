'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Storage from '@/utils/storage';

const Page = () => {
  useEffect(() => {
    (async () => {
      const Phaser = await import('phaser');
      const config = (await import('@/app/blackjack/config')).default;
      const game = new Phaser.Game(config);

      return () => {
        game.destroy(true);
      };
    })();
  }, []);
  return <div id="blackjackGame"></div>;
};

export default Page;

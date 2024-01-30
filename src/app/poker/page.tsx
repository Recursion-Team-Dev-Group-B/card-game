'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';


const Page = () => {
  useEffect(() => {
    (async () => {
      const Phaser = await import('phaser');
      const config = (await import('@/app/poker/config')).default;
      const game = new Phaser.Game(config);

      return () => {
        game.destroy(true);
      };
    })();
  }, []);
  return <div id="pokerGame"></div>;
};

export default Page;
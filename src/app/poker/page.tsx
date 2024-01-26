'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';


/*
const DynamicComponentWithNoSSR = dynamic(
  () => import('@/scenes/poker/gameScene'),
  {
    ssr: false,
  },
);

const Page = () => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
  }, []);
  return (
    <div>
      <p>Poker</p>
      <div id="pokerGame"></div>
      {loading ? <DynamicComponentWithNoSSR /> : null}
    </div>
  );
};

export default Page;
*/


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
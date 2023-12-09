'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Storage from '@/utils/storage';
const DynamicComponentWithNoSSR = dynamic(
  () => import('@/scenes/blackjack/gameScene'),
  {
    ssr: false,
  },
);

const storage = new Storage();

const Page = () => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    // storage.set('chips', 1000);
  }, []);
  return (
    <div>
      <div id="blackjackGame">
        {loading ? <DynamicComponentWithNoSSR /> : null}
      </div>
    </div>
  );
};

export default Page;

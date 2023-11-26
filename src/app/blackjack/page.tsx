'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const DynamicComponentWithNoSSR = dynamic(
  () => import('@/scenes/blackjack/gameScene'),
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
      <div id="blackjackGame">
        {loading ? <DynamicComponentWithNoSSR /> : null}
      </div>
    </div>
  );
};

export default Page;

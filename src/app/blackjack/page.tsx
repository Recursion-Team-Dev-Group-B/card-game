'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const DynamicComponentWithNoSSR = dynamic(() => import('@/components/index'), {
  ssr: false,
});

const Page = () => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
  }, []);
  return (
    <div>
      <div id="game-app"></div>
      {loading ? <DynamicComponentWithNoSSR /> : null}
    </div>
  );
};

export default Page;

import { Suspense } from 'react';
import { MarketingPage } from '@/src/components/MarketingPage';

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090e]" />}>
      <MarketingPage />
    </Suspense>
  );
}

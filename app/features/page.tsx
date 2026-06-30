import { Suspense } from 'react';
import { MarketingPage } from '@/src/components/MarketingPage';

export default function FeaturesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090e]" />}>
      <MarketingPage />
    </Suspense>
  );
}

'use client';

import { LandingHomeCtaSection } from './LandingHomeCtaSection';
import { LandingHomeFeaturesSection } from './LandingHomeFeaturesSection';
import { LandingHomeHeroSection } from './LandingHomeHeroSection';
import { LandingHomeJourneySection } from './LandingHomeJourneySection';
import { LandingHomePortfolioSection } from './LandingHomePortfolioSection';
import type { LandingViewCommonProps } from './landingTypes';

export function LandingHomeView(props: LandingViewCommonProps) {
    return (
        <>
            <LandingHomeHeroSection {...props} />
            <LandingHomeFeaturesSection />
            <LandingHomePortfolioSection />
            <LandingHomeJourneySection />
            <LandingHomeCtaSection {...props} />
        </>
    );
}

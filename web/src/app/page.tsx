import { Hero } from '@/components/home/Hero';
import { FeaturedHampers } from '@/components/home/FeaturedHampers';
import { ShopByOccasion } from '@/components/home/ShopByOccasion';
import { StudioTeaser } from '@/components/home/StudioTeaser';
import { WhyUs } from '@/components/home/WhyUs';
import { TrustStrip } from '@/components/home/TrustStrip';

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedHampers />
      <ShopByOccasion />
      <StudioTeaser />
      <WhyUs />
      <TrustStrip />
    </>
  );
}

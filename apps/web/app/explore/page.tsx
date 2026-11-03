import type { Metadata } from "next";

import { ExploreView } from "../../components/explore-view";
import { DemoBadge, PageIntro } from "../../components/ui";

export const metadata: Metadata = {
  title: "Explore experiments",
  description: "Browse the Virtual Chemistry Lab experiment discovery foundation.",
};

export default function ExplorePage() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="Explore experiments"
        title="Choose a question to investigate"
        description="This discovery surface is ready for the reviewed experiment library. The current records are interface demonstrations and must not be treated as validated chemistry content."
      >
        <DemoBadge />
      </PageIntro>
      <ExploreView />
    </div>
  );
}

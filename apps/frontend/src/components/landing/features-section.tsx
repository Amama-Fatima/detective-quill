"use client";

import { OrnamentDivider } from "@/components/icons/ornament-divider";
import EditorWidget from "@/components/widgets/editor-widget";
import BlueprintWidget from "@/components/widgets/blueprint-widget";
import GraphWidget from "@/components/widgets/graph-widget";
import SearchWidget from "@/components/widgets/search-widget";
import VersionWidget from "@/components/widgets/version-widget";
import GamificationWidget from "@/components/widgets/gamification-widget";
import HeatmapWidget from "@/components/widgets/heatmap-widget";
import FeatureCard from "./feature-card";

export default function FeaturesSection() {
  return (
    <section className="bg-muted px-6 py-[100px] md:px-12">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 font-serif text-sm uppercase tracking-[0.14em] text-muted-foreground">
            The Investigator&apos;s Toolkit
          </div>
          <h2 className="mb-4 font-playfair-display text-[clamp(32px,4vw,52px)] font-bold leading-[1.1] tracking-[-0.025em] text-primary">
            Every Tool a<br />
            <em className="italic text-muted-foreground">Crime Writer</em> Needs
          </h2>
          <div className="flex justify-center text-muted-foreground">
            <OrnamentDivider />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 auto-rows-auto">
          <div className="col-span-12 md:col-span-6 md:row-span-1">
            <FeatureCard
              tag="Editor"
              title="The Writing Desk"
              desc="A distraction-free editor built for long-form fiction with chapter structure that thinks like a novelist. Invite beta readers, leave inline comments."
              widget={<EditorWidget />}
              className="h-full"
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <FeatureCard
              tag="Search"
              title="Deep Search"
              desc="Search across your entire manuscript simultaneously. Find the detail you buried three chapters ago."
              widget={<SearchWidget />}
              className="h-full"
            />
          </div>

          <div className="col-span-12 md:col-span-8">
            <FeatureCard
              tag="Graphs"
              title="Know Your Story at a Glance"
              desc="Map relationships between characters, locations, and clues."
              widget={
                <div style={{ height: 270 }}>
                  <GraphWidget />
                </div>
              }
              dark
              className="h-full"
            />
          </div>

          <div className="col-span-12 md:col-span-4 md:row-span-1">
            <FeatureCard
              tag="Gamification"
              title="Ranks & Badges"
              desc="Earn XP for every writing session, unlock investigator badges, and climb from Constable to Chief Inspector."
              widget={<GamificationWidget />}
              className="h-full"
            />
          </div>

          <div className="col-span-12 md:col-span-4 lg:col-span-4">
            <FeatureCard
              tag="Productivity"
              title="Writing Heatmap"
              desc="Track your writing consistency with a GitHub-style activity heatmap. See your most productive days, spot gaps, and build an unbreakable daily habit."
              widget={<HeatmapWidget />}
              className="h-full"
            />
          </div>

          <div className="col-span-12 md:col-span-8">
            <FeatureCard
              tag="Version Control"
              title="Draft History & Revisions"
              desc="Every save is a checkpoint. Create branches for alternate plots. browse your full revision history, restore any version of your manuscript with one click."
              widget={<VersionWidget />}
              dark
              className="h-full"
            />
          </div>

          <div className="col-span-12">
            <FeatureCard
              tag="Canvas"
              title="Blueprint & Canvas"
              desc="Plot your characters, timelines, locations and items on a visual canvas. Drag cards and see your whole story architecture at a glance."
              widget={
                <div style={{ height: 220 }}>
                  <BlueprintWidget />
                </div>
              }
              className="h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

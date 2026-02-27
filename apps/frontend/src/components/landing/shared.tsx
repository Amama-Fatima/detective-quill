import { MagnifyIcon } from "@/components/icons/magnify-icon";
import {BlueprintIcon} from "@/components/icons/blueprint-icon";
import { GraphIcon } from "@/components/icons/graph-icon";
import { PenToolIcon } from "@/components/icons/pen-tool-icon";

// export const QuillIcon = ({
//   size = 32,
//   color = "currentColor",
// }: {
//   size?: number;
//   color?: string;
// }) => (
//   <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
//     <path
//       d="M40 4C40 4 28 8 20 20C14 29 12 40 12 40L18 34C20 30 24 26 28 22L22 20C26 14 34 8 40 4Z"
//       stroke={color}
//       strokeWidth="1.8"
//       strokeLinejoin="round"
//       fill="none"
//     />
//     <path
//       d="M12 40L8 44"
//       stroke={color}
//       strokeWidth="1.8"
//       strokeLinecap="round"
//     />
//     <path
//       d="M20 20L28 22"
//       stroke={color}
//       strokeWidth="1.4"
//       strokeLinecap="round"
//     />
//   </svg>
// );

export const testimonials = [
  {
    name: "Margaret Holloway",
    role: "Author, The Whitmore Files series",
    stars: 5,
    quote:
      "The canvas alone is worth every penny. I mapped out a 90,000-word novel in an afternoon. Nothing else comes close for plotting crime fiction.",
    imgPath: "/images/avatar.jpg",
    hue: 200,
  },
  {
    name: "James Carver",
    role: "Crime fiction editor & novelist",
    stars: 5,
    quote:
      "I've tried every writing app on the market. Detective's Quill is the only one that actually understands how mystery writers think, non-linear, evidence-first.",
    imgPath: "/images/author-2.jpg",
    hue: 160,
  },
  {
    name: "Priya Sundaram",
    role: "Short story writer, 3× published",
    stars: 5,
    quote:
      "The Deep Search feature found a continuity error I'd been hunting for weeks. It's like having a research assistant who's read your entire manuscript.",
    imgPath: "/images/author-3.jpg",
    hue: 80,
  },
  {
    name: "Thomas Beckett",
    role: "Debut novelist, The Aldgate Affair",
    stars: 5,
    quote:
      "Writing my first novel was terrifying. The blueprint kept me from losing the plot literally. The graph view for character relationships is genius.",
    imgPath: "/images/author-4.jpg",
    hue: 30,
  },
];

export const features = [
  {
    icon: <PenToolIcon size={26} />,
    title: "The Writing Desk",
    desc: "A distraction-free editor built for long-form fiction with a chapter structure that thinks like a novelist. Invite beta readers, leave comments.",
    tag: "Editor",
  },
  {
    icon: <BlueprintIcon size={26} />,
    title: "Blueprint & Canvas",
    desc: "Plot your characters, timelines, locations and items on a visual canvas. Drag timelines, pin cards, and see your whole story architecture at a glance.",
    tag: "Canvas",
  },
  {
    icon: <GraphIcon size={26} />,
    title: "Connection Graphs",
    desc: "Map relationships between characters, locations, and clues. See who knew what and when with an interactive network graph.",
    tag: "Graphs",
  },
  {
    icon: <MagnifyIcon size={26} />,
    title: "Deep Search",
    desc: "Search across your manuscript. Find the details you buried three chapters ago.",
    tag: "Search",
  },
];

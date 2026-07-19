export interface ProjectSection {
  id: string;
  type: "full-width-image" | "description" | "two-column-image";
  title?: string;
  content?: string;
  image1?: {
    src: string;
    caption: string;
  };
  image2?: {
    src: string;
    caption: string;
  };
}

export interface ProjectHighlight {
  id: string;
  text: string;
}

export interface Project {
  slug: string;
  title: string;
  heroDescription: string;
  role: string;
  year: string;
  thumbnail: string;
  highlights: ProjectHighlight[];
  sections: ProjectSection[];
}

export interface CareerItem {
  id?: string;
  company: string;
  role: string;
  year: string;
  isCurrent?: boolean;
  order_index?: number;
}

export interface HistoryPhotoItem {
  id: string;
  src: string;
  alt: string;
  order_index: number;
}

export const INITIAL_HISTORY_PHOTOS: HistoryPhotoItem[] = [
  { id: "hp-1", src: "/assets/photos/dan-stage.webp", alt: "Stage", order_index: 1 },
  { id: "hp-2", src: "/assets/photos/dan-profile.webp", alt: "Profile", order_index: 2 },
  { id: "hp-3", src: "/assets/photos/about-1.webp", alt: "Family", order_index: 3 },
  { id: "hp-4", src: "/assets/photos/about-2.webp", alt: "Life", order_index: 4 },
];

export const CAREER_HISTORY: CareerItem[] = [
  { id: "career-1", company: "CURRENT", role: "LEAD PRODUCT DESIGNER", year: "2022 - 2026", isCurrent: true, order_index: 1 },
  { id: "career-2", company: "QUIMBEE", role: "SENIOR PRODUCT DESIGNER", year: "2020 - 2022", order_index: 2 },
  { id: "career-3", company: "NIGHTOWLS", role: "PRODUCT DESIGNER", year: "2019 - 2020", order_index: 3 },
  { id: "career-4", company: "LIGHTHOUSE", role: "CREATIVE DIRECTOR", year: "2018 - 2019", order_index: 4 },
  { id: "career-5", company: "NINETYONE", role: "FOUNDER", year: "2014 - 2019", order_index: 5 },
  { id: "career-6", company: "90 SECONDS", role: "VIDEOGRAPHER", year: "2011 - 2014", order_index: 6 },
];

export const EDUCATION_HISTORY: CareerItem[] = [
  { id: "edu-1", company: "AUT UNIVERSITY", role: "BACHELOR OF COMPUTER SCIENCE", year: "2016", order_index: 1 },
  { id: "edu-2", company: "YOOBEE COLLEGE", role: "DIPLOMA DIRECTING & SCRIPTWRITING", year: "2011", order_index: 2 },
];

export const PROJECTS: Project[] = [
  {
    slug: "current-growth-team",
    title: "Project hero title",
    heroDescription:
      "Project hero description goes here. From the initial concept to the final rollout, I crafted a cohesive visual identity, shaped the user experience, and established useful motion design that resonated with our target audience.",
    role: "LEAD DESIGNER",
    year: "2025",
    thumbnail: "/assets/misc/placeholder.jpg",
    highlights: [
      {
        id: "h1",
        text: "14.6% increase in paycheck advance click-through rate, 3% draw increase",
      },
      {
        id: "h2",
        text: "245k unique users to the discover tab with 7,342 cross-campaign users",
      },
      {
        id: "h3",
        text: "Increased users entering the referral flow by 12.4%",
      },
    ],
    sections: [
      {
        id: "sec-1",
        type: "full-width-image",
        image1: {
          src: "/assets/misc/placeholder.jpg",
          caption: "IMAGE DESCRIPTION GOES HERE",
        },
      },
      {
        id: "sec-2",
        type: "description",
        title: "Section title",
        content:
          "Changing your direct deposit to a different bank can feel overwhelming and time-consuming. It's essential to keep track of your incoming salaries and ensure everything is in order.\n\nWe aimed to simplify the process, ensuring it operates seamlessly without any hassle.",
      },
      {
        id: "sec-3",
        type: "two-column-image",
        image1: {
          src: "/assets/misc/placeholder.jpg",
          caption: "IMAGE DESCRIPTION GOES HERE",
        },
        image2: {
          src: "/assets/misc/placeholder.jpg",
          caption: "IMAGE DESCRIPTION GOES HERE",
        },
      },
    ],
  },
  {
    slug: "project-1",
    title: "Onboarding Redesign",
    heroDescription:
      "Streamlining the user onboarding journey for millions of working Americans. We simplified complex financial verification flows into intuitive, bite-sized micro-steps.",
    role: "PRODUCT DESIGNER",
    year: "2024",
    thumbnail: "/assets/misc/placeholder.jpg",
    highlights: [
      { id: "h1", text: "32% boost in onboarding completion rates within 30 days" },
      { id: "h2", text: "Reduced customer support inquiry tickets by over 45%" },
      { id: "h3", text: "Awarded Best Financial UI design by industry leaders" },
    ],
    sections: [
      {
        id: "sec-1",
        type: "description",
        title: "Strategic Vision",
        content:
          "When users open a banking app for the first time, speed and trust are critical. We re-engineered the onboarding architecture from the ground up to minimize cognitive load.",
      },
      {
        id: "sec-2",
        type: "full-width-image",
        image1: {
          src: "/assets/misc/placeholder.jpg",
          caption: "NEW ONBOARDING ARCHITECTURE & FLOWS",
        },
      },
      {
        id: "sec-3",
        type: "two-column-image",
        image1: {
          src: "/assets/misc/placeholder.jpg",
          caption: "DARK MODE INTERFACE EXPLORATION",
        },
        image2: {
          src: "/assets/misc/placeholder.jpg",
          caption: "BIOMETRIC AUTHENTICATION HANDSHAKE",
        },
      },
    ],
  },
  {
    slug: "project-2",
    title: "Direct Deposit Intake",
    heroDescription:
      "A frictionless direct deposit switching experience that connects users to over 10,000 employers and payroll providers seamlessly.",
    role: "LEAD DESIGNER",
    year: "2023",
    thumbnail: "/assets/misc/placeholder.jpg",
    highlights: [
      { id: "h1", text: "Over $120M in recurring salary deposits routed in Q1" },
      { id: "h2", text: "Zero-latency payroll integration with automated fallback" },
    ],
    sections: [
      {
        id: "sec-1",
        type: "full-width-image",
        image1: {
          src: "/assets/misc/placeholder.jpg",
          caption: "PAYROLL PROVIDER SELECTION INTERFACE",
        },
      },
    ],
  },
  {
    slug: "project-3",
    title: "Design System 2.0",
    heroDescription:
      "Creating a cohesive, tokenized design system spanning mobile iOS, Android, and web applications with sub-second theming capabilities.",
    role: "SYSTEMS LEAD",
    year: "2023",
    thumbnail: "/assets/misc/placeholder.jpg",
    highlights: [
      { id: "h1", text: "Adopted by 40+ cross-functional product engineers" },
      { id: "h2", text: "100% WCAG AA accessibility compliance across all components" },
    ],
    sections: [
      {
        id: "sec-1",
        type: "two-column-image",
        image1: {
          src: "/assets/misc/placeholder.jpg",
          caption: "COLOR & TYPOGRAPHY TOKEN MATRIX",
        },
        image2: {
          src: "/assets/misc/placeholder.jpg",
          caption: "INTERACTIVE COMPONENT VARIANT STATES",
        },
      },
    ],
  },
  {
    slug: "project-4",
    title: "AI Design Tooling",
    heroDescription:
      "Vibe coding internal applications and speeding up our core design system to integrate seamlessly with custom AI agents and workflows.",
    role: "PRODUCT DESIGNER",
    year: "2026",
    thumbnail: "/assets/misc/placeholder.jpg",
    highlights: [
      { id: "h1", text: "10x faster prototyping workflows using generative AI models" },
      { id: "h2", text: "Built custom Figma-to-code pipelines for design tokens" },
    ],
    sections: [
      {
        id: "sec-1",
        type: "full-width-image",
        image1: {
          src: "/assets/misc/placeholder.jpg",
          caption: "AI AGENT WORKFLOW DASHBOARD",
        },
      },
    ],
  },
];

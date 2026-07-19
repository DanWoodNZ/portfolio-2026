-- Supabase SQL Schema for Custom CMS & Cloudflare R2 Media Gallery
-- Run this in your Supabase project's SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create or update the projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  role TEXT NOT NULL,
  year TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  highlights JSONB DEFAULT '[]'::jsonb,
  thumbnail TEXT NOT NULL DEFAULT '/assets/projects/current-growth-team/hero/thumb.jpg',
  sections JSONB DEFAULT '[]'::jsonb,
  media_gallery JSONB DEFAULT '[]'::jsonb,
  is_locked BOOLEAN DEFAULT false,
  password TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure media_gallery, is_locked, and password columns exist if table was previously created
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS media_gallery JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '';

-- 2. Create visual_feed table
CREATE TABLE IF NOT EXISTS public.visual_feed (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  "aspectRatio" TEXT NOT NULL,
  src TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create history_photos table
CREATE TABLE IF NOT EXISTS public.history_photos (
  id TEXT PRIMARY KEY,
  src TEXT NOT NULL,
  alt TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create career_items table
CREATE TABLE IF NOT EXISTS public.career_items (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  year TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create education_items table
CREATE TABLE IF NOT EXISTS public.education_items (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  year TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_items ENABLE ROW LEVEL SECURITY;

-- 7. Create Public Read Policies (Allow anyone to view site content)
DROP POLICY IF EXISTS "Allow public read access on projects" ON public.projects;
CREATE POLICY "Allow public read access on projects" ON public.projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access on visual_feed" ON public.visual_feed;
CREATE POLICY "Allow public read access on visual_feed" ON public.visual_feed FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access on history_photos" ON public.history_photos;
CREATE POLICY "Allow public read access on history_photos" ON public.history_photos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access on career_items" ON public.career_items;
CREATE POLICY "Allow public read access on career_items" ON public.career_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access on education_items" ON public.education_items;
CREATE POLICY "Allow public read access on education_items" ON public.education_items FOR SELECT USING (true);

-- 8. Create Authenticated Admin CRUD Policies
DROP POLICY IF EXISTS "Allow admin full access on projects" ON public.projects;
CREATE POLICY "Allow admin full access on projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow admin full access on visual_feed" ON public.visual_feed;
CREATE POLICY "Allow admin full access on visual_feed" ON public.visual_feed FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow admin full access on history_photos" ON public.history_photos;
CREATE POLICY "Allow admin full access on history_photos" ON public.history_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow admin full access on career_items" ON public.career_items;
CREATE POLICY "Allow admin full access on career_items" ON public.career_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow admin full access on education_items" ON public.education_items;
CREATE POLICY "Allow admin full access on education_items" ON public.education_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Insert initial seed projects
INSERT INTO public.projects (slug, title, description, role, year, order_index, highlights, thumbnail, sections, media_gallery)
VALUES
(
  'current-growth-team',
  'Project hero title',
  'Project hero description goes here. From the initial concept to the final rollout, I crafted a cohesive visual identity, shaped the user experience, and established useful motion design that resonated with our target audience.',
  'LEAD DESIGNER',
  '2025',
  1,
  '["14.6% increase in paycheck advance click-through rate, 3% draw increase", "245k unique users to the discover tab with 7,342 cross-campaign users", "Increased users entering the referral flow by 12.4%"]'::jsonb,
  '/assets/projects/current-growth-team/hero/thumb.jpg',
  '[{"id": "sec-1", "type": "full-width-image", "image1": {"src": "/assets/projects/current-growth-team/images/full-1.jpg", "caption": "IMAGE DESCRIPTION GOES HERE"}}, {"id": "sec-2", "type": "description", "title": "Section title", "content": "Changing your direct deposit to a different bank can feel overwhelming and time-consuming. It''s essential to keep track of your incoming salaries and ensure everything is in order.\n\nWe aimed to simplify the process, ensuring it operates seamlessly without any hassle."}, {"id": "sec-3", "type": "two-column-image", "image1": {"src": "/assets/projects/current-growth-team/images/col-1.jpg", "caption": "IMAGE DESCRIPTION GOES HERE"}, "image2": {"src": "/assets/projects/current-growth-team/images/col-2.jpg", "caption": "IMAGE DESCRIPTION GOES HERE"}}]'::jsonb,
  '[]'::jsonb
),
(
  'project-1',
  'Onboarding Redesign',
  'Streamlining the user onboarding journey for millions of working Americans. We simplified complex financial verification flows into intuitive, bite-sized micro-steps.',
  'PRODUCT DESIGNER',
  '2024',
  2,
  '["32% boost in onboarding completion rates within 30 days", "Reduced customer support inquiry tickets by over 45%", "Awarded Best Financial UI design by industry leaders"]'::jsonb,
  '/assets/projects/project-1/hero/thumb.jpg',
  '[{"id": "sec-1", "type": "description", "title": "Strategic Vision", "content": "When users open a banking app for the first time, speed and trust are critical. We re-engineered the onboarding architecture from the ground up to minimize cognitive load."}, {"id": "sec-2", "type": "full-width-image", "image1": {"src": "/assets/projects/project-1/images/full.jpg", "caption": "NEW ONBOARDING ARCHITECTURE & FLOWS"}}, {"id": "sec-3", "type": "two-column-image", "image1": {"src": "/assets/projects/project-1/images/col-left.jpg", "caption": "DARK MODE INTERFACE EXPLORATION"}, "image2": {"src": "/assets/projects/project-1/images/col-right.jpg", "caption": "BIOMETRIC AUTHENTICATION HANDSHAKE"}}]'::jsonb,
  '[]'::jsonb
),
(
  'project-2',
  'Direct Deposit Intake',
  'A frictionless direct deposit switching experience that connects users to over 10,000 employers and payroll providers seamlessly.',
  'LEAD DESIGNER',
  '2023',
  3,
  '["Over $120M in recurring salary deposits routed in Q1", "Zero-latency payroll integration with automated fallback"]'::jsonb,
  '/assets/projects/project-1/hero/thumb2.jpg',
  '[{"id": "sec-1", "type": "full-width-image", "image1": {"src": "/assets/projects/project-1/images/hero-deposit.jpg", "caption": "PAYROLL PROVIDER SELECTION INTERFACE"}}]'::jsonb,
  '[]'::jsonb
),
(
  'project-3',
  'Design System 2.0',
  'Creating a cohesive, tokenized design system spanning mobile iOS, Android, and web applications with sub-second theming capabilities.',
  'SYSTEMS LEAD',
  '2023',
  4,
  '["Adopted by 40+ cross-functional product engineers", "100% WCAG AA accessibility compliance across all components"]'::jsonb,
  '/assets/projects/project-1/hero/thumb3.jpg',
  '[{"id": "sec-1", "type": "two-column-image", "image1": {"src": "/assets/projects/project-1/images/ds-1.jpg", "caption": "COLOR & TYPOGRAPHY TOKEN MATRIX"}, "image2": {"src": "/assets/projects/project-1/images/ds-2.jpg", "caption": "INTERACTIVE COMPONENT VARIANT STATES"}}]'::jsonb,
  '[]'::jsonb
),
(
  'project-4',
  'AI Design Tooling',
  'Vibe coding internal applications and speeding up our core design system to integrate seamlessly with custom AI agents and workflows.',
  'PRODUCT DESIGNER',
  '2026',
  5,
  '["10x faster prototyping workflows using generative AI models", "Built custom Figma-to-code pipelines for design tokens"]'::jsonb,
  '/assets/projects/project-1/hero/thumb4.jpg',
  '[{"id": "sec-1", "type": "full-width-image", "image1": {"src": "/assets/projects/project-1/images/ds-1.jpg", "caption": "AI AGENT WORKFLOW DASHBOARD"}}]'::jsonb,
  '[]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- 10. Insert seed visual feed items
INSERT INTO public.visual_feed (id, title, "aspectRatio", src, order_index)
VALUES
  ('feed-1', 'VISUAL EXPLORATION 01', 'aspect-[4/5]', '/assets/misc/placeholder.jpg', 1),
  ('feed-2', 'SYSTEM STUDY 02', 'aspect-[16/10]', '/assets/misc/placeholder.jpg', 2),
  ('feed-3', 'INTERFACE PROTOTYPE 03', 'aspect-[1/1]', '/assets/misc/placeholder.jpg', 3),
  ('feed-4', 'DESIGN TOKEN 04', 'aspect-[3/4]', '/assets/misc/placeholder.jpg', 4),
  ('feed-5', 'COMPONENT ARCHITECTURE 05', 'aspect-[4/3]', '/assets/misc/placeholder.jpg', 5),
  ('feed-6', 'MOBILE INTERACTION 06', 'aspect-[9/16]', '/assets/misc/placeholder.jpg', 6),
  ('feed-7', 'TYPOGRAPHIC SCALE 07', 'aspect-[1/1]', '/assets/misc/placeholder.jpg', 7),
  ('feed-8', 'MOTION PROTOTYPE 08', 'aspect-[16/9]', '/assets/misc/placeholder.jpg', 8),
  ('feed-9', 'ICONOGRAPHY SYSTEM 09', 'aspect-[4/5]', '/assets/misc/placeholder.jpg', 9),
  ('feed-10', 'SPATIAL INTERFACE 10', 'aspect-[16/10]', '/assets/misc/placeholder.jpg', 10),
  ('feed-11', 'SYSTEM ARCHIVE 11', 'aspect-[3/4]', '/assets/misc/placeholder.jpg', 11),
  ('feed-12', 'BRAND GUIDELINES 12', 'aspect-[1/1]', '/assets/misc/placeholder.jpg', 12)
ON CONFLICT (id) DO NOTHING;

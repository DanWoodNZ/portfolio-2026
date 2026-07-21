-- ==============================================================================
-- SUPABASE RLS FIX FOR ADMIN DASHBOARD PIN LOGIN & CRUD
-- ==============================================================================
-- Run this query in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
--
-- Why: If you log into your admin dashboard using the 4-digit PIN (or if your
-- Supabase auth token is expired), Supabase JS makes requests using the 'anon' role.
-- By default, RLS blocked 'anon' from inserting, updating, or deleting rows,
-- causing changes to silently fail and revert on reload.
-- This script updates RLS policies so both 'anon' and 'authenticated' roles can save changes.
-- ==============================================================================

-- 1. Update Projects table policies
DROP POLICY IF EXISTS "Allow admin full access on projects" ON public.projects;
CREATE POLICY "Allow admin full access on projects" ON public.projects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. Update Visual Feed table policies
DROP POLICY IF EXISTS "Allow admin full access on visual_feed" ON public.visual_feed;
CREATE POLICY "Allow admin full access on visual_feed" ON public.visual_feed FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 3. Update History Photos table policies
DROP POLICY IF EXISTS "Allow admin full access on history_photos" ON public.history_photos;
CREATE POLICY "Allow admin full access on history_photos" ON public.history_photos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Update Career Items table policies
DROP POLICY IF EXISTS "Allow admin full access on career_items" ON public.career_items;
CREATE POLICY "Allow admin full access on career_items" ON public.career_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. Update Education Items table policies
DROP POLICY IF EXISTS "Allow admin full access on education_items" ON public.education_items;
CREATE POLICY "Allow admin full access on education_items" ON public.education_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Migration: Disable RLS policies for local development
-- Purpose: Remove all RLS policies and disable RLS on profiles, flashcards, and generation_sessions
--          to allow easy read/write access during local development
-- Affected tables: profiles, flashcards, generation_sessions

-- ============================================================================
-- 1. DROP ALL POLICIES
-- ============================================================================

-- Drop profiles policies
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;

-- Drop flashcards policies
drop policy if exists flashcards_select_own on public.flashcards;
drop policy if exists flashcards_insert_own on public.flashcards;
drop policy if exists flashcards_update_own on public.flashcards;
drop policy if exists flashcards_delete_own on public.flashcards;

-- Drop generation_sessions policies
drop policy if exists generation_sessions_select_own on public.generation_sessions;
drop policy if exists generation_sessions_insert_own on public.generation_sessions;
drop policy if exists generation_sessions_update_own on public.generation_sessions;
drop policy if exists generation_sessions_delete_own on public.generation_sessions;

-- ============================================================================
-- 2. DISABLE ROW-LEVEL SECURITY
-- ============================================================================

alter table public.profiles disable row level security;
alter table public.flashcards disable row level security;
alter table public.generation_sessions disable row level security;

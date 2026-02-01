-- Migration: Create initial database schema for FiszkiAI MVP
-- Purpose: Implements complete database schema including tables, indexes, RLS policies, and triggers
-- Affected tables: profiles, flashcards, generation_sessions
-- Extensions: pg_trgm (for trigram-based text search)
-- Special considerations: 
--   - All tables reference auth.users (Supabase managed)
--   - RLS enabled on all user-accessible tables
--   - Automatic profile creation on user signup via trigger
--   - Automatic updated_at timestamp updates via trigger

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

-- Enable pg_trgm extension for trigram-based text search
-- Required for GIN indexes on flashcards text fields (sentence_en, translation_pl)
create extension if not exists pg_trgm;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 profiles table
-- ----------------------------------------------------------------------------
-- Extends Supabase's auth.users table to store user-specific metadata
-- One-to-one relationship with auth.users
-- Automatically created when user signs up (via trigger)
create table public.profiles (
    id uuid primary key not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profile extension table (1:1 with auth.users)';
comment on column public.profiles.id is 'User identifier, matches auth.users.id';
comment on column public.profiles.created_at is 'Account creation timestamp';
comment on column public.profiles.updated_at is 'Last profile update timestamp';

-- ----------------------------------------------------------------------------
-- 2.2 flashcards table
-- ----------------------------------------------------------------------------
-- Main entity storing user flashcards with English sentences and Polish translations
-- Many-to-one relationship with auth.users (one user has many flashcards)
-- Text fields use TEXT type (unlimited length); 200-character limit enforced at application level
create table public.flashcards (
    id uuid primary key not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    sentence_en text not null check (length(sentence_en) > 0),
    translation_pl text not null check (length(translation_pl) > 0),
    source varchar(20) not null default 'ai' check (source in ('ai', 'manual')),
    is_edited boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.flashcards is 'Main flashcard storage table with English sentences and Polish translations';
comment on column public.flashcards.id is 'Unique flashcard identifier';
comment on column public.flashcards.user_id is 'Owner of the flashcard';
comment on column public.flashcards.sentence_en is 'English sentence (front of card)';
comment on column public.flashcards.translation_pl is 'Polish translation (back of card)';
comment on column public.flashcards.source is 'Source of flashcard creation (ai or manual)';
comment on column public.flashcards.is_edited is 'Whether AI-generated card (source=ai) was edited by user';
comment on column public.flashcards.created_at is 'Creation timestamp';
comment on column public.flashcards.updated_at is 'Last update timestamp';

-- ----------------------------------------------------------------------------
-- 2.3 generation_sessions table
-- ----------------------------------------------------------------------------
-- Tracks flashcard generation batches for monitoring, retry logic, and partial failure handling
-- Many-to-one relationship with auth.users (one user has many sessions)
-- Supports tracking partial failures (status='partial')
-- Duration tracking for performance metrics (SLO: <= 20s for 30 sentences)
create table public.generation_sessions (
    id uuid primary key not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    input_sentences_count integer not null check (input_sentences_count >= 5 and input_sentences_count <= 30),
    generated_cards_count integer not null default 0 check (generated_cards_count >= 0),
    status varchar(20) not null default 'pending' check (status in ('pending', 'processing', 'completed', 'partial', 'failed')),
    error_message text,
    duration_ms integer check (duration_ms >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.generation_sessions is 'Tracks flashcard generation batches for monitoring and retry logic';
comment on column public.generation_sessions.id is 'Unique session identifier';
comment on column public.generation_sessions.user_id is 'User who initiated generation';
comment on column public.generation_sessions.input_sentences_count is 'Number of input sentences in batch (5-30)';
comment on column public.generation_sessions.generated_cards_count is 'Number of successfully generated flashcards';
comment on column public.generation_sessions.status is 'Current session status (pending, processing, completed, partial, failed)';
comment on column public.generation_sessions.error_message is 'Error details if generation failed';
comment on column public.generation_sessions.duration_ms is 'Generation duration in milliseconds';
comment on column public.generation_sessions.created_at is 'Session creation timestamp';
comment on column public.generation_sessions.updated_at is 'Last status update timestamp';

-- ============================================================================
-- 3. ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables immediately after creation
-- All policies are granular: one policy per operation (SELECT, INSERT, UPDATE, DELETE)
-- All policies use auth.uid() to ensure users only access their own data

alter table public.profiles enable row level security;
alter table public.flashcards enable row level security;
alter table public.generation_sessions enable row level security;

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- Indexes are created after table creation for better performance
-- All indexes are optimized for common query patterns

-- ----------------------------------------------------------------------------
-- 4.1 flashcards indexes
-- ----------------------------------------------------------------------------

-- Fast user-specific queries (RLS, list views)
create index idx_flashcards_user_id on public.flashcards(user_id);

-- Filter by AI vs manual cards
create index idx_flashcards_source on public.flashcards(source);

-- Sort by creation date
create index idx_flashcards_created_at on public.flashcards(created_at);

-- Composite index for filtered user queries
create index idx_flashcards_user_source on public.flashcards(user_id, source);

-- Full-text search on English sentences (GIN with pg_trgm)
create index idx_flashcards_text_search_en on public.flashcards using gin(sentence_en gin_trgm_ops);

-- Full-text search on Polish translations (GIN with pg_trgm)
create index idx_flashcards_text_search_pl on public.flashcards using gin(translation_pl gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- 4.2 generation_sessions indexes
-- ----------------------------------------------------------------------------

-- Fast user-specific session queries
create index idx_generation_sessions_user_id on public.generation_sessions(user_id);

-- Sort sessions by date
create index idx_generation_sessions_created_at on public.generation_sessions(created_at);

-- Filter by session status
create index idx_generation_sessions_status on public.generation_sessions(status);

-- Composite index for user's recent sessions
create index idx_generation_sessions_user_created on public.generation_sessions(user_id, created_at desc);

-- Note: profiles table uses primary key index (automatic, no additional index needed)

-- ============================================================================
-- 5. ROW-LEVEL SECURITY POLICIES
-- ============================================================================

-- All policies are granular: one policy per operation
-- All policies use auth.uid() to ensure users only access their own data
-- Policies are created for authenticated role only (as per db-plan specifications)

-- ----------------------------------------------------------------------------
-- 5.1 profiles policies
-- ----------------------------------------------------------------------------

-- Users can read their own profile
create policy profiles_select_own
    on public.profiles
    for select
    to authenticated
    using (id = auth.uid());

-- Users can create their own profile
create policy profiles_insert_own
    on public.profiles
    for insert
    to authenticated
    with check (id = auth.uid());

-- Users can update their own profile
create policy profiles_update_own
    on public.profiles
    for update
    to authenticated
    using (id = auth.uid())
    with check (id = auth.uid());

-- Users can delete their own profile
create policy profiles_delete_own
    on public.profiles
    for delete
    to authenticated
    using (id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.2 flashcards policies
-- ----------------------------------------------------------------------------

-- Users can read their own flashcards
create policy flashcards_select_own
    on public.flashcards
    for select
    to authenticated
    using (user_id = auth.uid());

-- Users can create flashcards for themselves
create policy flashcards_insert_own
    on public.flashcards
    for insert
    to authenticated
    with check (user_id = auth.uid());

-- Users can update their own flashcards
create policy flashcards_update_own
    on public.flashcards
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

-- Users can delete their own flashcards
create policy flashcards_delete_own
    on public.flashcards
    for delete
    to authenticated
    using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.3 generation_sessions policies
-- ----------------------------------------------------------------------------

-- Users can read their own sessions
create policy generation_sessions_select_own
    on public.generation_sessions
    for select
    to authenticated
    using (user_id = auth.uid());

-- Users can create sessions for themselves
create policy generation_sessions_insert_own
    on public.generation_sessions
    for insert
    to authenticated
    with check (user_id = auth.uid());

-- Users can update their own sessions
create policy generation_sessions_update_own
    on public.generation_sessions
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

-- Users can delete their own sessions
create policy generation_sessions_delete_own
    on public.generation_sessions
    for delete
    to authenticated
    using (user_id = auth.uid());

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 6.1 updated_at trigger function
-- ----------------------------------------------------------------------------
-- Automatically updates the updated_at timestamp on row updates
-- Applied to: profiles, flashcards, generation_sessions

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

comment on function public.handle_updated_at() is 'Automatically updates updated_at timestamp on row updates';

-- Apply updated_at trigger to profiles table
create trigger set_updated_at_profiles
    before update on public.profiles
    for each row
    execute function public.handle_updated_at();

-- Apply updated_at trigger to flashcards table
create trigger set_updated_at_flashcards
    before update on public.flashcards
    for each row
    execute function public.handle_updated_at();

-- Apply updated_at trigger to generation_sessions table
create trigger set_updated_at_generation_sessions
    before update on public.generation_sessions
    for each row
    execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6.2 profile creation trigger
-- ----------------------------------------------------------------------------
-- Automatically creates a profile when a user signs up
-- Trigger on auth.users INSERT to create corresponding profile record

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id)
    values (new.id);
    return new;
end;
$$;

comment on function public.handle_new_user() is 'Automatically creates profile when user signs up';

-- Apply profile creation trigger to auth.users table
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

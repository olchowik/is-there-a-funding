import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../db/database.types";
import type { FlashcardListResponseDTO, FlashcardResponseDTO } from "../../types";
import type { FlashcardQuerySchemaOutput } from "../validations/flashcard-query.schema";

/**
 * Flashcard service for handling flashcard-related database operations.
 * All methods require an authenticated Supabase client from context.locals.
 */

/**
 * Escapes special characters in a string for use in PostgreSQL ILIKE patterns.
 * Characters escaped: %, _, \
 *
 * @param input - The raw search string from user input
 * @returns The escaped string safe for use in ILIKE patterns
 */
function escapeILikePattern(input: string): string {
  return input
    .replace(/\\/g, "\\\\") // Escape backslashes first
    .replace(/%/g, "\\%") // Escape percent signs
    .replace(/_/g, "\\_"); // Escape underscores
}

/**
 * Retrieves a paginated list of flashcards for the authenticated user.
 * Supports filtering by source, full-text search, sorting, and pagination.
 *
 * @param supabase - Authenticated Supabase client from context.locals
 * @param userId - ID of the authenticated user
 * @param params - Validated query parameters (source, search, limit, offset, sort, order)
 * @returns FlashcardListResponseDTO with data array and pagination meta
 * @throws Error if database query fails
 */
export async function getFlashcards(
  supabase: SupabaseClient<Database>,
  userId: string,
  params: FlashcardQuerySchemaOutput
): Promise<FlashcardListResponseDTO> {
  const { source, search, limit, offset, sort, order } = params;

  // Build base query with count for pagination
  // RLS will automatically filter by user_id, but we add explicit filter for clarity
  let query = supabase
    .from("flashcards")
    .select(
      `
      id,
      sentence_en,
      translation_pl,
      source,
      is_edited,
      created_at,
      updated_at
    `,
      { count: "exact" }
    )
    .eq("user_id", userId);

  // Apply source filter if provided
  if (source) {
    query = query.eq("source", source);
  }

  // Apply search filter if provided
  // Uses ILIKE for case-insensitive pattern matching
  // GIN indexes with pg_trgm will optimize this query
  // Special characters (%, _, \) are escaped to prevent pattern injection
  if (search) {
    const escapedSearch = escapeILikePattern(search);
    const searchPattern = `%${escapedSearch}%`;
    query = query.or(`sentence_en.ilike.${searchPattern},translation_pl.ilike.${searchPattern}`);
  }

  // Apply sorting
  const ascending = order === "asc";
  query = query.order(sort, { ascending });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  // Execute query
  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch flashcards: ${error.message}`);
  }

  // Transform results to FlashcardResponseDTO (user_id already excluded in select)
  const flashcards: FlashcardResponseDTO[] = data ?? [];

  // Construct response with pagination metadata
  const response: FlashcardListResponseDTO = {
    data: flashcards,
    meta: {
      total: count ?? 0,
      limit,
      offset,
    },
  };

  return response;
}

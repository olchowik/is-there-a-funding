import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types";

// ============================================================================
// Supporting Types
// ============================================================================

/**
 * Flashcard source type - matches database CHECK constraint
 */
export type FlashcardSource = "ai" | "manual";

/**
 * Generation session status - matches database CHECK constraint
 */
export type GenerationSessionStatus = "pending" | "processing" | "completed" | "partial" | "failed";

/**
 * Flashcard sort field options
 */
export type FlashcardSortField = "created_at" | "updated_at";

/**
 * Sort order options
 */
export type SortOrder = "asc" | "desc";

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// Flashcard DTOs
// ============================================================================

/**
 * Flashcard response DTO - represents a flashcard in API responses
 * Derived from flashcards table Row, excluding user_id (not exposed in API)
 */
export type FlashcardResponseDTO = Omit<Tables<"flashcards">, "user_id">;

/**
 * Flashcard list response DTO - wrapper for paginated flashcard lists
 */
export interface FlashcardListResponseDTO {
  data: FlashcardResponseDTO[];
  meta: PaginationMeta;
}

/**
 * Create flashcard command - request payload for POST /api/flashcards
 * Derived from flashcards table Insert, picking only user-provided fields
 */
export type CreateFlashcardCommand = Pick<TablesInsert<"flashcards">, "sentence_en" | "translation_pl">;

/**
 * Update flashcard command - request payload for PUT /api/flashcards/:id
 * Derived from flashcards table Update, picking only user-provided fields
 */
export type UpdateFlashcardCommand = Pick<TablesUpdate<"flashcards">, "sentence_en" | "translation_pl">;

/**
 * Flashcard query parameters - filtering and pagination options for GET /api/flashcards
 */
export interface FlashcardQueryParams {
  source?: FlashcardSource;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: FlashcardSortField;
  order?: SortOrder;
}

// ============================================================================
// Generation DTOs
// ============================================================================

/**
 * Generate flashcards command - request payload for POST /api/generate
 * Contains array of input sentences for AI translation
 */
export interface GenerateFlashcardsCommand {
  sentences: string[];
}

/**
 * Generate flashcards response DTO - response payload for POST /api/generate
 * Combines generation session metadata with generated flashcards
 */
export interface GenerateFlashcardsResponseDTO {
  session_id: string;
  status: GenerationSessionStatus;
  flashcards: FlashcardResponseDTO[];
  generated_count: number;
  failed_count: number;
  duration_ms: number | null;
}

// ============================================================================
// Profile DTOs
// ============================================================================

/**
 * Profile response DTO - response payload for GET /api/profile
 * Derived directly from profiles table Row type
 */
export type ProfileResponseDTO = Tables<"profiles">;

// ============================================================================
// Entity Types (for internal use)
// ============================================================================

/**
 * Flashcard entity - full database row including user_id
 * Use this for internal operations where user_id is needed
 */
export type FlashcardEntity = Tables<"flashcards">;

/**
 * Generation session entity - full database row
 * Use this for internal operations
 */
export type GenerationSessionEntity = Tables<"generation_sessions">;

/**
 * Profile entity - full database row
 * Use this for internal operations
 */
export type ProfileEntity = Tables<"profiles">;

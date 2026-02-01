import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../db/database.types";

/**
 * Daily Generation Limit Service
 *
 * This service provides functionality to check and enforce daily generation limits
 * per user. The limit is 100 sentences per day (per PRD FR-016).
 *
 * Usage example in a POST /api/generate endpoint:
 *
 * ```typescript
 * import { checkDailyGenerationLimit } from "../../../lib/services/generation-limit.service";
 * import { tooManyRequestsResponse } from "../../../lib/errors";
 *
 * // In your endpoint handler:
 * const sentenceCount = sentences.length;
 * const limitCheck = await checkDailyGenerationLimit(supabase, user.id, sentenceCount);
 *
 * if (limitCheck.limitExceeded) {
 *   return tooManyRequestsResponse(
 *     `Daily limit exceeded. You have used ${limitCheck.usedToday}/${limitCheck.limit} sentences today. ` +
 *     `You can generate ${limitCheck.remaining} more sentences today.`
 *   );
 * }
 *
 * // Proceed with generation...
 * ```
 */

/**
 * Daily generation limit per user (in sentences).
 * Per PRD FR-016: 100 sentences per user per day.
 */
export const DAILY_GENERATION_LIMIT = 100;

/**
 * Result of checking daily generation limit.
 */
export interface DailyLimitCheckResult {
  /**
   * Whether the limit has been exceeded
   */
  limitExceeded: boolean;
  /**
   * Number of sentences already generated today
   */
  usedToday: number;
  /**
   * Daily limit (sentences per day)
   */
  limit: number;
  /**
   * Number of sentences remaining today
   */
  remaining: number;
  /**
   * Number of sentences that would be requested
   */
  requestedCount: number;
}

/**
 * Checks if the user has exceeded their daily generation limit.
 * Queries generation_sessions table for all sessions created today and sums input_sentences_count.
 *
 * @param supabase - Authenticated Supabase client from context.locals
 * @param userId - ID of the authenticated user
 * @param requestedCount - Number of sentences the user wants to generate (for validation)
 * @returns DailyLimitCheckResult with limit status and usage information
 * @throws Error if database query fails
 */
export async function checkDailyGenerationLimit(
  supabase: SupabaseClient<Database>,
  userId: string,
  requestedCount: number
): Promise<DailyLimitCheckResult> {
  // Get start and end of today in UTC
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);

  // Query all generation sessions created today for this user
  // Sum input_sentences_count to get total sentences generated today
  const { data, error } = await supabase
    .from("generation_sessions")
    .select("input_sentences_count")
    .eq("user_id", userId)
    .gte("created_at", startOfToday.toISOString())
    .lt("created_at", startOfTomorrow.toISOString());

  if (error) {
    throw new Error(`Failed to check daily generation limit: ${error.message}`);
  }

  // Sum up all input_sentences_count from today's sessions
  const usedToday = data?.reduce((sum, session) => sum + session.input_sentences_count, 0) ?? 0;

  // Calculate remaining and check if limit would be exceeded
  const remaining = Math.max(0, DAILY_GENERATION_LIMIT - usedToday);
  const wouldExceed = usedToday + requestedCount > DAILY_GENERATION_LIMIT;

  return {
    limitExceeded: wouldExceed,
    usedToday,
    limit: DAILY_GENERATION_LIMIT,
    remaining,
    requestedCount,
  };
}

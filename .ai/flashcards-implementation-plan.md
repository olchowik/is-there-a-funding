# API Endpoint Implementation Plan: GET /api/flashcards

## 1. Endpoint Overview

The GET /api/flashcards endpoint retrieves a paginated list of flashcards for the authenticated user. It supports optional filtering by source type, full-text search across English sentences and Polish translations, pagination, and sorting. The endpoint leverages PostgreSQL GIN indexes with trigram search for efficient text matching and uses Row-Level Security (RLS) to ensure users can only access their own flashcards.

**Purpose**: Provide authenticated users with a flexible way to query, filter, search, and paginate through their flashcard collection.

**Key Features**:
- User-scoped data access (enforced by RLS)
- Optional filtering by source (`ai` or `manual`)
- Full-text search using PostgreSQL trigram indexes
- Pagination with configurable limits
- Sorting by creation or update date
- Efficient querying with database indexes

## 2. Request Details

- **HTTP Method**: `GET`
- **URL Structure**: `/api/flashcards`
- **Query Parameters**:
  - **Required**: None
  - **Optional**:
    - `source` (string): Filter by source type. Valid values: `'ai'` or `'manual'`. Case-sensitive.
    - `search` (string): Search term to match against `sentence_en` or `translation_pl` fields. Uses PostgreSQL trigram similarity search with GIN indexes for performance.
    - `limit` (number): Maximum number of results to return. Default: `100`. Maximum: `500`. Must be a positive integer.
    - `offset` (number): Number of records to skip for pagination. Default: `0`. Must be a non-negative integer.
    - `sort` (string): Field to sort by. Valid values: `'created_at'` or `'updated_at'`. Default: `'created_at'`.
    - `order` (string): Sort order direction. Valid values: `'asc'` or `'desc'`. Default: `'desc'`.
- **Request Body**: None
- **Headers**: 
  - `Authorization: Bearer <JWT_TOKEN>` (required for authentication)

## 3. Used Types

### DTOs and Command Models

- **`FlashcardQueryParams`** (from `src/types.ts`): Type for query parameters with optional fields for filtering, search, pagination, and sorting.
- **`FlashcardResponseDTO`** (from `src/types.ts`): Type for individual flashcard in response. Derived from `Tables<'flashcards'>` excluding `user_id`.
- **`FlashcardListResponseDTO`** (from `src/types.ts`): Type for the complete response structure containing `data` array and `meta` pagination object.
- **`PaginationMeta`** (from `src/types.ts`): Type for pagination metadata containing `total`, `limit`, and `offset`.
- **`FlashcardSource`** (from `src/types.ts`): Literal union type `'ai' | 'manual'` for source validation.
- **`FlashcardSortField`** (from `src/types.ts`): Literal union type `'created_at' | 'updated_at'` for sort field validation.
- **`SortOrder`** (from `src/types.ts`): Literal union type `'asc' | 'desc'` for sort order validation.

### Internal Types

- **`FlashcardEntity`** (from `src/types.ts`): Full database row type including `user_id` for internal database operations.
- **`SupabaseClient`** (from `src/db/supabase.client.ts`): Type for Supabase client instance.

## 4. Response Details

### Success Response (200 OK)

**Structure**:
```json
{
  "data": [
    {
      "id": "uuid",
      "sentence_en": "string",
      "translation_pl": "string",
      "source": "ai" | "manual",
      "is_edited": boolean,
      "created_at": "ISO 8601 timestamp",
      "updated_at": "ISO 8601 timestamp"
    }
  ],
  "meta": {
    "total": number,
    "limit": number,
    "offset": number
  }
}
```

**Fields**:
- `data`: Array of `FlashcardResponseDTO` objects. Empty array if no flashcards match the query.
- `meta.total`: Total number of flashcards matching the query (before pagination).
- `meta.limit`: Applied limit value (default or provided).
- `meta.offset`: Applied offset value (default or provided).

**Status Codes**:
- `200 OK`: Successfully retrieved flashcards (even if array is empty).

### Error Responses

- **`401 Unauthorized`**: User not authenticated or invalid JWT token.
  - Response: `{ "error": "Unauthorized" }`
- **`400 Bad Request`**: Invalid query parameter values (e.g., invalid `source`, `sort`, `order`, negative `limit`/`offset`, `limit` > 500).
  - Response: `{ "error": "Bad Request", "message": "Validation error details" }`
- **`500 Internal Server Error`**: Database error, server error, or unexpected exception.
  - Response: `{ "error": "Internal Server Error" }`

## 5. Data Flow

1. **Request Reception**: Astro API route handler receives GET request at `/api/flashcards`.

2. **Authentication Check**: Middleware (`src/middleware/index.ts`) validates JWT token via `context.locals.supabase.auth.getUser()`. If invalid or missing, return `401 Unauthorized`.

3. **User Extraction**: Extract `user_id` from authenticated session (`auth.getUser().data.user?.id`).

4. **Query Parameter Parsing**: Parse and validate query parameters from `Astro.url.searchParams`:
   - Extract `source`, `search`, `limit`, `offset`, `sort`, `order`
   - Apply defaults: `limit = 100`, `offset = 0`, `sort = 'created_at'`, `order = 'desc'`
   - Validate parameter values using Zod schema

5. **Query Construction**: Build Supabase query using `context.locals.supabase`:
   - Base query: `.from('flashcards').select('*', { count: 'exact' })`
   - Apply RLS filter: `.eq('user_id', userId)` (implicit via RLS, but explicit for clarity)
   - Apply source filter: `.eq('source', source)` if `source` provided
   - Apply search filter: Use `.or()` with `.ilike()` on `sentence_en` and `translation_pl` if `search` provided
   - Apply sorting: `.order(sort, { ascending: order === 'asc' })`
   - Apply pagination: `.range(offset, offset + limit - 1)`

6. **Database Query Execution**: Execute query against PostgreSQL database. RLS policies ensure user can only access their own flashcards.

7. **Response Construction**: Transform database results:
   - Map rows to `FlashcardResponseDTO` (exclude `user_id` field)
   - Construct `PaginationMeta` from count and applied parameters
   - Combine into `FlashcardListResponseDTO`

8. **Response Return**: Return JSON response with status `200 OK`.

## 6. Security Considerations

### Authentication
- **JWT Token Validation**: All requests must include valid Supabase JWT token in `Authorization` header.
- **Middleware Enforcement**: Authentication checked in Astro middleware before route handler execution.
- **Token Extraction**: Use `context.locals.supabase.auth.getUser()` to validate and extract user information.

### Authorization
- **Row-Level Security (RLS)**: Database-level enforcement ensures users can only access flashcards where `user_id = auth.uid()`.
- **RLS Policies**: `flashcards_select_own` policy enforces `user_id = auth.uid()` for SELECT operations.
- **API-Level Filtering**: Explicitly filter by `user_id` in queries for additional safety (defense in depth).

### Input Validation
- **Query Parameter Validation**: Validate all query parameters using Zod schema:
  - `source`: Must be `'ai'` or `'manual'` (case-sensitive)
  - `limit`: Must be positive integer, maximum 500
  - `offset`: Must be non-negative integer
  - `sort`: Must be `'created_at'` or `'updated_at'`
  - `order`: Must be `'asc'` or `'desc'`
  - `search`: Sanitize to prevent SQL injection (Supabase handles this, but validate length)
- **Type Safety**: Use TypeScript types and Zod schemas to ensure type correctness.

### Data Exposure
- **User ID Exclusion**: Never expose `user_id` in API responses (excluded via `Omit` in `FlashcardResponseDTO`).
- **Error Messages**: Return generic error messages to clients; log detailed errors server-side only.

### SQL Injection Prevention
- **Parameterized Queries**: Supabase client uses parameterized queries, preventing SQL injection.
- **No Raw SQL**: Avoid raw SQL queries; use Supabase query builder methods.

### Rate Limiting
- **Consideration**: Implement rate limiting at middleware level to prevent abuse (not in MVP scope, but recommended for production).

## 7. Error Handling

### Error Scenarios and Status Codes

1. **401 Unauthorized**
   - **Cause**: Missing or invalid JWT token, expired token, or user not authenticated.
   - **Handling**: Middleware intercepts and returns `401` before route handler execution.
   - **Response**: `{ "error": "Unauthorized" }`
   - **Logging**: Log authentication failures (without sensitive token data).

2. **400 Bad Request**
   - **Causes**:
     - Invalid `source` value (not `'ai'` or `'manual'`)
     - Invalid `sort` value (not `'created_at'` or `'updated_at'`)
     - Invalid `order` value (not `'asc'` or `'desc'`)
     - `limit` is not a positive integer or exceeds 500
     - `offset` is not a non-negative integer
     - Query parameter type mismatch (e.g., `limit` is a string that cannot be parsed to number)
   - **Handling**: Validate query parameters with Zod schema before database query. Return `400` with validation error details.
   - **Response**: `{ "error": "Bad Request", "message": "Invalid query parameter: [parameter name]" }`
   - **Logging**: Log validation errors with parameter values (sanitized).

3. **500 Internal Server Error**
   - **Causes**:
     - Database connection error
     - Supabase client error
     - Unexpected exception in route handler
     - Query execution failure
   - **Handling**: Catch all exceptions, log detailed error information, return generic error message to client.
   - **Response**: `{ "error": "Internal Server Error" }`
   - **Logging**: Log full error stack trace and context for debugging.

### Error Handling Implementation

- **Early Returns**: Use guard clauses to handle error conditions early (per coding practices).
- **Try-Catch Blocks**: Wrap database operations in try-catch blocks.
- **Error Logging**: Log errors with context (user_id, query parameters, error details) for debugging.
- **User-Friendly Messages**: Return generic error messages to clients; detailed errors only in logs.

## 8. Performance Considerations

### Database Optimization

1. **Indexes**: Leverage existing database indexes for efficient queries:
   - `idx_flashcards_user_id`: Fast user-specific queries (RLS enforcement)
   - `idx_flashcards_source`: Efficient filtering by source
   - `idx_flashcards_user_source`: Composite index for filtered user queries
   - `idx_flashcards_created_at`: Efficient sorting by creation date
   - `idx_flashcards_text_search_en` and `idx_flashcards_text_search_pl`: GIN indexes for trigram search

2. **Query Optimization**:
   - Use `count: 'exact'` option in Supabase select to get total count efficiently.
   - Apply filters before sorting and pagination to reduce dataset size.
   - Use `.range()` for pagination instead of fetching all records.

3. **Search Performance**:
   - For `search` parameter, use `.ilike()` with GIN index support (trigram indexes enable efficient pattern matching).
   - Consider using PostgreSQL `similarity()` function if more advanced fuzzy search is needed (future enhancement).

### Caching Considerations

- **No Caching**: MVP does not implement caching. Consider adding Redis cache for frequently accessed queries in future iterations.
- **Cache Invalidation**: If caching is added, invalidate on flashcard create/update/delete operations.

### Pagination Limits

- **Default Limit**: 100 records prevents excessive data transfer.
- **Maximum Limit**: 500 records prevents abuse and database overload.
- **Offset-Based Pagination**: Current implementation uses offset-based pagination. For large datasets, consider cursor-based pagination (future enhancement).

### Response Size

- **Data Minimization**: Only return necessary fields (exclude `user_id`).
- **Pagination**: Limit response size through pagination parameters.

## 9. Implementation Steps

1. **Create Zod Validation Schema**
   - Create `src/lib/validations/flashcard-query.schema.ts`
   - Define schema for `FlashcardQueryParams` with validation rules:
     - `source`: Optional, enum `['ai', 'manual']`
     - `search`: Optional, string, max length validation
     - `limit`: Optional, number, min 1, max 500, default 100
     - `offset`: Optional, number, min 0, default 0
     - `sort`: Optional, enum `['created_at', 'updated_at']`, default `'created_at'`
     - `order`: Optional, enum `['asc', 'desc']`, default `'desc'`

2. **Create Flashcard Service**
   - Create `src/lib/services/flashcard.service.ts`
   - Implement `getFlashcards()` function:
     - Accept `FlashcardQueryParams` and `userId: string`
     - Build Supabase query with filters, search, sorting, and pagination
     - Execute query with count
     - Transform results to `FlashcardResponseDTO[]`
     - Return `FlashcardListResponseDTO` with data and meta

3. **Create API Route Handler**
   - Create `src/pages/api/flashcards/index.astro`
   - Add `export const prerender = false`
   - Implement GET handler:
     - Extract user from `context.locals.supabase.auth.getUser()`
     - Return `401` if user not authenticated
     - Parse query parameters from `Astro.url.searchParams`
     - Validate query parameters using Zod schema
     - Return `400` if validation fails
     - Call `flashcardService.getFlashcards()` with validated params and userId
     - Handle errors and return appropriate status codes
     - Return `200` with `FlashcardListResponseDTO` JSON response

4. **Implement Search Logic**
   - In `flashcard.service.ts`, implement search functionality:
     - If `search` parameter provided, use `.or()` with `.ilike()` on both `sentence_en` and `translation_pl`
     - Use pattern: `%${search}%` for partial matching
     - Leverage GIN indexes for performance

5. **Add Error Handling**
   - Wrap database operations in try-catch blocks
   - Log errors with context (userId, query params, error details)
   - Return appropriate HTTP status codes
   - Return user-friendly error messages

6. **Test Implementation**
   - Test with valid query parameters
   - Test with missing query parameters (defaults)
   - Test with invalid query parameters (validation errors)
   - Test with unauthenticated request (401)
   - Test with empty result set
   - Test pagination (limit, offset)
   - Test filtering (source)
   - Test search functionality
   - Test sorting (sort, order)
   - Test edge cases (limit=500, offset at end of dataset)

7. **Add Type Safety**
   - Ensure all types are imported from `src/types.ts`
   - Use `SupabaseClient` type from `src/db/supabase.client.ts`
   - Verify TypeScript compilation passes without errors

8. **Code Review and Refinement**
   - Review code against coding practices (early returns, guard clauses, error handling)
   - Ensure RLS is working correctly (test with different users)
   - Verify performance with realistic data volumes
   - Check linter errors and fix if any

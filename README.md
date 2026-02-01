# FiszkiAI

**Proof of Concept (POC)** - An automated flashcard generation web application for Polish speakers learning English.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [MVP Status](#mvp-status)
- [License](#license)

## Project Description

FiszkiAI is a web application that automates the creation of English flashcards for Polish-speaking users. Users can paste a set of sentences, and the system generates corresponding flashcards (English sentence + Polish translation). Users can then view, filter, edit, and delete flashcards, which are stored on their user account.

### Key Features

- **Automated Flashcard Generation**: Paste sentences (one per line) and generate flashcards automatically using AI
- **User Account Management**: Secure authentication and flashcard storage per user
- **Flashcard Management**: View, filter, edit, and delete flashcards
- **Input Validation**: Enforces 5-30 sentences per generation session with a maximum of 200 characters per line
- **Quality Control**: Basic validation ensures generated flashcards meet minimum quality standards

### Target Users

Self-directed Polish learners of English who:
- Have their own sentences (from notes, courses, or work)
- Want to quickly convert them into flashcards
- Accept minor edits to only selected flashcards

### Core Workflow

Paste sentences → Generate flashcards → Quickly fix exceptions → Save and return to list

## Tech Stack

### Frontend

- **[Astro](https://astro.build/)** v5 - Fast, modern web framework for building content-focused websites with minimal JavaScript
- **[React](https://react.dev/)** v19 - UI library for building interactive components
- **[TypeScript](https://www.typescriptlang.org/)** v5 - Type-safe JavaScript with enhanced IDE support
- **[Tailwind CSS](https://tailwindcss.com/)** v4 - Utility-first CSS framework for rapid styling
- **[Shadcn/ui](https://ui.shadcn.com/)** - Accessible React component library built on Radix UI

### Backend

- **[Supabase](https://supabase.com/)** - Backend-as-a-Service providing:
  - PostgreSQL database
  - User authentication (email/password and magic link)
  - Row-level security for data access
  - Multi-language SDK support
  - Open source, can be self-hosted

### AI

- **[OpenRouter.ai](https://openrouter.ai/)** - AI model gateway providing:
  - Access to multiple AI models (OpenAI, Anthropic, Google, and others)
  - Cost-effective model selection
  - Financial limits on API keys

### CI/CD & Hosting

- **[GitHub Actions](https://github.com/features/actions)** - CI/CD pipeline automation
- **[DigitalOcean](https://www.digitalocean.com/)** - Application hosting via Docker containers

## Getting Started Locally

### Prerequisites

- **Node.js** v22.14.0 (as specified in `.nvmrc`)
- **npm** (comes with Node.js)
- **Supabase** account or local instance
- **OpenRouter.ai** API key

### Installation Steps

1. **Clone the repository:**

```bash
git clone <repository-url>
cd is-there-a-funding
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the project root with the following variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

**Note:** You'll need to:
- Set up a Supabase project (cloud or local) and obtain your project URL and anon key
- Create an OpenRouter.ai account and generate an API key

4. **Run the development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:4321` (or the port specified by Astro).

5. **Build for production:**

```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start the development server with hot module replacement
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Automatically fix ESLint issues where possible
- `npm run format` - Format code using Prettier

## Project Scope

### In Scope (POC)

This Proof of Concept focuses on demonstrating:

- ✅ **Flashcard Generation**: PL-EN flashcard generation based on sentences (one sentence per line)
- ✅ **User Account Management**: User registration, login, and session management
- ✅ **Flashcard Storage**: Persistent storage of flashcards on user accounts
- ✅ **Flashcard List**: View all user flashcards with filtering/search functionality
- ✅ **Flashcard Management**: Edit and delete flashcards
- ✅ **Input Validation**: Enforce limits (5-30 sentences, 200 characters per line)
- ✅ **Quality Validation**: Basic checks to ensure generated flashcards meet minimum standards
- ✅ **Rate Limiting**: Daily generation limits and rate limiting on generation endpoints
- ✅ **Web-only**: Desktop and mobile web browsers

### Out of Scope (POC)

The following features are explicitly excluded from this POC:

- ❌ Advanced spaced repetition algorithms (e.g., SuperMemo, Anki)
- ❌ File imports (PDF, DOCX, etc.)
- ❌ Sharing flashcard sets between users
- ❌ Integrations with other educational platforms
- ❌ Native mobile applications
- ❌ Multi-set functionality, tags, difficulty levels
- ❌ Audio pronunciation or IPA (International Phonetic Alphabet)
- ❌ Change history/versioning of flashcards

## Project Status

This project is currently in **Proof of Concept (POC)** phase. The POC aims to demonstrate:

1. **Generation Efficiency**: Users can generate most flashcards in minutes without needing to edit them
2. **Generation Quality**: The quality of AI-generated flashcards is sufficient for typical user sentences
3. **Stability**: Basic flashcard management (list, edit, delete) works reliably

### Success Metrics

The POC will be considered successful if:

- **Quality Metric**: At least 75% of AI-generated flashcards are not edited by users
- **Adoption Metric**: Users create at least 75% of flashcards using AI generation
- **Performance Metric**: Median generation time ≤ 20 seconds for 30 sentences
- **Stability Metric**: Less than 5% of generation sessions end in errors

## MVP Status

**Project Status: 6/6 (100%)** ✅

FiszkiAI is a flashcard generation web application for Polish-English language learning. The project includes complete authentication functionality (Supabase), full CRUD operations for flashcards, comprehensive business logic for AI generation with daily limits and validation, extensive testing coverage (unit and E2E), CI/CD pipeline via GitHub Actions, and complete documentation (README and PRD). All 6 MVP criteria are satisfied.

### MVP Criteria Checklist

- ✅ **Documentation (README + PRD)**: Comprehensive README and detailed PRD with functional requirements
- ✅ **Login functionality**: Full authentication system with Supabase (email/password, session management)
- ✅ **Test presence**: Unit tests (Vitest) and E2E tests (Playwright) covering core functionality
- ✅ **Data management**: Complete CRUD operations with Supabase integration and database migrations
- ✅ **Business logic**: Daily generation limits, input validation, quality validation, and rate limiting
- ✅ **CI/CD configuration**: GitHub Actions workflow with automated testing, linting, and build verification

## License

MIT

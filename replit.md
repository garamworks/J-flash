# J-Flash Japanese Flashcard Application

## Overview

J-Flash is a full-stack Japanese language learning application built with React and Express. It provides interactive flashcards for learning Japanese vocabulary, kanji, and phrases with Korean translations. The application uses a modern tech stack with TypeScript, Tailwind CSS, and Radix UI components for a polished user experience.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Database**: PostgreSQL with Drizzle ORM
- **External Services**: Notion API for content management
- **Session Management**: Express sessions with PostgreSQL storage
- **Build Process**: ESBuild for server bundling

## Key Components

### Data Layer
- **Database Schema**: Defined in `shared/schema.ts` with Drizzle ORM
  - `flashcards` table: Stores Japanese words, furigana, Korean translations, example sentences, and media URLs
  - `userProgress` table: Tracks user learning progress (known/unknown status)
  - `users` table: User authentication and profile data
- **Notion Integration**: Content management through Notion databases for flashcard data

### API Layer
- **REST Endpoints**: 
  - `GET /api/flashcards` - Retrieve flashcards with filtering and sorting
  - `GET /api/flashcards/:id` - Get specific flashcard
  - `POST /api/progress` - Record user learning progress
  - `GET /api/progress` - Retrieve user progress statistics
- **Validation**: Zod schemas for request/response validation

### Frontend Components
- **Flashcard Component**: Interactive card display with furigana rendering and audio playback
- **Progress Tracking**: Visual progress indicators and statistics
- **Level Selection**: JLPT level-based content filtering (N1-N5, Hiragana/Katakana)
- **Mobile Responsive**: Optimized for mobile learning experience

## Data Flow

1. **Content Management**: Flashcard data is managed through Notion databases
2. **Data Synchronization**: Server fetches content from Notion API and stores in PostgreSQL
3. **User Interaction**: Frontend requests flashcards through REST API
4. **Progress Tracking**: User interactions are recorded and progress is calculated
5. **Personalization**: Content is filtered based on user progress and preferences

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Content Management**: Notion API for flashcard content
- **UI Framework**: Radix UI for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Query Management**: TanStack Query for server state

### Development Tools
- **TypeScript**: Type safety across the stack
- **Vite**: Fast development server and build tool
- **ESBuild**: Fast JavaScript bundler for production
- **Drizzle Kit**: Database migration and schema management

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React application to `dist/public`
2. **Backend Build**: ESBuild bundles Express server to `dist/index.js`
3. **Database Migration**: Drizzle push command applies schema changes

### Environment Configuration
- **Development**: Uses tsx for server execution with hot reload
- **Production**: Runs compiled JavaScript with NODE_ENV=production
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Notion**: Integration requires NOTION_INTEGRATION_SECRET and NOTION_PAGE_URL

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database access
- Environment variables for external service configuration

## Changelog

```
Changelog:
- July 05, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
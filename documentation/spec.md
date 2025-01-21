# HyperAgent.so — Product & Technical Specification

## 1. Product Overview

**HyperAgent.so** is an AI-powered platform for **public figures (celebrities)** and their **teams** to manage inbound opportunities efficiently. Key goals include:

- **Multi-Channel Opportunity Collection**: Collect opportunities through Twitter DMs and embeddable chat widget
- **AI-Driven Classification**: Automatically classify and score opportunities using Perplexity AI
- **Team Collaboration**: Multiple users can access a single celebrity's opportunities. Each user has a specific role (e.g., "admin," "support_agent," "celebrity")
- **Audit Trail**: Track status changes, message replies, and any scoring overrides
- **Scalability**: Handle thousands of inbound opportunities per day

---

## 2. High-Level Architecture

1. **Next.js Frontend**
    - **TypeScript** + **App Router**
    - **React Query** for data fetching and caching
    - **Tailwind CSS** + **shadcn/ui** for styling
    - **Dark mode by default**, light mode planned
    - Deployed via **Vercel**

2. **Supabase Backend**
    - **Database** for storing users, celebrities, opportunities
    - **Supabase Auth** for handling sign-in (email/password)
    - **Edge Functions** for AI logic (classify opportunities)
    - **Row Level Security** for data protection
    - Deployed on **Supabase** infrastructure

3. **Chat Widget**
    - Standalone JavaScript bundle embeddable on any website
    - Uses **Preact** for lightweight rendering
    - **Shadow DOM** for style isolation
    - Configurable themes and positioning
    - Direct integration with opportunity system

4. **Classification System**
    - **Perplexity AI** for opportunity classification
    - Automatic scoring on a scale of -1 to 5 (-1 = unclassified)
    - Goal matching and relevance scoring
    - Classification explanation storage

---

## 3. Data Model & Relationships

### 3.1 **Celebrities Table**

| Column | Type | Description |
| --- | --- | --- |
| `id` (PK) | UUID | Unique identifier for the celebrity entity |
| `celebrity_name` | VARCHAR | e.g., "MrBeast" or "Gary Sheng" |
| `twitter_username` | VARCHAR | e.g., "@garysheng" |
| `created_at` | TIMESTAMP | Defaults to `now()` |

### 3.2 **Goals Table**

| Column | Type | Description |
| --- | --- | --- |
| `id` (PK) | UUID | Unique identifier for the goal |
| `celebrity_id` (FK) | UUID | References `celebrities.id` |
| `name` | VARCHAR | Name of the goal (e.g., "Sponsorships") |
| `description` | TEXT | Detailed description of the goal |
| `priority` | INT | Optional ordering/priority of goals |
| `created_at` | TIMESTAMP | Defaults to `now()` |

### 3.3 **Users Table**

| Column | Type | Description |
| --- | --- | --- |
| `id` (PK) | UUID | Supabase Auth user ID |
| `celebrity_id` | UUID | FK referencing `celebrities.id` |
| `email` | VARCHAR | Email address for sign-in |
| `role` | VARCHAR | e.g., "admin", "support_agent", "celebrity" |
| `full_name` | VARCHAR | Display name of the user |
| `created_at` | TIMESTAMP | Defaults to `now()` |

### 3.4 **Opportunities Table**

| Column | Type | Description |
| --- | --- | --- |
| `id` (PK) | UUID | Unique identifier for the opportunity |
| `celebrity_id` (FK) | UUID | Points to which celebrity this belongs to |
| `goal_id` (FK) | UUID | References the matched goal (if any) |
| `sender_handle` | VARCHAR | Email or handle of sender |
| `initial_content` | TEXT | Initial message content |
| `relevance_score` | INT | Score from -1 to 5 (-1 = unclassified) |
| `classification_explanation` | TEXT | AI's explanation for classification |
| `classified_at` | TIMESTAMP | When the opportunity was classified |
| `tags` | JSONB | AI or user-assigned tags |
| `status` | VARCHAR | "pending", "approved", "rejected", "on_hold" |
| `created_at` | TIMESTAMP | Defaults to `now()` |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `assigned_to` | UUID | UUID of team member assigned |
| `needs_discussion` | BOOLEAN | Flag for team discussion |
| `relevance_override_explanation` | TEXT | Explanation when overriding AI score |
| `relevance_override_by` | UUID | User who overrode the score |
| `relevance_override_at` | TIMESTAMP | When score was overridden |
| `status_updated_by` | UUID | User who last updated status |
| `status_updated_at` | TIMESTAMP | When status was last updated |

### 3.5 **Opportunity Messages**

| Column | Type | Description |
| --- | --- | --- |
| `id` (PK) | UUID | Unique identifier for each message |
| `opportunity_id` (FK) | UUID | Links to opportunities.id |
| `sender_id` (FK) | UUID | References user who sent it (if outbound) |
| `sender_handle` | VARCHAR | Email or handle of sender |
| `message_content` | TEXT | Actual message text |
| `direction` | VARCHAR | "inbound" or "outbound" |
| `created_at` | TIMESTAMP | Defaults to `now()` |

### 3.6 **Opportunity Actions** (Audit Log)

| Column | Type | Description |
| --- | --- | --- |
| `id` (PK) | UUID | Unique identifier for the audit log entry |
| `opportunity_id` (FK) | UUID | Links to the relevant Opportunity |
| `user_id` (FK) | UUID | The user who performed the action |
| `action_type` | VARCHAR | e.g., "status_change", "score_override" |
| `old_value` | JSONB | Prior state |
| `new_value` | JSONB | New state |
| `created_at` | TIMESTAMP | Defaults to `now()` |

### 3.7 **Opportunity Comments**

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `opportunity_id` | UUID | References opportunities table |
| `user_id` | UUID | UUID of comment author |
| `content` | TEXT | Text content of comment |
| `created_at` | TIMESTAMP | Timestamp of creation |
| `updated_at` | TIMESTAMP | Timestamp of last update |

---

## 4. Chat Widget Integration

### 4.1 Architecture
- Standalone JavaScript bundle
- Shadow DOM for style isolation
- Configurable through data attributes
- Direct integration with opportunities system

### 4.2 Implementation
```html
<script 
  src="/api/widget/v1.js" 
  data-celebrity-id="YOUR_CELEBRITY_ID"
  data-primary-color="#0F172A"
  data-position="bottom-right"
  async
></script>
```

### 4.3 Features
- Email collection for sender identification
- Real-time message submission
- Automatic opportunity creation
- Configurable themes and positioning
- Style isolation from host site

---

## 5. Classification System

### 5.1 Overview
- Uses Perplexity AI for classification
- Scores opportunities from -1 to 5
- Provides detailed classification explanations
- Automatic goal matching

### 5.2 Classification Process
1. New opportunity received (via widget or Twitter)
2. Perplexity AI analyzes content and context
3. Assigns relevance score and matches to goal
4. Stores classification explanation
5. Updates opportunity record

### 5.3 Scoring Scale
- -1: Unclassified
- 1: Not relevant/likely spam
- 2-3: Moderately relevant
- 4-5: Highly relevant to matched goal

---

## 6. Next.js App Router Structure

```arduino
apps/nextjs-app
└─ src
   └─ app
      ├─ login
      │  └─ page.tsx          // Sign-in via Supabase Auth
      ├─ register
      │  └─ page.tsx          // Sign-up flow
      ├─ dashboard
      │  ├─ page.tsx          // Overview, summary stats
      │  ├─ dms
      │  │  └─ page.tsx       // Opportunities view
      │  └─ settings
      │     └─ page.tsx       // Manage users, goals, etc.
      ├─ dev
      │  └─ functions
      │     └─ classify
      │        └─ page.tsx    // Manual classification trigger
      └─ layout.tsx           // Global layout
```

---

## 7. Deployment

1. **Next.js** → **Vercel**
    - Automatic deployments from main branch
    - Environment variables for API keys

2. **Supabase**
    - Database migrations and Edge Functions
    - Row Level Security policies
    - Environment variables for service configuration

3. **Chat Widget**
    - Served via Next.js API routes
    - Bundled and minified for production
    - CDN caching for performance

---

## 8. Future Enhancements

1. **Light Mode Support**
    - Implement light color scheme
    - User preference persistence

2. **Enhanced Analytics**
    - Opportunity conversion tracking
    - Team performance metrics
    - Classification accuracy monitoring

3. **Additional Integrations**
    - Instagram DMs
    - LinkedIn messages
    - Email integration

4. **Advanced Widget Features**
    - Real-time chat capabilities
    - Custom branding options
    - Message templates
    - Analytics integration

5. **AI Improvements**
    - Response suggestions
    - Automated follow-ups
    - Sentiment analysis
    - Enhanced classification accuracy
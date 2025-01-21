# HyperAgent.so — Product & Technical Specification

## 1. Product Overview

**HyperAgent.so** is an AI-powered platform for **public figures (celebrities)** and their **teams** to manage inbound Twitter DMs efficiently. Key goals include:

- **AI-Driven Filtering & Scoring**: Rank and categorize opportunities (inbound DMs).
- **Team Collaboration**: Multiple users can access a single celebrity's inbound messages. Each user has a specific role (e.g., "admin," "support_agent," "celebrity").
- **Audit Trail**: Track status changes, message replies, and any scoring overrides.
- **Scalability**: Handle thousands of inbound DMs per day, but start with a smaller volume and a simple cron-based approach.

---

## 2. High-Level Architecture

1. **Next.js Frontend**
    - **TypeScript** + **App Router**
    - **React Query** for data fetching and caching
    - **Tailwind CSS** for styling
    - Deployed via **AWS Amplify**
2. **Supabase Backend**
    - **Database** for storing users, celebrities, inbound messages (opportunities).
    - **Supabase Auth** for handling sign-in (email/password) and possibly roles.
    - **Edge Functions** for AI logic (categorize, score).
    - Deployed on **Supabase** infrastructure (serverless Edge Functions, hosted Postgres DB).
3. **Twitter Integration (Pull / Cron Approach)**
    - A scheduled job runs **every hour**.
    - Authenticates with Twitter using the celebrity's credentials.
    - Fetches new DMs since the last check and inserts them into Supabase.

---

## 3. Data Model & Relationships

Given the requirement:

> A user can manage one celebrity only.A celebrity can have multiple users.
> 

We'll store `celebrity_id` **directly** in the `users` table.

### 3.1 **Celebrities Table**

| Column | Type | Description |
| --- | --- | --- |
| `id` (PK) | UUID | Unique identifier for the celebrity entity. |
| `celebrity_name` | VARCHAR | e.g., "MrBeast" or "Gary Sheng." |
| `twitter_username` | VARCHAR | e.g., "@garysheng." |
| `twitter_password` | VARCHAR | Credentials (encrypt at rest for MVP, ideally OAuth later). |
| `created_at` | TIMESTAMP | Defaults to `now()`. |

### 3.2 **Goals Table**

| Column | Type | Description |
| --- | --- | --- |
| `id` (PK) | UUID | Unique identifier for the goal. |
| `celebrity_id` (FK) | UUID | References `celebrities.id`. |
| `name` | VARCHAR | Name of the goal (e.g., "Sponsorships"). |
| `description` | TEXT | Detailed description of the goal. |
| `priority` | INT | Optional ordering/priority of goals. |
| `created_at` | TIMESTAMP | Defaults to `now()`. |

### 3.3 **Users Table**

| Column | Type | Description |
| --- | --- | --- |
| `id` (PK) | UUID | Supabase Auth user ID or a generated UUID if storing separately. |
| `celebrity_id` | UUID | **FK** referencing `celebrities.id`. A user belongs to exactly one celebrity. |
| `email` | VARCHAR | Email address for sign-in (linked to Supabase Auth if desired). |
| `role` | VARCHAR | e.g., "admin", "support_agent", "celebrity". |
| `full_name` | VARCHAR | Display name of the user. |
| `created_at` | TIMESTAMP | Defaults to `now()`. |

> If the celebrity is also using the platform personally, they will appear here as a user with the same celebrity_id that references themselves.For example, if "Gary" the celebrity logs in, his users row will have celebrity_id = ID from the celebrities table for "Gary's brand".A user with the "admin" or "celebrity" role might have more privileges than a "support_agent."
> 

### 3.4 **Opportunities Table**

| Column | Type | Description |
| --- | --- | --- |
| `id` (PK) | UUID | Unique identifier for the opportunity (a DM thread). |
| `celebrity_id` (FK) | UUID | Points to which celebrity this DM belongs to. |
| `goal_id` (FK) | UUID | References the matched goal (if any) from goals table. |
| `sender_handle` | VARCHAR | e.g. "@elonmusk." |
| `initial_content` | TEXT | Text from the first DM that triggered this thread. |
| `relevance_score` | FLOAT | Score from 1-5 indicating relevance. |
| `tags` | JSONB | AI or user-assigned tags. |
| `status` | VARCHAR | e.g. "new", "in_progress", "snoozed", "archived." |
| `created_at` | TIMESTAMP | Defaults to `now()`. |
| `updated_at` | TIMESTAMP | Last time a user or process updated the record. |
| `assigned_to` | UUID | UUID of team member assigned |
| `needs_discussion` | BOOLEAN | Boolean flag for team discussion |
| `relevance_override_explanation` | TEXT | Text explanation when overriding AI score |
| `relevance_override_by` | UUID | UUID of user who overrode the score |
| `relevance_override_at` | TIMESTAMP | Timestamp of override |
| `status_updated_by` | UUID | UUID of user who last updated status |
| `status_updated_at` | TIMESTAMP | Timestamp of last status update |

### 3.5 **Opportunity Messages** (Thread Content)

| Column | Type | Description |
| --- | --- | --- |
| `id` (PK) | UUID | Unique identifier for each message in a thread. |
| `opportunity_id` (FK) | UUID | Links to `opportunities.id` (which DM thread this belongs to). |
| `sender_id` (FK) | UUID | If outbound, references the user who sent it. If inbound, often `NULL` or placeholders. |
| `sender_handle` | VARCHAR | e.g., "@elonmusk" if inbound. |
| `message_content` | TEXT | Actual DM text. |
| `direction` | VARCHAR | "inbound" or "outbound." |
| `created_at` | TIMESTAMP | Defaults to `now()`. |

### 3.6 **Opportunity Actions** (Audit Log)

| Column | Type | Description |
| --- | --- | --- |
| `id` (PK) | UUID | Unique identifier for the audit log entry. |
| `opportunity_id` (FK) | UUID | Links to the relevant Opportunity. |
| `user_id` (FK) | UUID | The user who performed the action (or `NULL` if automated). |
| `action_type` | VARCHAR | e.g. "status_change", "tag_update", "score_override", "feedback_flag." |
| `old_value` | JSONB | Optional. Stores prior status, prior score, etc. |
| `new_value` | JSONB | Optional. The new status, new tags, new score, etc. |
| `created_at` | TIMESTAMP | Defaults to `now()`. |

### 3.7 **Opportunity Comments Table**

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `opportunity_id` | UUID | References opportunities table |
| `user_id` | UUID | UUID of comment author |
| `content` | TEXT | Text content of comment |
| `created_at` | TIMESTAMP | Timestamp of creation |
| `updated_at` | TIMESTAMP | Timestamp of last update |

---

## 4. User & Celebrity Relationship

- A **one-to-many** relationship:
    - **One Celebrity** → **Multiple Users**
    - **One User** → **Exactly One Celebrity** (no user is connected to multiple celebrities).

This is enforced via `users.celebrity_id` as a foreign key referencing `celebrities.id`.

- If the celebrity themselves wants to log in, they simply get a row in `users` referencing their own `celebrity_id` and possibly with `role = 'celebrity'` or `'admin'`.

---

## 5. Data Flow: Twitter DMs (Hourly Cron)

1. **Cron Job (Every Hour)**:
    - A function (could be in Next.js or a separate service) that:
        1. Authenticates with the celebrity's Twitter account (`celebrity.twitter_username` / `twitter_password`).
        2. Checks for new DMs since the last fetched timestamp.
        3. For each new DM:
            - Create a new **Opportunity** if it starts a new thread, or find the existing opportunity if it matches the same thread logic (depending on your design).
            - Insert an **Opportunity Message** record for the inbound DM (`direction = 'inbound'`).
            - Optionally call a **Supabase Edge Function** to classify and score the new message.
2. **Classification & Scoring**:
    - The Edge Function (e.g., `categorizeOpportunity`) retrieves the celebrity's `goals` from the `celebrities` table.
    - It may call external services like xAI's Grok API to see if the sender is influential, then produce a `relevance_score` and recommended `tags`.
    - The function updates the `opportunities` record accordingly.
3. **Dashboard UI**:
    - The Next.js frontend (using **React Query**) fetches updated data from the Supabase DB.
    - Users can see the new inbound messages, change status, add replies, etc.

---

## 6. Next.js App Router Structure

```arduino
arduino
Copy
apps/nextjs-app
└─ src
   └─ app
      ├─ login
      │  └─ page.tsx          // Sign-in via Supabase Auth
      ├─ register
      │  └─ page.tsx          // Potential sign-up flow
      ├─ wizard
      │  └─ page.tsx          // Set up celebrity info (name, Twitter creds, goals)
      ├─ dashboard
      │  ├─ page.tsx          // Overview, summary stats
      │  ├─ inbox
      │  │  └─ page.tsx       // Kanban or table view of Opportunities
      │  └─ settings
      │     └─ page.tsx       // Manage user roles (1 celebrity, multiple users), goals, etc.
      └─ layout.tsx           // Global layout, QueryClientProvider, Tailwind

```

- If you decide to store or fetch data only server-side, you might also create server-side **API routes** within the `/api` folder. But for the MVP, you may call Supabase directly from your React Query hooks.

---

## 7. Logging & Activity

Whenever a user **changes an opportunity's status**, **overrides a score**, or **tags** feedback:

- Insert an entry in `opportunity_actions` with:
    - `user_id` = the user's ID
    - `action_type` = e.g. `"status_change"`
    - `old_value` / `new_value` = JSON describing the change

For **outbound messages** (replying to a DM in the UI):

- Insert a row in `opportunity_messages` (`direction='outbound'`).
- (Optional) Also log it in `opportunity_actions` with `action_type="outbound_message"`.

---

## 8. Testing

### 8.1 Unit Tests with Jest

- Each package or folder can contain its own `__tests__` or `tests` directory.
- Test:
    - Supabase edge functions (mock external APIs).
    - Next.js hooks & components.

### 8.2 Integration / E2E (Optional)

- Tools like **Cypress** or **Playwright** to test real flows:
    - Insert a mock DM → confirm it appears in the dashboard → confirm user can change the status, etc.

---

## 9. Deployment

1. **Next.js** → **AWS Amplify**
    - Configure build to run `yarn install && yarn build`.
2. **Supabase** →
    - Store DB schema, run migrations, and deploy Edge Functions.
    - Provide environment variables for Twitter credentials (although each celebrity's data is in the DB, you might store the master or fallback config here).
3. **Cron Job**
    - The hourly function can be hosted:
        - In a Next.js serverless route with a scheduling service.
        - In a separate AWS Lambda with a CloudWatch rule set to run every hour.
    - The function calls the Twitter API, populates the DB, triggers classification, etc.

---

## 10. Future Enhancements

1. **OAuth for Twitter**
    - Instead of storing `twitter_password`, move to a secure delegated approach for DM access.
2. **Multi-Platform**
    - Integrate Instagram, TikTok, or email in the same manner, funneling inbound messages into the `opportunities` + `opportunity_messages` tables.
3. **AI-Generated Replies**
    - Draft responses automatically, subject to team approval.
4. **Analytics**
    - Summaries of inbound volume, average response time, or "conversion" outcomes from these opportunities.
5. **Security / Compliance**
    - As volume and importance grow, consider advanced encryption, secrets management, and data compliance steps.

---

## Conclusion

With this **refined specification**, you have:

- A clear **one-to-many** relationship between **Celebrity** and **Users** (with `users.celebrity_id`).
- A simple, hourly **cron** approach for fetching and classifying new Twitter DMs.
- A well-defined **data model** for opportunities, messages, and an audit trail of actions.
- A **Next.js** + **Supabase** setup that's straightforward to expand over time.

This document should guide your **HyperAgent.so** implementation in Cursor, ensuring each piece (data model, AI edge functions, Next.js dashboard) fits together seamlessly to deliver an AI-powered team-based inbox for celebrity inbound DMs.

Below is an **updated specification** that integrates **LangChain + LangSmith**, external APIs (Grok, Perplexity), and an LLM (OpenAI or other) into the **classification process**. This spec builds on the previous document but focuses on how inbound messages are enriched with additional data and then **classified** or **tagged** via a TypeScript-based pipeline.

---

# HyperAgent.so — Updated Classification & Enrichment Specification

## 1. Context & Goals

When a new inbound DM (an "Opportunity") arrives from Twitter, we want to:

1. **Gather context** about the sender (e.g., via Grok, Perplexity).
2. **Merge that context** with the celebrity's stated goals (e.g., "interested in sponsorships," "looking for PR opportunities," etc.).
3. **Use an LLM** (OpenAI or another model) through **LangChain** (and optionally track runs in **LangSmith**) to:
    - **Classify** the opportunity (e.g., "high value," "spam," "legal notice").
    - **Assign tags** (e.g., "sponsorship," "media inquiry").
    - **Compute a relevance score** (e.g., 0–1 or 0–100).

We then **store** the resulting tags and relevance score in our Supabase database (specifically in the `opportunities` table).

---

## 2. High-Level Flow

```mermaid
flowchart LR
    A[New DM (Opportunity)] --> B[Pull Sender Info from Twitter handle]
    B --> C[Grok API / Perplexity API calls]
    C --> D[Compile Celebrity Goals + Sender Info]
    D --> E[LangChain LLM Classification]
    E --> F[Store tags/score in Supabase]

```

1. **New DM** arrives via our **hourly cron** (Pull approach).
2. We parse the **sender handle** (e.g., `@elonmusk`).
3. **Enrich** the data:
    - Query **Grok API** to see if the handle is a known public figure or has any relevant background.
    - Query **Perplexity API** to gather quick research or summary about that handle or associated keywords (if available).
4. **Combine** these findings with the **celebrity's goals** (stored in the `celebrities.goals` JSONB field).
5. Pass all of this to a **LangChain pipeline** that calls:
    - The desired LLM (OpenAI GPT-4, GPT-3.5, or any other supported model).
    - Optionally, log runs and outputs in **LangSmith** for experimentation and debugging.
6. **Return** structured output (tags, relevance score).
7. **Store** results in the `opportunities` table in Supabase.

---

## 3. Detailed Classification Steps

### 3.1 Fetch Sender Info from Grok & Perplexity

- **Grok API**: For retrieving a user profile from X.ai's Grok endpoint.
    - If the handle is recognized, Grok might return data such as:
        - Full name, short bio, follower count, location, etc.
    - Otherwise, it might return minimal or no data.
- **Perplexity API**:
    - We might craft a query like "Who is @elonmusk on Twitter? or "@elonmusk Twitter user info" to get a quick summary or relevant data.
    - The response might be a paragraph describing the user's public presence, known roles, or references to external news.

> Caching: We can store the result in a short-term cache or in a table like sender_profiles if we expect repeated lookups for the same handle.
> 

### 3.2 Combine with Celebrity Goals

Each **celebrity** has **goals** in the `celebrities.goals` JSONB field, for example:

```json
[
  { "name": "Sponsorships", "description": "Open to brand deals or co-promotions." },
  { "name": "Media Coverage", "description": "Seeking PR exposure on major outlets." },
  { "name": "Legal Issues", "description": "Any inbound legal notices are high priority." }
]

```

We want to pass these goals (plus any other context about the celebrity) to the LLM alongside the data we got from Grok/Perplexity.

### 3.3 LLM with LangChain & LangSmith

We'll create a **LangChain** pipeline in TypeScript, something like:

1. **Prompt Template**:
    - We feed in:
        - The **DM content** (initial inbound message).
        - The **sender data** (bio/followers/influence from Grok, summary from Perplexity).
        - The **celebrity's goals**.
    - We instruct the model to **produce** a JSON output containing `tags` (array of strings) and `relevance_score` (number).
2. **LLM Model**:
    - We can use `OpenAIChat` (from `langchain/llms/openai`) or any other LLM supported by LangChain.
    - Configure with an API key, model name (e.g., `gpt-3.5-turbo` or `gpt-4`).
3. **LangSmith**:
    - If we want to track runs or debug, we can use the [LangSmith](https://smith.langchain.com/) platform to log inputs/outputs and measure performance.

### **TypeScript Sketch** (Supabase Edge Function Example)

Below is a minimal example for a classification function named `classifyOpportunity`. This is **not** final production code but illustrates how you might implement the logic:

```
// supabase/functions/classifyOpportunity/index.ts

import { createClient } from '@supabase/supabase-js';
import { OpenAIChat } from 'langchain/llms/openai';
import { ChatPromptTemplate, HumanMessage } from 'langchain/prompts';
import { v4 as uuidv4 } from 'uuid';

// Hypothetical imports for Grok/Perplexity
import { fetchGrokProfile } from './grokApi';
import { fetchPerplexitySummary } from './perplexityApi';

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create an LLM instance
const model = new OpenAIChat({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  temperature: 0,
  modelName: 'gpt-3.5-turbo', // or gpt-4
});

// Example of a classification function
export async function classifyOpportunity(opportunityId: string) {
  // 1. Fetch opportunity + celebrity + goals
  const { data: oppData, error: oppError } = await supabase
    .from('opportunities')
    .select(`
      id,
      sender_handle,
      initial_content,
      celebrity_id
    `)
    .eq('id', opportunityId)
    .single();

  if (oppError || !oppData) throw new Error('Opportunity not found');

  const { data: celebData, error: celebError } = await supabase
    .from('celebrities')
    .select('id, goals')
    .eq('id', oppData.celebrity_id)
    .single();

  if (celebError || !celebData) throw new Error('Celebrity not found');

  // 2. Pull data from Grok & Perplexity
  const grokProfile = await fetchGrokProfile(oppData.sender_handle);
  const perplexityInfo = await fetchPerplexitySummary(oppData.sender_handle);

  // 3. Combine data into a single prompt
  const combinedPrompt = ChatPromptTemplate.fromPromptMessages([
    new HumanMessage(`
      You are an AI assistant that classifies inbound DMs to a celebrity.

      Celebrity Goals (JSON):
      ${JSON.stringify(celebData.goals, null, 2)}

      Sender Handle: ${oppData.sender_handle}
      Grok Profile (if any): ${JSON.stringify(grokProfile, null, 2)}
      Perplexity Summary (if any): ${JSON.stringify(perplexityInfo, null, 2)}

      DM Content:
      "${oppData.initial_content}"

      Instructions:
      1. Return a JSON with two keys: "tags" (array of strings) and "relevance_score" (number 0-1).
      2. Base your classification on how well the DM aligns with the celebrity's goals, and how influential/important the sender might be.
      3. Relevance score near 1 means "very important/relevant," near 0 means "not relevant/spam."

      Now, provide your classification:
    `),
  ]);

  // 4. Call the LLM
  const llmResponse = await model.call(await combinedPrompt.format([]));

  // 5. Parse the output (assuming well-formed JSON)
  let classification = { tags: [], relevance_score: 0 };
  try {
    classification = JSON.parse(llmResponse.text);
  } catch (err) {
    // fallback or default
  }

  // 6. Update the opportunity
  const { data: updatedOpp, error: updateError } = await supabase
    .from('opportunities')
    .update({
      tags: classification.tags,
      relevance_score: classification.relevance_score,
      updated_at: new Date().toISOString(),
    })
    .eq('id', oppData.id)
    .single();

  if (updateError) throw new Error(`Failed to update opportunity: ${updateError.message}`);

  // Return final
  return updatedOpp;
}

```

### Grok & Perplexity API Calls (Examples)

```
// supabase/functions/classifyOpportunity/grokApi.ts

export async function fetchGrokProfile(handle: string) {
  // Hypothetical example, adapt to real Grok API
  try {
    const response = await fetch(`https://api.grok.xyz/profiles?handle=${handle}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${process.env.GROK_API_KEY!}` }
    });

    if (!response.ok) {
      return { error: 'Grok fetch failed', handle };
    }

    return await response.json();
  } catch (error) {
    return { error: String(error) };
  }
}

```

```
// supabase/functions/classifyOpportunity/perplexityApi.ts

export async function fetchPerplexitySummary(handle: string) {
  // Hypothetical example
  try {
    const query = `Who is ${handle} on Twitter? Summarize their background.`;
    const response = await fetch('https://api.perplexity.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY!}`
      },
      body: JSON.stringify({ query })
    });
    if (!response.ok) {
      return { error: 'Perplexity fetch failed', handle };
    }
    return await response.json();
  } catch (error) {
    return { error: String(error) };
  }
}

```

---

## 4. LangSmith Integration (Optional)

To **observe** or **debug** your classification runs:

1. **Install** the [LangSmith SDK](https://smith.langchain.com/) in your function environment.
2. **Wrap** your LLM calls with instrumentation, e.g.:
    
    ```
    import { LangChainPlusClient } from 'langchainplus';
    
    // ... inside your classifyOpportunity function
    const client = new LangChainPlusClient({ apiUrl: process.env.LANGSMITH_API_URL! });
    // Start a run
    const run = await client.startRun({ runName: 'classifyOpportunity' });
    
    // ...
    // after the call
    await run.endRun({ output: classification });
    
    ```
    
3. This will log your inputs/outputs in **LangSmith**, so you can track performance, see the tokens used, debug incorrect classifications, etc.

---

## 5. Where Does This Live?

- The classification code can live in a **Supabase Edge Function** (e.g., `classifyOpportunity`) or a dedicated **serverless** environment (Node/TypeScript).
- We call it whenever a new inbound DM is inserted or updated in the `opportunities` table, or via an explicit call from the Next.js API if you prefer.
- You might also set up a **database trigger** (Postgres) that fires the function automatically on new rows, but a direct invocation from the cron job or Next.js might be simpler to manage.

---

## 6. Full Flow Recap

1. **Pull Cron (Hourly)** fetches new DMs:
    1. Insert or update the `opportunities` table with new inbound content.
    2. Call the **`classifyOpportunity`** function, passing the new `opportunity_id`.
2. **`classifyOpportunity`** function:
    1. Queries Supabase for the DM, the associated celebrity's goals, etc.
    2. Calls **Grok** and **Perplexity** to gather additional context about the sender.
    3. **LangChain** uses an LLM (OpenAI or other) to produce tags + a relevance score.
    4. Updates the `opportunities` table with these results.
3. **Dashboard** (Next.js / React Query):
    1. Displays the updated relevance score and tags.
    2. The user can override these scores or add feedback if needed, which logs in `opportunity_actions`.

---

## 7. Potential Pitfalls & Considerations

- **Rate Limits**: Check Grok, Perplexity, and LLM usage limits. Caching results for repeated handle lookups is wise.
- **Prompt Consistency**: Ensure the LLM output is always valid JSON. You might use [LangChain's output parsers](https://js.langchain.com/docs/modules/chains/other/structured_output_parsers/) for better reliability.
- **Security**:
    - Hide all API keys in environment variables.
    - Encrypt or carefully store any Twitter credentials the celebrity provides.
- **Error Handling**:
    - If external APIs fail, consider a fallback path (e.g., classification with partial info or a default "unknown" scoring).

---

## 8. Conclusion

By integrating **LangChain**, **LangSmith**, and external data sources (Grok, Perplexity), **HyperAgent.so** can enrich inbound DMs with relevant sender context and produce robust classifications. The **TypeScript** examples above show how you might implement this in a **Supabase Edge Function**, maintaining a clean separation between:

- **Data fetching** (Supabase, Grok, Perplexity)
- **LLM-based classification** (LangChain + OpenAI or others)
- **Database updates** (storing tags & relevance in `opportunities`)

This architecture paves the way for **scalable** and **intelligent** inbound management, where the system continuously learns, logs, and refines its classification with every new DM.

# Updated Classification Pipeline (2025-01-20)

## Classification with Perplexity

We've simplified the classification pipeline to use Perplexity API for both user research and DM classification:

1. **User Research**:
   - Use Perplexity to research the sender's profile
   - Focus on follower counts, influence, and professional background
   - Store this context for use in classification

2. **Goal Matching**:
   - Each celebrity has explicit goals stored in the `goals` table
   - Classification matches a DM to exactly one goal (or none)
   - Uses UUID references instead of indices for stability

3. **Scoring System**:
   - Relevance scores are now 1-5 (instead of 0-1)
   - 5 = Highly relevant to the matched goal
   - 1 = Not relevant/likely spam
   - Scores consider both content relevance and sender influence

4. **Technology Stack**:
   - Perplexity API for all AI operations (replacing OpenAI)
   - LangChain for pipeline orchestration
   - LangSmith for observability and debugging

5. **Observability**:
   - All classification runs are logged in LangSmith
   - Each run includes:
     - Input: DM content, sender profile, available goals
     - Output: Matched goal UUID, relevance score, tags
     - Timing and performance metrics

This approach provides better stability (UUIDs vs indices), simpler integration (one API instead of multiple), and comprehensive observability through LangSmith.

# Opportunity Actions & Workflow

## Actions Available
1. **Classification Actions**
   - Upgrade relevance (requires explanation for overriding AI's score)
   - Downgrade to irrelevant (marks as rejected)

2. **Assignment Actions**
   - Assign to goal
   - Assign to team member
   - Flag for team discussion

3. **Status Management**
   - Mark for follow-up (approved)
   - Archive (rejected)
   - Put on hold

## Data Model Updates

### Opportunities Table
New fields added to track actions and assignments:
- `assigned_to` - UUID of team member assigned
- `needs_discussion` - Boolean flag for team discussion
- `relevance_override_explanation` - Text explanation when overriding AI score
- `relevance_override_by` - UUID of user who overrode the score
- `relevance_override_at` - Timestamp of override
- `status_updated_by` - UUID of user who last updated status
- `status_updated_at` - Timestamp of last status update
- Status now includes 'on_hold' in addition to existing states

### New: Opportunity Comments Table
Enables team discussions on opportunities:
- `id` - UUID primary key
- `opportunity_id` - References opportunities table
- `user_id` - UUID of comment author
- `content` - Text content of comment
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update

## Workflow
1. **Initial AI Classification**
   - AI assigns initial relevance score
   - Sets initial status (pending/rejected)

2. **Human Review**
   - Can override AI classification with explanation
   - Can assign to team members
   - Can flag for discussion
   - Can add comments for team input

3. **Team Collaboration**
   - Team members can discuss via comments
   - Can be assigned to specific team members
   - Status can be updated based on team decisions

4. **Final Processing**
   - Mark for follow-up (approved)
   - Archive (rejected)
   - Put on hold for later review

## Security
- Row Level Security (RLS) policies ensure:
  - Comments are only visible to team members
  - Only authenticated users can create comments
  - Users can only edit their own comments
  - Actions are tracked with user IDs and timestamps
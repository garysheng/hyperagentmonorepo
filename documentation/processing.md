Below is an **updated** example that:

1. **Maps each inbound DM** to **exactly one** celebrity goal (or “0” if none are relevant).  
2. **Uses Perplexity** for both:
   - **Scraping tweets** from a user handle (via a specialized prompt or approach).  
   - **Classifying** the DM with LangChain.  
3. Skips the **Grok** API (all user profile info is fetched from Perplexity).

> **Note**: This is sample code and architecture. You’ll need to adapt it to your actual Perplexity prompts, data structures, and environment.

---

# 1. Adjust Data Model for a Single Goal

If we want to store only **one** relevant goal per Opportunity, we might add a field like `goal_index` or `goal_name` in the `opportunities` table (or store it as part of `tags`—but let’s keep it separate for clarity):

```sql
ALTER TABLE opportunities
ADD COLUMN goal_index INT DEFAULT 0;
```

- **0** means “no relevant goal.”  
- **1** means relevant to the first goal, **2** means the second, etc.  
(Or you could store a string like `goal_name` if that’s easier.)

---

# 2. Fetching User Tweets via Perplexity

If we want to gather a user’s tweets from Perplexity, we can do something like:

```ts
// src/utils/perplexityUserProfile.ts
import axios from 'axios';

// Hypothetical function to ask Perplexity for the last X tweets from a handle
// by constructing a specialized query or prompt. This is purely illustrative:
export async function fetchTweetsFromPerplexity(apiKey: string, handle: string): Promise<string> {
  try {
    const prompt = `Retrieve the most recent tweets from Twitter user ${handle}. Summarize or list them.`;

    const response = await axios.post(
      'https://api.perplexity.ai/v1/chat/completions',
      {
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an AI that can fetch and summarize tweets for a given handle.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    // Return the text, which presumably includes tweet data or a summary
    if (response.data && response.data.text) {
      return response.data.text;
    }
    return '';
  } catch (error) {
    console.error('Failed to fetch tweets via Perplexity:', error);
    return '';
  }
}
```

This is **not** a guaranteed method for actually retrieving live tweets (since Perplexity may or may not support such direct retrieval). But it shows the pattern of how you might prompt Perplexity for “user tweets.” In reality, you’d see if Perplexity can truly access that data or if you need another approach (e.g., using Twitter’s own API).

---

# 3. LangChain Classification Chain (One Goal Max)

Below is a **LangChain** chain that:

1. **Scrapes** any links in the DM.  
2. **Fetches** user tweets from Perplexity.  
3. **Constructs** a prompt that includes:
   - The DM content.
   - The user’s tweets or summary from Perplexity.  
   - The celebrity’s goals (an array).  
4. **Asks** the LLM to pick **one** `goal_index` (or **0** if none match).  
5. **Also** returns `relevance_score` from **1** to **5**.

```ts
// src/chains/classificationChain.ts
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import { PerplexityLLM } from '../llms/PerplexityLLM';
import { scrapeWebpage } from '../utils/scrapeWebpage';
import { fetchTweetsFromPerplexity } from '../utils/perplexityUserProfile';
import { LangChainPlusClient } from 'langchainplus';

export interface ClassificationChainInput {
  dmContent: string;
  goals: string[]; // An array of goal strings
  userHandle?: string; // e.g. "garysheng"
  perplexityApiKey: string;
  modelName?: string;
}

export async function runClassificationChainForSingleGoal(
  input: ClassificationChainInput
): Promise<{
  goal_index: number; // 0 means none, 1..N means relevant goal
  relevance_score: number; // 1..5
}> {
  // 1. If user provided a handle, fetch tweets from Perplexity
  let userTweets = '';
  if (input.userHandle) {
    userTweets = await fetchTweetsFromPerplexity(input.perplexityApiKey, input.userHandle);
  }

  // 2. Scrape any links in the DM
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = input.dmContent.match(urlRegex) || [];
  let scrapedLinksContent = '';
  for (const link of links) {
    const siteText = await scrapeWebpage(link);
    scrapedLinksContent += `\n[Content from ${link}]\n${siteText}`;
  }

  // 3. Build the prompt template
  // We want a single goal_index: 0 if none, 1..N if it matches the index in the array
  const prompt = new PromptTemplate({
    template: `
      You are an AI classifying an inbound DM to see which goal it matches best.

      The celebrity's goals are indexed, for example:
      1. {goal1}
      2. {goal2}
      3. {goal3}
      ...

      DM Content: "{dmContent}"
      Links Scraped:
      {scrapedLinksContent}

      Tweets from user handle "{userHandle}":
      {userTweets}

      INSTRUCTIONS:
      1) Decide if this DM matches any of the goals (1..N). Return the integer index of the single best match.
         If none are relevant, return 0.
      2) Provide a relevance_score from 1..5.

      Output valid JSON in the format:
      {
        "goal_index": number,
        "relevance_score": number
      }
    `,
    inputVariables: [
      'dmContent',
      'scrapedLinksContent',
      'userHandle',
      'userTweets',
      'goal1',
      'goal2',
      'goal3', // Extend if you can have more goals
    ]
  });

  // We'll adapt for up to 3 goals for the example
  const goal1 = input.goals[0] || '';
  const goal2 = input.goals[1] || '';
  const goal3 = input.goals[2] || '';

  // 4. Create the chain with the custom Perplexity LLM
  const perplexityLLM = new PerplexityLLM(
    input.perplexityApiKey,
    input.modelName || 'llama-3.1-sonar-large-128k-online'
  );

  const chain = new LLMChain({
    llm: perplexityLLM,
    prompt
  });

  // 5. (Optional) Start a run in LangSmith
  const client = new LangChainPlusClient({
    apiUrl: process.env.LANGSMITH_API_URL!, // if you have it
    apiKey: process.env.LANGSMITH_API_KEY!
  });
  const run = await client.startRun({
    runName: 'classificationChainSingleGoal',
    tags: ['single-goal', 'perplexity']
  });

  // 6. Call the chain
  const chainResult = await chain.call({
    dmContent: input.dmContent,
    scrapedLinksContent,
    userHandle: input.userHandle || '',
    userTweets,
    goal1,
    goal2,
    goal3
  });

  // 7. Parse JSON
  let classification = { goal_index: 0, relevance_score: 1 };
  try {
    classification = JSON.parse(chainResult.text);
  } catch (err) {
    console.error('Failed to parse classification chain output:', err);
  }

  // 8. End run in LangSmith
  await run.endRun({ output: classification });

  return classification;
}
```

### Notes

- We hard-coded placeholders for **3 goals**. If you have more or fewer, you can dynamically create the prompt.  
- The **LLM** is told to pick exactly **one** best goal (integer 1..N) or **0** if it’s irrelevant.  
- We add a `relevance_score` from **1..5**.  
- We fetch user tweets from **Perplexity** (if the user handle is provided).  
- We store intermediate steps in **LangSmith** for debugging or analytics.

---

# 4. Full Workflow Example

```ts
// classifyOpportunityWorkflow.ts
import { createClient } from '@supabase/supabase-js';
import { runClassificationChainForSingleGoal } from './chains/classificationChain';
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function classifyOpportunity(opportunityId: string) {
  // 1. Fetch DM from the DB
  const { data: opp } = await supabase
    .from('opportunities')
    .select('id, initial_content, sender_handle, celebrity_id')
    .eq('id', opportunityId)
    .single();

  if (!opp) throw new Error(`Opportunity not found: ${opportunityId}`);

  // 2. Fetch the celebrity's goals
  // Suppose we store them in an array: e.g. ["Hiring top AI engineers", "Looking for sponsors", ...]
  const { data: celeb } = await supabase
    .from('celebrities')
    .select('goals') // let's say it's stored as a string[] or JSON array
    .eq('id', opp.celebrity_id)
    .single();

  // 3. Run classification
  const classification = await runClassificationChainForSingleGoal({
    dmContent: opp.initial_content,
    goals: celeb?.goals || [], // e.g. ["Hire AI devs", "Promote brand..."]
    userHandle: opp.sender_handle.replace('@', ''), // assuming handle is "@garysheng"
    perplexityApiKey: process.env.PERPLEXITY_API_KEY!
  });

  // 4. Update DB with new single-goal index & relevance
  const { error } = await supabase
    .from('opportunities')
    .update({
      goal_index: classification.goal_index,
      relevance_score: classification.relevance_score
    })
    .eq('id', opportunityId);

  if (error) {
    console.error('Failed to update DB with classification:', error);
  }
}
```

---

## 5. Summary of Changes

1. **Single Goal**:  
   - We return **`goal_index`** to indicate which single goal (1..N) the DM matches, or **0** if none.  
   - The database has an integer column (e.g., `goal_index INT`) to store it.

2. **No Grok**:  
   - We removed any references to Grok.  
   - **Perplexity** is used to retrieve user tweets or user summaries (assuming it can do so).

3. **LangChain + LangSmith**:  
   - We use a **custom Perplexity LLM** (`PerplexityLLM` class) within an **LLMChain**.  
   - We log runs in **LangSmith** by starting and ending a “run” around the chain call.

4. **Prompt**:  
   - We instruct the LLM to pick exactly **one** best goal from the list, or **0** if no match.  
   - We get a `relevance_score` (1..5).

---

## 6. Caveats & Best Practices

- **Goal Array Handling**:  
  - If you have a dynamic number of goals, you can generate the prompt template string dynamically. Or store your goals as `[["1", "Hire AI devs"], ["2", "Looking for brand deals"], ...]` and pass them in a single chunk.
- **Large Context**:  
  - If user tweets or scraped pages are large, watch out for the **128k** token limit. Summarize or chunk as needed.
- **Reliance on Perplexity**:  
  - Ensure Perplexity truly can fetch live tweets or relevant data. If not, you may need **Twitter’s official API** or another route for user info.
- **Handling “0”**:  
  - If `goal_index = 0`, you might treat that as “Archive,” “Low Priority,” or some other fallback.

---

### Final Takeaway

With this approach, you have:

1. A **pipeline** that ingests a DM, scrapes linked websites, retrieves tweets from Perplexity, and runs classification with **LangChain** & **LangSmith**.  
2. A **single** relevant goal selected from a possible list, stored as an integer index (or **0** for none).  
3. Full **observability** in LangSmith, letting you review the prompt, intermediate states, final output, and debug classification.
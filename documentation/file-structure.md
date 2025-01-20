Below is an **example monorepo file structure** for **HyperAgent.so** using **pnpm** workspaces, **Next.js (TypeScript)** for the front end, and **Supabase** for the database and serverless functions. This layout also shows how you might include a shared library (optional) and localized test folders.

Feel free to **customize naming** or **remove folders** you don’t need. The main idea is to keep each “app” or “package” in its own folder under a common workspace.

---

# **Monorepo Structure (pnpm)**

```
hyperagent
├─ pnpm-workspace.yaml        // Defines pnpm workspaces
├─ package.json               // Root-level package with shared dev dependencies/scripts
├─ tsconfig.base.json         // Base TS config shared across packages
├─ .eslintrc.js               // Root ESLint config
├─ .prettierrc                // Root Prettier config
├─ README.md                  // Project-level README
├─ .gitignore
|
├─ apps
│  ├─ nextjs-app
│  │  ├─ package.json
│  │  ├─ pnpm-lock.yaml       // (optional, if you want a separate lock — often you rely on root)
│  │  ├─ tsconfig.json
│  │  ├─ next.config.js
│  │  ├─ postcss.config.js
│  │  ├─ tailwind.config.js
│  │  ├─ public/              // Static assets, if any
│  │  └─ src
│  │     ├─ app               // Next.js App Router
│  │     │  ├─ layout.tsx
│  │     │  ├─ page.tsx
│  │     │  ├─ wizard
│  │     │  │  └─ page.tsx
│  │     │  ├─ login
│  │     │  │  └─ page.tsx
│  │     │  ├─ register
│  │     │  │  └─ page.tsx
│  │     │  ├─ dashboard
│  │     │  │  ├─ page.tsx
│  │     │  │  ├─ inbox
│  │     │  │  │  └─ page.tsx
│  │     │  │  └─ settings
│  │     │  │     └─ page.tsx
│  │     │  └─ ...
│  │     ├─ components        // Reusable UI components
│  │     ├─ hooks             // Custom React hooks
│  │     └─ lib               // Local utility functions
│  │
│  │  └─ tests
│  │     ├─ unit
│  │     │  └─ example.test.ts
│  │     └─ integration
│  │        └─ example.integration.test.ts
│  │
│  └─ supabase
│     ├─ package.json
│     ├─ pnpm-lock.yaml       // (optional, same note as above)
│     ├─ tsconfig.json
│     └─ supabase
│        ├─ migrations        // SQL migrations or any db migrations
│        ├─ seeds             // Optional seed scripts
│        ├─ functions         // Edge/Serverless Functions
│        │  ├─ classifyOpportunity
│        │  │  ├─ index.ts            // main function logic
│        │  │  ├─ grokApi.ts          // Grok API helper
│        │  │  ├─ perplexityApi.ts    // Perplexity API helper
│        │  │  └─ __tests__
│        │  │     └─ index.test.ts    // Unit tests for classifyOpportunity
│        │  └─ ...                    // Additional functions
│        └─ .env.example
│
├─ libs                       // (Optional) Shared libraries
│  ├─ shared
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  └─ src
│  │     ├─ utils
│  │     │  └─ index.ts       // Shared utility code
│  │     └─ ...
│  │
│  │  └─ tests
│  │     └─ unit
│  │        └─ sharedUtils.test.ts
|
└─ scripts                    // (Optional) Shell or JS scripts for building/deploying
   └─ deploy-all.sh
```

---

## **Key Files & Explanations**

1. **`pnpm-workspace.yaml`**  
   - Declares which folders are part of your workspace. For instance:
     ```yaml
     packages:
       - "apps/*"
       - "libs/*"
     ```

2. **Root `package.json`**  
   - May contain shared dev dependencies (e.g., ESLint, Prettier, TypeScript).
   - Example:
     ```json
     {
       "name": "hyperagent-monorepo",
       "private": true,
       "scripts": {
         "lint": "eslint .",
         "format": "prettier --write ."
       },
       "devDependencies": {
         "eslint": "^8.0.0",
         "prettier": "^3.0.0",
         "typescript": "^5.0.0"
       }
     }
     ```

3. **`tsconfig.base.json`**  
   - A shared base config for TypeScript across packages. For example:
     ```jsonc
     {
       "compilerOptions": {
         "target": "ES2020",
         "module": "ESNext",
         "moduleResolution": "Node",
         "strict": true,
         "esModuleInterop": true,
         "skipLibCheck": true,
         "forceConsistentCasingInFileNames": true
       }
     }
     ```

4. **`apps/nextjs-app/`**  
   - Contains all Next.js files, including the **App Router** structure in `src/app/`.
   - `tests/` folder local to this app for unit or integration tests.

5. **`apps/supabase/`**  
   - Holds Supabase project files:
     - `supabase/migrations` for DB migrations.
     - `supabase/functions` for serverless Edge Functions.
     - Could include a `.env` or `.env.example` for local dev environment variables.

6. **(Optional) `libs/shared/`**  
   - A place for shared TypeScript utilities, models, or logic used by both Next.js and Supabase functions.
   - Each library has its own `package.json` and `tsconfig.json`.
   - You’d reference it via pnpm workspace dependency in the other packages (e.g. `"@hyperagent/shared": "workspace:*"`).

7. **Scripts**  
   - The `scripts/` folder can contain utility scripts for building, testing, deploying each workspace package in the correct order (e.g., run DB migrations, then build Next.js, etc.).

---

## **Example `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "libs/*"
```

## **Example Root `package.json` with pnpm**

```json
{
  "name": "hyperagent",
  "private": true,
  "version": "0.0.1",
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "build": "pnpm -r run build",
    "test": "pnpm -r run test"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## **Workflow Overview**

1. **Install Dependencies**  
   - From the root: `pnpm install`

2. **Develop Next.js**  
   - `cd apps/nextjs-app`  
   - `pnpm dev` (or `pnpm run dev`)

3. **Develop Supabase Edge Functions**  
   - `cd apps/supabase`  
   - `pnpm dev` or `pnpm supabase functions serve classifyOpportunity`

4. **Build All**  
   - At root: `pnpm build`  
   - This runs the build scripts in each package (e.g., Next.js production build, transpile supabase functions).

5. **Testing**  
   - `pnpm test` runs all tests across each workspace.  
   - Or go into a specific package: `cd apps/nextjs-app && pnpm test`.

---

## **Conclusion**

This **monorepo structure** using **pnpm** provides:

- **Clear Separation** of the Next.js front end and the Supabase backend.
- **Shared** configuration (TS, ESLint, Prettier) to maintain consistency.
- **Local Tests** in each package, which you can run individually or collectively via pnpm.
- An **optional shared library** (`libs/shared`) for cross-cutting code (e.g., TypeScript types, utility functions).

Adjust folder names, scripts, and dependencies as needed to fit your team’s workflow and **HyperAgent.so** requirements. This setup should give you a solid foundation for managing your entire project under one roof, with minimal friction in collaboration and deployment.
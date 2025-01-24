# HyperAgent Widget Server

A dedicated server for serving HyperAgent's widget files.

## Development

```bash
# Install dependencies
pnpm install

# Build (copies widget files from nextjs-app)
pnpm build

# Start development server
pnpm dev
```

## Deployment

1. Create a new project on Vercel
2. Add the following environment variables:
   - None required

3. Deploy using:
```bash
vercel --prod
```

4. Set up a custom domain (e.g., widget.hyperagent.so)

5. Update the main Next.js app with:
```bash
NEXT_PUBLIC_WIDGET_SERVER_URL=https://widget.hyperagent.so
``` 
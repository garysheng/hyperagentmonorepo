import { config } from 'dotenv'
import { resolve } from 'path'

// Load test environment variables
config({
  path: resolve(__dirname, '.env.test')
})

// Verify required environment variables are set
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'LANGSMITH_API_KEY'
]

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}) 
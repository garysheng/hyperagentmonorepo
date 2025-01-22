import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Note: This needs to be the service key, not the anon key
)

async function createUser() {
  const userId = 'f4deb9c8-c8ca-4602-8818-c5614bf46eba' // Your auth user ID
  const email = 'garysheng11@gmail.com' // Your email

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()

  if (existingUser) {
    console.log('User already exists')
    return
  }

  // Create user
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: email,
      full_name: email.split('@')[0],
      role: 'user'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    return
  }

  console.log('User created successfully:', data)
}

createUser() 
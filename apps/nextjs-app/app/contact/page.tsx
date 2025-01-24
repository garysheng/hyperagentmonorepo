import { redirect } from 'next/navigation'

const CELEBRITY_ID = '0ca0f921-7ccd-4975-9afb-3bed98367403'

export default function ContactPage() {
  redirect(`/contact/${CELEBRITY_ID}`)
} 
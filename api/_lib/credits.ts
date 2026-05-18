import { createServiceClient } from './supabase'

export async function getCredits(userId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('credits_remaining')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data.credits_remaining as number
}
export async function reserveCredit(userId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('reserve_generation_credit', {
    p_user_id: userId,
  })

  if (error) {
    if (error.message.includes('no_credits')) {
      const noCredits = new Error('No credits remaining')
      noCredits.name = 'NoCredits'
      throw noCredits
    }
    throw new Error(error.message)
  }

  // Function returns a table (array) — take the first row
  const row = Array.isArray(data) ? data[0] : data
  return row as { credits_before: number; credits_after: number }
}

// export async function reserveCredit(userId: string) {
//   const supabase = createServiceClient()
//   const { data, error } = await supabase.rpc('reserve_generation_credit', {
//     p_user_id: userId,
//   })

//   if (error) {
//     if (error.message.includes('no_credits')) {
//       const noCredits = new Error('No credits remaining')
//       noCredits.name = 'NoCredits'
//       throw noCredits
//     }
//     throw new Error(error.message)
//   }

//   return data as { credits_before: number; credits_after: number }
// }

export async function logGeneration(userId: string, provider: string, model: string, creditsBefore: number) {
  const supabase = createServiceClient()
  console.log('logGeneration called with:', { userId, provider, model, creditsBefore }) // add this

  const { error } = await supabase.rpc('log_generation', {
    p_user_id: userId,
    p_provider: provider,
    p_model: model,
    p_credits_before: creditsBefore,
  })

  if (error) throw new Error(error.message)
}

export async function refundReservedCredit(userId: string) {
  const supabase = createServiceClient()
  const { error } = await supabase.rpc('refund_reserved_credit', {
    p_user_id: userId,
  })

  if (error) throw new Error(error.message)
}

import { useEffect, useState } from 'react'
import { createClient } from './client'
import { useAuth } from '@/context/AuthContext'

export function useSupabase() {
  const supabase = createClient()
  const { user } = useAuth()

  return { supabase, userId: user?.id }
}

export function useSupabaseQuery<T>(
  table: string,
  query?: (qb: any) => any
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { supabase, userId } = useSupabase()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        let qb = supabase.from(table).select('*')

        if (query) {
          qb = query(qb)
        }

        const { data: result, error: err } = await qb

        if (err) throw err

        setData(result || [])
      } catch (err: any) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [table, userId])

  return { data, loading, error }
}

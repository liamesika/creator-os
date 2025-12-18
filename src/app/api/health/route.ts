import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Build identifier for deployment verification
const BUILD_SHA = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || process.env.NEXT_PUBLIC_BUILD_SHA || 'local'
const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString()

export async function GET() {
  return NextResponse.json(
    { ok: true, timestamp: new Date().toISOString(), build: BUILD_SHA },
    {
      status: 200,
      headers: {
        'x-build-sha': BUILD_SHA,
        'x-build-time': BUILD_TIME,
      },
    }
  )
}

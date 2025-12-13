import { NextRequest, NextResponse } from 'next/server'

/**
 * Google OAuth Callback Handler
 *
 * Exchanges authorization code for access/refresh tokens
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(
      new URL('/settings/integrations?error=oauth_failed', request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings/integrations?error=no_code', request.url)
    )
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('Google OAuth: Missing credentials')
    return NextResponse.redirect(
      new URL('/settings/integrations?error=config_error', request.url)
    )
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${request.nextUrl.origin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL('/settings/integrations?error=token_exchange_failed', request.url)
      )
    }

    const tokens = await tokenResponse.json()
    const { access_token, refresh_token } = tokens

    // Redirect back to integrations page with tokens
    const redirectUrl = new URL('/settings/integrations', request.url)
    redirectUrl.searchParams.set('success', 'google_connected')
    redirectUrl.searchParams.set('access_token', access_token)
    if (refresh_token) {
      redirectUrl.searchParams.set('refresh_token', refresh_token)
    }

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/settings/integrations?error=unexpected_error', request.url)
    )
  }
}

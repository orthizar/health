import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const authRes = await fetch('https://api-eu.libreview.io/llu/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'product': 'llu.android',
      'version': '4.7.0',
    },
    body: JSON.stringify({
      "email": process.env.GCM_EMAIL,
      "password": process.env.GCM_PASSWORD,
    }),
  })
  const authData = await authRes.json()
  if (authData.status != '0') {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
  const token = authData.data.authTicket.token
  const connectionsRes = await fetch('https://api-eu.libreview.io/llu/connections', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'product': 'llu.android',
      'version': '4.7.0',
      'authorization': `Bearer ${token}`,
    },
  })
  const connectionsData = await connectionsRes.json()
  const gcm = connectionsData.data.glucoseMeasurement

  return NextResponse.json(gcm, { status: 200 })
}
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const authRes = await fetch('https://api-eu.libreview.io/llu/auth/login', {
    method: 'POST',
    next: { revalidate: 86400 },
    headers: {
      'Content-Type': 'application/json',
      'product': 'llu.android',
      'version': '4.7.0',
    },
    body: JSON.stringify({
      "email": process.env.LIBREVIEW_EMAIL,
      "password": process.env.LIBREVIEW_PASSWORD,
    }),
  })
  const authData = await authRes.json()
  if (authData.status != '0') {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
  const token = authData.data.authTicket.token
  const connectionsRes = await fetch('https://api-eu.libreview.io/llu/connections', {
    method: 'GET',
    next: { revalidate: 60 },
    headers: {
      'Content-Type': 'application/json',
      'product': 'llu.android',
      'version': '4.7.0',
      'authorization': `Bearer ${token}`,
    },
  })
  const connectionsData = await connectionsRes.json()
  const connectionGraphRes = await fetch('https://api-eu.libreview.io/llu/connections/' + connectionsData.data[0].patientId + '/graph', {
    method: 'GET',
    next: { revalidate: 60 },
    headers: {
      'Content-Type': 'application/json',
      'product': 'llu.android',
      'version': '4.7.0',
      'authorization': `Bearer ${token}`,
    },
  })
  const connectionGraphData = await connectionGraphRes.json()
  const graphData = connectionGraphData.data.graphData
  return NextResponse.json({
    lastUpdated: Date.now().valueOf(),
    glucoseMeasurement: connectionsData.data[0].glucoseMeasurement,
    graphData: graphData,
  }, { status: 200 })
}
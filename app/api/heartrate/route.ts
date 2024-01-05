import { NextResponse } from "next/server";
import Garmin from "../../garmin/garmin";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const garmin = new Garmin();
  await garmin.login();
  var heartRate = await garmin.getHeartRate();

  if (heartRate == null) {
    return NextResponse.json(
      {},
      {
        status: 500,
        headers: {
          "Cache-Control": "maxage=0, s-maxage=1, stale-while-revalidate",
        },
      }
    );
  }

  return NextResponse.json(
    {
      lastUpdated: heartRate.lastUpdated,
      heartRateValues: heartRate.heartRateValues,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "maxage=0, s-maxage=60, stale-while-revalidate",
      },
    }
  );
}

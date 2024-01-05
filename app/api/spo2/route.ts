import { NextResponse } from "next/server";
import Garmin from "@/app/garmin/garmin";

export const revalidate = 1800;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const garmin = new Garmin();
  await garmin.login();
  var spo2 = await garmin.getSpo2();

  if (spo2 == null) {
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
      lastUpdated: spo2.lastUpdated,
      spO2HourlyAverages: spo2.spO2HourlyAverages,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "maxage=0, s-maxage=1800, stale-while-revalidate",
      },
    }
  );
}

import { NextResponse } from "next/server";
import Garmin from "@/app/garmin/garmin";

export const revalidate = 120;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const garmin = new Garmin();
  await garmin.login();
  var respiration = await garmin.getRespiration();

  if (respiration == null) {
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
      lastUpdated: respiration.lastUpdated,
      respirationValuesArray: respiration.respirationValuesArray,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "maxage=0, s-maxage=120, stale-while-revalidate",
      },
    }
  );
}

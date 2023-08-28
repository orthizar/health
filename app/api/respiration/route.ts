import { NextResponse } from "next/server"
import { GarminConnect } from "garmin-connect"
import { kv } from "@vercel/kv";
import { Session } from "garmin-connect/dist/garmin/GarminConnect";

type Respiration = {
  userProfilePK: number | null;
  calendarDate: string,
  startTimestampGMT: string,
  endTimestampGMT: string,
  startTimestampLocal: string,
  endTimestampLocal: string,
  sleepStartTimestampGMT: string,
  sleepEndTimestampGMT: string,
  sleepStartTimestampLocal: string,
  sleepEndTimestampLocal: string,
  tomorrowSleepStartTimestampGMT: string,
  tomorrowSleepEndTimestampGMT: string,
  tomorrowSleepStartTimestampLocal: string,
  tomorrowSleepEndTimestampLocal: string,
  lowestRespirationValue: number,
  highestRespirationValue: number,
  avgWakingRespirationValue: number,
  avgSleepRespirationValue: number,
  avgTomorrowSleepRespirationValue: number,
  respirationValueDescriptorsDTOList: Array<Map<string, any>>,
  respirationValuesArray: Array<Map<number, number>>,
}

export async function GET(request: Request) {
  const GCClient = new GarminConnect({
    username: process.env.GARMIN_USERNAME ?? "",
    password: process.env.GARMIN_PASSWORD ?? "",
  })
  GCClient.onSessionChange(async (session) => {
    await kv.set('garmin_session', session);
  });
  GCClient.restoreOrLogin(await kv.get('garmin_session') as Session, process.env.GARMIN_USERNAME ?? "", process.env.GARMIN_PASSWORD ?? "");
  const url =
    'https://connect.garmin.com/modern/proxy/wellness-service/wellness/daily/respiration/';
  const dateString = (new Date(Date.now())).toISOString().split('T')[0];
  const respiration = await GCClient.get(url + dateString) as Respiration;
  respiration.userProfilePK = null;
  // Only last 12 hours
  respiration.respirationValuesArray = respiration.respirationValuesArray.filter((value: any) => {
    return value[1] > 0 && value[0] > Date.now() - 1000 * 60 * 60 * 12;
  });
  if (respiration == null) {
    return NextResponse.json({}, { status: 500, headers: { 'Cache-Control': 'maxage=0, s-maxage=1, stale-while-revalidate' } })
  }
  return NextResponse.json(respiration, { status: 200, headers: { 'Cache-Control': 'maxage=0, s-maxage=60, stale-while-revalidate' } })
}

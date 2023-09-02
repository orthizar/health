import { NextResponse } from "next/server"
import { GarminConnect } from "garmin-connect"
import { kv } from "@vercel/kv";
import { Session } from "garmin-connect/dist/garmin/GarminConnect";

const dynamic = 'force-dynamic';

type Spo2 = {
  lastUpdated: number | null,
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
  averageSpO2: number,
  lowestSpO2: number,
  lastSevenDaysAvgSpO2: number,
  latestSpO2: number,
  latestSpO2TimestampGMT: string,
  latestSpO2TimestampLocal: string,
  avgSleepSpO2: number,
  avgTomorrowSleepSpO2: number,
  spO2ValueDescriptorsDTOList: Array<Map<string, any>>,
  spO2SingleValues: Array<Map<number, number>>,
  continuousReadingDTOList: Array<Map<string, any>>,
  spO2HourlyAverages: Array<Map<number, number>>,
  error: string,
}

export async function GET(request: Request) {
  var GCClient = new GarminConnect({
    username: process.env.GARMIN_USERNAME ?? "",
    password: process.env.GARMIN_PASSWORD ?? "",
  })
  GCClient.onSessionChange(async (session) => {
    await kv.set('garmin_session', session);
  });
  GCClient = await GCClient.restoreOrLogin(await kv.get('garmin_session') as Session, process.env.GARMIN_USERNAME ?? "", process.env.GARMIN_PASSWORD ?? "");  const url =
    'https://connect.garmin.com/modern/proxy/wellness-service/wellness/daily/spo2/';
  const dateString = (new Date(Date.now())).toISOString().split('T')[0];
  try {
    var spo2 = await GCClient.get(url + dateString) as Spo2;
    spo2.userProfilePK = null;
    // Only last 12 hours
    spo2.spO2HourlyAverages = spo2.spO2HourlyAverages.filter((value: any) => {
      return value[0] > Date.now() - 1000 * 60 * 60 * 12;
    });
  } catch (error) {
    return NextResponse.json({}, { status: 500, headers: { 'Cache-Control': 'maxage=0, s-maxage=1, stale-while-revalidate' } })
  }
  spo2.lastUpdated = Date.now().valueOf();
  return NextResponse.json(spo2, { status: 200, headers: { 'Cache-Control': 'maxage=0, s-maxage=120, stale-while-revalidate' } })
}

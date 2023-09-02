import { NextResponse } from "next/server"
import { GarminConnect } from "garmin-connect";
import { kv } from "@vercel/kv";
import { Session } from "garmin-connect/dist/garmin/GarminConnect";

export const runtime = 'edge';

type HeartRate = {
  lastUpdated: number | null,
  userProfilePK: number | null;
  calendarDate: string,
  startTimestampGMT: string,
  endTimestampGMT: string,
  startTimestampLocal: string,
  endTimestampLocal: string,
  maxHeartRate: number,
  minHeartRate: number,
  restingHeartRate: number,
  lastSevenDaysAvgRestingHeartRate: number,
  heartRateValueDescriptors: Array<Map<string, any>>,
  heartRateValues: Array<Map<number, number>>,
}

export async function GET(request: Request) {
  var GCClient = new GarminConnect({
    username: process.env.GARMIN_USERNAME ?? "",
    password: process.env.GARMIN_PASSWORD ?? "",
  })
  GCClient.onSessionChange(async (session) => {
    await kv.set('garmin_session', session);
  });
  GCClient = await GCClient.restoreOrLogin(await kv.get('garmin_session') as Session, process.env.GARMIN_USERNAME ?? "", process.env.GARMIN_PASSWORD ?? "");


  try {
    var heartRate = await GCClient.getHeartRate(new Date(Date.now() - 1000 * 60 * 60 * 24)) as HeartRate;
    var heartRate2 = await GCClient.getHeartRate(new Date(Date.now())) as HeartRate;
    heartRate.userProfilePK = null;
    heartRate.heartRateValues.push(...heartRate2.heartRateValues);
    // Only last 12 hours  
    heartRate.heartRateValues = heartRate.heartRateValues.filter((value: any) => {
      return value[0] > Date.now() - 1000 * 60 * 60 * 12;
    });
  } catch (error) {
    return NextResponse.json({}, { status: 500, headers: { 'Cache-Control': 'maxage=0, s-maxage=1, stale-while-revalidate' } })
  }
  heartRate.lastUpdated = Date.now().valueOf();
  return NextResponse.json(heartRate, { status: 200, headers: { 'Cache-Control': 'maxage=0, s-maxage=60, stale-while-revalidate' } })
}
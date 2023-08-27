import { NextResponse } from "next/server"
import { GarminConnect } from "garmin-connect";
import { kv } from "@vercel/kv";
import { Session } from "garmin-connect/dist/garmin/GarminConnect";

type HeartRate = {
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
  const GCClient = new GarminConnect({
    username: process.env.GARMIN_USERNAME ?? "",
    password: process.env.GARMIN_PASSWORD ?? "",
  })
  GCClient.onSessionChange(async (session) => {
    await kv.set('garmin_session', session);
  });
  GCClient.restoreOrLogin(await kv.get('garmin_session') as Session, process.env.GARMIN_USERNAME ?? "", process.env.GARMIN_PASSWORD ?? "");



  var userInfo = await GCClient.getUserInfo();
  var heartRate = await GCClient.getHeartRate(new Date(Date.now() - 1000 * 60 * 60 * 24)) as HeartRate;
  var heartRate2 = await GCClient.getHeartRate(new Date(Date.now())) as HeartRate;
  heartRate.userProfilePK = null;
  heartRate.heartRateValues.push(...heartRate2.heartRateValues);
  // Only last 12 hours  
  heartRate.heartRateValues = heartRate.heartRateValues.filter((value: any) => {
    return value[0] > Date.now() - 1000 * 60 * 60 * 12;
  });
  if (heartRate == null) {
    return NextResponse.json({}, { status: 500, headers: { 'Cache-Control': 's-maxage=1, stale-while-revalidate' } })
  }
  return NextResponse.json(heartRate, { status: 200 })
}
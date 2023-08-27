import { NextResponse } from "next/server"
import { GARMIN_SSO_ORIGIN, SIGNIN_URL, dailyHeartRate, userInfo } from "@/app/garmin/urls";
import { GCUserHash } from "@/app/garmin/types";
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

// const getUserInfo = async () => {
//   const response = await fetch(userInfo());
//   const data = await response.json();
//   return data;
// };

// const getHeartRateData = async (userHash: GCUserHash) => {
//   const response = await fetch(dailyHeartRate(userHash));
//   const data = await response.json();
//   return data;
// };


export async function GET(request: Request) {
  const GCClient = new GarminConnect({
    username: process.env.GARMIN_USERNAME ?? "",
    password: process.env.GARMIN_PASSWORD ?? "",
  })
  GCClient.onSessionChange(async (session) => {
    await kv.set('garmin_session', session);
  });
  // await GCClient.login()
  GCClient.restoreOrLogin(await kv.get('garmin_session') as Session, process.env.GARMIN_USERNAME ?? "", process.env.GARMIN_PASSWORD ?? "");
  

  // const headers = {
  //   origin: GARMIN_SSO_ORIGIN,
  //   nk: 'NT',
  // };
  // const signInResponse = await fetch(SIGNIN_URL, {
  //   method: 'POST',
  //   headers,
  //   body: JSON.stringify({
  //     username: process.env.GARMIN_USERNAME,
  //     password: process.env.GARMIN_PASSWORD,
  //     rememberme: 'on',
  //     embed: 'false',
  //   }),
  // });
  // console.log(signInResponse);
  // // if (!signInResponse.ok) {
  // //   throw new Error('Login failed');
  // // }
  var userInfo = await GCClient.getUserInfo();
  // console.log(userInfo);
  var heartRate = await GCClient.getHeartRate(new Date(Date.now() - 1000*60*60*24)) as HeartRate;
  var heartRate2 = await GCClient.getHeartRate(new Date(Date.now())) as HeartRate;
  // console.log(heartRate);
  // var heartRate = await GCClient.getHeartRate(new Date(Date.now())) as HeartRate;
  heartRate.userProfilePK = null;
  heartRate.heartRateValues.push(...heartRate2.heartRateValues);
  // Only last 12 hours  
  heartRate.heartRateValues = heartRate.heartRateValues.filter((value) => {
    return value.entries().next().value[1] > Date.now() - 1000*60*60*12;
  });
  if (heartRate == null) {
    return NextResponse.json({}, { status: 500, headers: { 'Cache-Control': 's-maxage=1, stale-while-revalidate' } })
  }
  return NextResponse.json(heartRate, { status: 200 })
}
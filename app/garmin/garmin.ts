import { GarminConnect } from "garmin-connect";
import { kv } from "@vercel/kv";
import { IGarminTokens } from "garmin-connect/dist/garmin/types";

const GC_URL = "https://connectapi.garmin.com";
const GC_LEAGACY_URL = "https://connect.garmin.com";
const GC_MODERN_URL = "https://connect.garmin.com/modern";
const GC_HEART_RATE_URL = `${GC_URL}/wellness-service/wellness/dailyHeartRate`;
const GC_RESPIRATION_URL = `${GC_URL}/wellness-service/wellness/daily/respiration/`;
const GC_SPO2_URL = `${GC_URL}/wellness-service/wellness/daily/spo2/`;

type HeartRate = {
  lastUpdated: number | null;
  userProfilePK: number | null;
  calendarDate: string;
  startTimestampGMT: string;
  endTimestampGMT: string;
  startTimestampLocal: string;
  endTimestampLocal: string;
  maxHeartRate: number;
  minHeartRate: number;
  restingHeartRate: number;
  lastSevenDaysAvgRestingHeartRate: number;
  heartRateValueDescriptors: Array<Map<string, any>>;
  heartRateValues: Array<Map<number, number>>;
};

type Respiration = {
  lastUpdated: number | null;
  userProfilePK: number | null;
  calendarDate: string;
  startTimestampGMT: string;
  endTimestampGMT: string;
  startTimestampLocal: string;
  endTimestampLocal: string;
  sleepStartTimestampGMT: string;
  sleepEndTimestampGMT: string;
  sleepStartTimestampLocal: string;
  sleepEndTimestampLocal: string;
  tomorrowSleepStartTimestampGMT: string;
  tomorrowSleepEndTimestampGMT: string;
  tomorrowSleepStartTimestampLocal: string;
  tomorrowSleepEndTimestampLocal: string;
  lowestRespirationValue: number;
  highestRespirationValue: number;
  avgWakingRespirationValue: number;
  avgSleepRespirationValue: number;
  avgTomorrowSleepRespirationValue: number;
  respirationValueDescriptorsDTOList: Array<Map<string, any>>;
  respirationValuesArray: Array<Map<number, number>>;
};

type Spo2 = {
  lastUpdated: number | null;
  userProfilePK: number | null;
  calendarDate: string;
  startTimestampGMT: string;
  endTimestampGMT: string;
  startTimestampLocal: string;
  endTimestampLocal: string;
  sleepStartTimestampGMT: string;
  sleepEndTimestampGMT: string;
  sleepStartTimestampLocal: string;
  sleepEndTimestampLocal: string;
  tomorrowSleepStartTimestampGMT: string;
  tomorrowSleepEndTimestampGMT: string;
  tomorrowSleepStartTimestampLocal: string;
  tomorrowSleepEndTimestampLocal: string;
  averageSpO2: number;
  lowestSpO2: number;
  lastSevenDaysAvgSpO2: number;
  latestSpO2: number;
  latestSpO2TimestampGMT: string;
  latestSpO2TimestampLocal: string;
  avgSleepSpO2: number;
  avgTomorrowSleepSpO2: number;
  spO2ValueDescriptorsDTOList: Array<Map<string, any>>;
  spO2SingleValues: Array<Map<number, number>>;
  continuousReadingDTOList: Array<Map<string, any>>;
  spO2HourlyAverages: Array<Map<number, number>>;
  error: string;
};

class Garmin {
  GCClient: GarminConnect;
  userId: string | null = null;
  constructor() {
    this.GCClient = new GarminConnect({
      username: process.env.GARMIN_USERNAME ?? "",
      password: process.env.GARMIN_PASSWORD ?? "",
    });
  }
  async login() {
    console.log("Logging in");
    const session = (await kv.get("garmin_session")) as IGarminTokens;
    if (session.oauth1 && session.oauth2) {
      console.log("Loading session");
      this.GCClient.loadToken(session.oauth1, session.oauth2);
      // this.GCClient.loadTokenByFile("./garmin_session");
      await this.GCClient.client.checkTokenVaild();
      if (
        session.oauth2.access_token !==
        this.GCClient.exportToken().oauth2.access_token
      ) {
        console.log("Saving session");
        kv.set("garmin_session", this.GCClient.exportToken());
      }
      if (await this.GCClient.getUserProfile()) {
        console.log("Session functional");
        return;
      } else {
        console.log("Session invalid");
      }
    }
    console.log("New session");
    this.GCClient = await this.GCClient.login();
    // this.GCClient.exportTokenToFile("./garmin_session");
    console.log("Saving session");
    kv.set("garmin_session", this.GCClient.exportToken());
  }
  async getHeartRate() {
    var heartRate = (await this.GCClient.get(GC_HEART_RATE_URL, {
      params: {
        date: new Date(Date.now() - 1000 * 60 * 60 * 24)
          .toISOString()
          .split("T")[0],
      },
    })) as HeartRate;
    var heartRate2 = (await this.GCClient.get(GC_HEART_RATE_URL, {
      params: {
        date: new Date(Date.now()).toISOString().split("T")[0],
      },
    })) as HeartRate;
    heartRate.heartRateValues.push(...heartRate2.heartRateValues);
    heartRate.userProfilePK = null;
    // Only last 12 hours
    heartRate.heartRateValues = heartRate.heartRateValues.filter(
      (value: any) => {
        return value[0] > Date.now() - 1000 * 60 * 60 * 12;
      }
    );
    return heartRate;
  }

  async getRespiration() {
    var respiration = (await this.GCClient.get(
      GC_RESPIRATION_URL +
        new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split("T")[0]
    )) as Respiration;
    var respiration2 = (await this.GCClient.get(
      GC_RESPIRATION_URL + new Date(Date.now()).toISOString().split("T")[0]
    )) as Respiration;
    respiration.respirationValuesArray.push(
      ...respiration2.respirationValuesArray
    );
    respiration.userProfilePK = null;
    // Only last 12 hours
    respiration.respirationValuesArray =
      respiration.respirationValuesArray.filter((value: any) => {
        return value[1] > 0 && value[0] > Date.now() - 1000 * 60 * 60 * 12;
      });
    return respiration;
  }

  async getSpo2() {
    var spo2 = (await this.GCClient.get(
      GC_SPO2_URL +
        new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split("T")[0]
    )) as Spo2;
    var spo22 = (await this.GCClient.get(
      GC_SPO2_URL + new Date(Date.now()).toISOString().split("T")[0]
    )) as Spo2;
    spo2.spO2HourlyAverages.push(...spo22.spO2HourlyAverages);
    spo2.userProfilePK = null;
    // Only last 12 hours
    spo2.spO2HourlyAverages = spo2.spO2HourlyAverages.filter((value: any) => {
      return value[0] > Date.now() - 1000 * 60 * 60 * 12;
    });
    return spo2;
  }
}

export default Garmin;

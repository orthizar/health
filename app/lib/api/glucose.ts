import { DateTime } from "luxon";

export async function getGlucoseData() {
  const authRes = await fetch("https://api-eu.libreview.io/llu/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      product: "llu.android",
      version: "4.7.0",
    },
    body: JSON.stringify({
      email: process.env.LIBREVIEW_EMAIL,
      password: process.env.LIBREVIEW_PASSWORD,
    }),
  });
  const authData = await authRes.json();
  if (authData.status != "0") {
    return { error: "Internal Server Error" };
  }
  const token = authData.data.authTicket.token;
  const connectionsRes = await fetch(
    "https://api-eu.libreview.io/llu/connections",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        product: "llu.android",
        version: "4.7.0",
        authorization: `Bearer ${token}`,
      },
    }
  );
  const connectionsData = await connectionsRes.json();
  // const connectionLogbookRes = await fetch(
  //   `https://api-eu.libreview.io/llu/connections/${connectionsData.data[0].patientId}/logbook`,
  //   {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //       product: "llu.android",
  //       version: "4.7.0",
  //       authorization: `Bearer ${token}`,
  //     },
  //   }
  // );
  // const connectionLogbook = await connectionLogbookRes.json();
  // console.log(connectionLogbook);
  const connectionGraphRes = await fetch(
    `https://api-eu.libreview.io/llu/connections/${connectionsData.data[0].patientId}/graph`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        product: "llu.android",
        version: "4.7.0",
        authorization: `Bearer ${token}`,
      },
    }
  );
  const connectionGraphData = await connectionGraphRes.json();
  const graphData: Array<{
    FactoryTimestamp: "string";
    Timestamp: "string"; //  "6/15/2023 7:43:19 PM" for example
    type: number;
    ValueInMgPerDl: number;
    MeasurementColor: number;
    GlucoseUnits: number;
    Value: number;
    isHigh: boolean;
    isLow: boolean;
  }> = connectionGraphData.data.graphData;
  const glucoseMeasurement: {
    FactoryTimestamp: "string";
    Timestamp: "string";
    type: number;
    ValueInMgPerDl: number;
    MeasurementColor: number;
    GlucoseUnits: number;
    Value: number;
    isHigh: boolean;
    isLow: boolean;
    TrendArrow: number;
    TrendMessage: "string";
  } = connectionsData.data[0].glucoseMeasurement;
  const glucoseData: {
    graphData: Array<{ timestamp: number; glucose: number }>;
    latestMeasurement: {
      timestamp: number;
      glucose: number;
    };
  } = {
    graphData: graphData.map((data) => {
      return {
        timestamp: DateTime.fromFormat(
          data.Timestamp,
          "M/d/yyyy h:mm:ss a"
        ).toMillis() as number,
        glucose: data.Value,
      };
    }),
    latestMeasurement: {
      timestamp: DateTime.fromFormat(
        glucoseMeasurement.Timestamp,
        "M/d/yyyy h:mm:ss a"
      ).toMillis() as number,
      glucose: glucoseMeasurement.Value,
    },
  };
  return glucoseData;
}

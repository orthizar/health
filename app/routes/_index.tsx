import { HeadersFunction, json, type MetaFunction } from "@remix-run/node";
import { ModeToggle } from "~/components/mode-toggle";
import { GlucoseChart } from "~/components/glucose-chart";
import { DateTime } from "luxon";
import { useLoaderData } from "@remix-run/react";
import { getGlucoseData } from "~/lib/api/glucose";
export const meta: MetaFunction = () => {
  return [
    { title: "Health of Silvan Kohler" },
    { name: "description", content: "Silvan Kohler's health status" },
  ];
};

export const headers: HeadersFunction = () => ({
  "Cache-Control": "public, max-age=60",
});

export async function loader() {
  // const generateRandomData = (numPoints: number): number[] => {
  //   const data = [];
  //   for (let i = 0; i < numPoints; i++) {
  //     data.push(Math.random() * 21); // Random values between 0 and 100
  //   }
  //   return data;
  // };

  // const smoothData = (data: number[], factor: number): number[] => {
  //   const smoothed = [];
  //   for (let i = 0; i < data.length; i++) {
  //     let sum = 0;
  //     for (let j = Math.max(0, i - factor); j <= i; j++) {
  //       sum += data[j];
  //     }
  //     smoothed.push(sum / (i - Math.max(0, i - factor) + 1)); // Moving average
  //   }
  //   return smoothed;
  // };

  // const glucoseData = smoothData(generateRandomData(12 * 12), 10).map(
  //   (value, index) => {
  //     return {
  //       timestamp: DateTime.local()
  //         .minus({ minutes: 12 * 60 - index * 5 })
  //         .toMillis(),
  //       glucose: value,
  //     };
  //   }
  // );

  // const data = {
  //   glucoseData: {
  //     graphData: glucoseData,
  //     latestMeasurement: {
  //       timestamp: DateTime.local().plus({ minutes: 20 }).toMillis(),
  //       glucose: glucoseData[glucoseData.length - 1].glucose + 3,
  //     },
  //   },
  // };

  const [glucoseData] = await Promise.allSettled([getGlucoseData()]);

  const data = {
    glucoseData:
      glucoseData.status === "fulfilled"
        ? "error" in glucoseData.value
          ? null
          : glucoseData.value
        : null,
  };
  return data;
}

export default function Index() {
  const { glucoseData } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col sm:gap-4">
      <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
        <h1 className="hover:text-primary">Health of Silvan Kohler</h1>
        <ModeToggle />
      </header>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row sm:p-8">
          <div className="grid w-full gap-6 sm:grid-cols-2">
            <GlucoseChart glucoseData={glucoseData} />
          </div>
        </div>
      </main>
    </div>
  );
}

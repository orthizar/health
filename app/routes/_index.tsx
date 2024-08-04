import type { MetaFunction } from "@remix-run/node";
import { ModeToggle } from "~/components/mode-toggle";
import { GlucoseChart } from "~/components/glucose-chart";
export const meta: MetaFunction = () => {
  return [
    { title: "Health of Silvan Kohler" },
    { name: "description", content: "Silvan Kohler's health status" },
  ];
};

export default function Index() {
  return (
    <div className="flex flex-col sm:gap-4">
      <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
        <h1 className="hover:text-primary">Health of Silvan Kohler</h1>
        <ModeToggle />
      </header>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row sm:p-8">
          <div className="grid w-full gap-6 sm:grid-cols-2">
            <GlucoseChart />
            <GlucoseChart />
          </div>
        </div>
      </main>
    </div>
  );
}

import dynamic from "next/dynamic";

const TimelinePage = dynamic(
  () => import("../src/timeline/timeline.page").then((r) => r.default),
  {
    ssr: false,
  }
);

export default function Page() {
  return <TimelinePage />;
}

import App from "@/components/App";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <App view="job" jobId={(await params).id} />;
}

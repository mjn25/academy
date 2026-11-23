import AppRoot from "@/components/app-root";

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const initialPath = "/" + (slug ?? []).join("/");
  return <AppRoot initialPath={initialPath} />;
}

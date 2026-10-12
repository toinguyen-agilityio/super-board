import { Suspense } from "react";
import { redirect } from "next/navigation";
import { findTemplate } from "@/lib/templates";
import InvitationEditor from "./InvitationEditor";

export default function TaoPage({ searchParams }: PageProps<"/tao">) {
  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Tạo thiệp cưới</h1>
      <Suspense fallback={null}>
        <ChosenTemplate searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ChosenTemplate({
  searchParams,
}: Pick<PageProps<"/tao">, "searchParams">) {
  const template = findTemplate((await searchParams).mau);
  if (!template) redirect("/");
  return <InvitationEditor template={{ id: template.id, name: template.name }} />;
}

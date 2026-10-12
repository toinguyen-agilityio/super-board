import Image from "next/image";
import Link from "next/link";
import { templates } from "@/lib/templates";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Chọn mẫu thiệp cưới</h1>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {templates.map((t) => (
          <li key={t.id}>
            <Link
              href={`/tao?mau=${t.id}`}
              className="block rounded-lg border border-neutral-200 p-3 hover:shadow-md"
            >
              <Image
                src={t.thumbnail}
                alt={`Mẫu ${t.name}`}
                width={300}
                height={400}
                className="h-auto w-full rounded"
              />
              <h2 className="mt-3 text-lg font-medium">{t.name}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

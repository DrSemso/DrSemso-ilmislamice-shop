import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/catalog";
import { getAuthors } from "@/lib/data";

type Params = Promise<{ slug: string }>;
type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const a = (await getAuthors()).find((x) => x.slug === slug);
  return { title: a?.name ?? "Autor", description: a?.bio ?? undefined };
}

export default async function Page({ params, searchParams }: { params: Params; searchParams: SP }) {
  const { slug } = await params;
  const author = (await getAuthors()).find((x) => x.slug === slug);
  if (!author) notFound();
  return (
    <Catalog
      title={author.name}
      eyebrow="Autor"
      intro={author.bio}
      crumbs={[{ label: "Početna", href: "/" }, { label: "Autori", href: "/autori" }, { label: author.name }]}
      query={{ authorId: author.id }}
      searchParams={await searchParams}
      basePath={`/autori/${slug}`}
    />
  );
}

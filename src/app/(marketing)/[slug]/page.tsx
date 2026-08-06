import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { keywordPages } from "../keywords";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return keywordPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = keywordPages.find((item) => item.slug === slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.description
    }
  };
}

export default async function KeywordPage({ params }: PageProps) {
  const { slug } = await params;
  const page = keywordPages.find((item) => item.slug === slug);
  if (!page) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ShortVideoAuto",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    description: page.description
  };

  return (
    <main className="shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="topbar">
        <Link className="brand" href="/">
          ShortVideoAuto
        </Link>
        <nav className="nav" aria-label="Chính">
          <Link href="/features">Tính năng</Link>
          <Link href="/pricing">Bảng giá</Link>
          <Link href="/samples/demo">Mẫu video</Link>
          <Link href="/login">Đăng nhập</Link>
        </nav>
      </header>
      <section className="page hero">
        <div>
          <p className="eyebrow">SEO resource</p>
          <h1>{page.title}</h1>
          <p className="lead">{page.description}</p>
          <div className="actions">
            <Link className="button primary" href="/dashboard">
              Dùng thử
            </Link>
            <Link className="button" href="/">
              Xem tổng quan
            </Link>
          </div>
        </div>
        <div className="panel">
          <h2>Quy trình</h2>
          <p>Dán link sản phẩm, chọn script, tạo voice tiếng Việt, render MP4 1080x1920.</p>
        </div>
      </section>
    </main>
  );
}

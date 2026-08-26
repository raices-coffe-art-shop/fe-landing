import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { baseOpenGraph } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { PostBody } from "@/components/PostBody";
import { JsonLd } from "@/components/JsonLd";
import { getPostBySlug, getPosts } from "@/sanity/lib/posts";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/siteUrl";
import { formatPostDate } from "@/lib/postDate";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Publicación no encontrada", robots: { index: false } };
  }

  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt,
    alternates: { canonical: `/publicaciones/${post.slug}` },
    openGraph: {
      ...baseOpenGraph,
      type: "article",
      url: `/publicaciones/${post.slug}`,
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt,
      publishedTime: post.publishedAt,
      images: [{ url: post.coverImage.src, alt: post.coverImage.alt }],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const otherPosts = (await getPosts()).filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", url: absoluteUrl("/") },
          { name: "Publicaciones", url: absoluteUrl("/publicaciones") },
          { name: post.title, url: absoluteUrl(`/publicaciones/${post.slug}`) },
        ])}
      />
      <SiteHeader />
      <main className="detail-page post-page">
        <section className="detail-hero post-hero">
          <div className="detail-hero-pattern" aria-hidden="true" />
          <div className="page-shell post-hero-grid">
            <div>
              <Link href="/publicaciones" className="back-link">← Volver a publicaciones</Link>
              <p className="eyebrow light">
                <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                {post.author ? ` · ${post.author}` : ""}
              </p>
              <h1>{post.title}</h1>
              <p className="detail-lead">{post.excerpt}</p>
            </div>
            <div className="post-hero-media">
              <img src={post.coverImage.src} alt={post.coverImage.alt} />
            </div>
          </div>
        </section>

        <article className="page-shell post-article">
          <PostBody value={post.body} />
        </article>

        {otherPosts.length > 0 && (
          <section className="page-shell post-more">
            <p className="eyebrow">Seguir leyendo</p>
            <ul className="posts-grid">
              {otherPosts.map((item) => (
                <li key={item.id} className="post-card">
                  <Link href={`/publicaciones/${item.slug}`} className="post-card-link">
                    <span className="post-card-media">
                      <img src={item.coverImage.src} alt={item.coverImage.alt} loading="lazy" decoding="async" />
                    </span>
                    <span className="post-card-body">
                      <time className="post-card-date" dateTime={item.publishedAt}>
                        {formatPostDate(item.publishedAt)}
                      </time>
                      <h2 className="post-card-title">{item.title}</h2>
                      <span className="post-card-cta">Leer publicación ↗</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

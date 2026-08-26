import type { Metadata } from "next";
import Link from "next/link";
import { baseOpenGraph } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { getPosts } from "@/sanity/lib/posts";
import { formatPostDate } from "@/lib/postDate";

export const metadata: Metadata = {
  title: "Publicaciones",
  description:
    "Historias, novedades y apuntes de Raíces: el café de Ayacucho, las personas detrás de cada producto y lo que ocurre en el local.",
  alternates: { canonical: "/publicaciones" },
  openGraph: { ...baseOpenGraph, url: "/publicaciones", title: "Publicaciones de Raíces — Café y Cultura" },
};

export default async function PublicacionesPage() {
  const posts = await getPosts();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="posts-hero">
          <div className="posts-hero-pattern" aria-hidden="true" />
          <div className="page-shell posts-hero-grid">
            <div>
              <p className="eyebrow light">Publicaciones</p>
              <h1>Lo que vamos escribiendo desde Raíces.</h1>
            </div>
            <p className="posts-hero-note">
              Historias de origen, novedades del local y apuntes sobre el café, el cacao y las personas
              que los hacen posibles.
            </p>
          </div>
        </section>

        <section className="posts-section page-shell">
          {posts.length === 0 ? (
            <p className="posts-empty">
              Aún no hay publicaciones. Muy pronto compartiremos las primeras historias.
            </p>
          ) : (
            <ul className="posts-grid">
              {posts.map((post) => (
                <li key={post.id} className="post-card">
                  <Link href={`/publicaciones/${post.slug}`} className="post-card-link">
                    <span className="post-card-media">
                      <img src={post.coverImage.src} alt={post.coverImage.alt} loading="lazy" decoding="async" />
                    </span>
                    <span className="post-card-body">
                      <time className="post-card-date" dateTime={post.publishedAt}>
                        {formatPostDate(post.publishedAt)}
                      </time>
                      <h2 className="post-card-title">{post.title}</h2>
                      <span className="post-card-excerpt">{post.excerpt}</span>
                      <span className="post-card-cta">Leer publicación ↗</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

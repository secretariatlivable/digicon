import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Share2,
  Sparkles,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/Layouts";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SectionHeading,
} from "@/components/kit";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import type { BlogPost } from "@/types";

const AUTHOR = {
  name: "Alvin M. Silva",
  url: "https://alvin-silva.asilvainnovations.com/",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-PH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getReadingTime(body: string) {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wordCount / 220))} min read`;
}

function renderInlineLinks(value: string) {
  return value.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
    const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (!match) return part;
    const [, label, href] = match;
    if (href.startsWith("/")) return <Link key={index} to={href} className="font-semibold text-sky hover:underline">{label}</Link>;
    if (/^https?:\/\//i.test(href)) return <a key={index} href={href} target="_blank" rel="noreferrer" className="font-semibold text-sky hover:underline">{label}</a>;
    return label;
  });
}

function splitArticleBody(body: string) {
  const referenceHeading = /\n{2,}(?:#{1,3}\s*)?references\s*\n/i;
  const parts = body.split(referenceHeading);

  return {
    content: parts[0]?.trim() ?? "",
    references: parts
      .slice(1)
      .join("\n")
      .trim()
      .split(/\n+/)
      .map((reference) => reference.trim())
      .filter(Boolean),
  };
}

function setMetaTag(name: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`,
  );

  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }

  tag.content = content;
}

function setPropertyTag(property: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  );

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }

  tag.content = content;
}

function useArticleSeo(post?: BlogPost) {
  useEffect(() => {
    if (!post) return;

    const title = post.seo_title?.trim() || post.title;
    const description = post.seo_description?.trim() || post.excerpt;
    const canonicalUrl = window.location.href;

    document.title = `${title} | DigiCon`;
    setMetaTag("description", description);
    setMetaTag("author", AUTHOR.name);
    setPropertyTag("og:type", "article");
    setPropertyTag("og:title", title);
    setPropertyTag("og:description", description);
    setPropertyTag("og:url", canonicalUrl);
    if (post.cover_url) {
      const imageUrl = /^https?:\\/\\//i.test(post.cover_url)
        ? post.cover_url
        : new URL(post.cover_url, window.location.origin).href;
      setPropertyTag("og:image", imageUrl);
    }
    setMetaTag("twitter:card", "summary_large_image");

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = canonicalUrl;

    const existingSchema = document.getElementById("digicon-article-schema");
    existingSchema?.remove();

    const schema = document.createElement("script");
    schema.id = "digicon-article-schema";
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description,
      datePublished: post.created_at,
      dateModified: post.created_at,
      mainEntityOfPage: canonicalUrl,
      author: {
        "@type": "Person",
        name: AUTHOR.name,
        url: AUTHOR.url,
      },
      publisher: {
        "@type": "Organization",
        name: "DigiCon",
      },
      keywords: post.tags.join(", "),
      image: post.cover_url
        ? new URL(post.cover_url, window.location.origin).href
        : undefined,
    });

    document.head.appendChild(schema);

    return () => {
      schema.remove();
    };
  }, [post]);
}

function ArticleAuthor() {
  return (
    <p className="dense text-sm text-muted-foreground">
      Written by{" "}
      <a
        href={AUTHOR.url}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-sky hover:underline"
      >
        {AUTHOR.name}
      </a>
    </p>
  );
}

function ShareArticle({ post }: { post: BlogPost }) {
  const share = async () => {
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Dismissing native sharing is an expected user action.
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void share()}
      data-testid="article-share"
    >
      <Share2 className="mr-2 h-4 w-4" aria-hidden />
      Share article
    </Button>
  );
}

export function Blog() {
  const posts = useQuery({
    queryKey: ["posts"],
    queryFn: () => apiGet<BlogPost[]>("/posts"),
    retry: false,
  });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <SectionHeading
          eyebrow="Resources"
          title="The DigiCon blog"
          testId="blog-heading"
        />

        {posts.isLoading && <LoadingState testId="blog-loading" />}

        {posts.isError && (
          <ErrorState
            label="Articles aren't available right now."
            testId="blog-error"
          />
        )}

        {posts.data?.length === 0 && (
          <EmptyState
            title="No articles yet"
            body="New writing on networking and relationship building is on the way."
            testId="blog-empty"
          />
        )}

        <ul className="space-y-4">
          {posts.data?.map((post) => (
            <li key={post.id}>
              <Link
                to={`/blog/${post.slug}`}
                className="glass group block rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/10"
                data-testid={`blog-post-${post.slug}`}
              >
                {post.cover_url && <img src={post.cover_url} alt="" loading="lazy" className="mb-4 h-44 w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-[1.01]" />}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="dense">
                    {post.category}
                  </Badge>

                  <span className="dense flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" aria-hidden />
                    {formatDate(post.created_at)}
                  </span>

                  <span className="dense flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3" aria-hidden />
                    {getReadingTime(post.body)}
                  </span>
                </div>

                <h2 className="font-heading mt-2 text-lg font-bold">
                  {post.title}
                </h2>

                <p className="dense mt-1.5 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>

                <p className="dense mt-3 text-xs text-muted-foreground">
                  By {AUTHOR.name}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PublicLayout>
  );
}

export function BlogArticle() {
  const { slug = "" } = useParams<{ slug: string }>();

  const post = useQuery({
    queryKey: ["post", slug],
    queryFn: () => apiGet<BlogPost>(`/posts/${slug}`),
    retry: false,
  });

  useArticleSeo(post.data);

  const article = useMemo(
    () => (post.data ? splitArticleBody(post.data.body) : null),
    [post.data],
  );

  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <Link
          to="/blog"
          className="dense inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          data-testid="article-back"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All articles
        </Link>

        {post.isLoading && <LoadingState testId="article-loading" />}

        {post.isError && (
          <ErrorState
            label="That article isn't published."
            testId="article-error"
          />
        )}

        {post.data && article && (
          <div className="mt-5">
            <Badge variant="secondary" className="dense">
              <Sparkles className="mr-1 h-3 w-3" aria-hidden />
              {post.data.category}
            </Badge>

            <h1
              className="font-heading mt-3 text-3xl font-extrabold sm:text-4xl"
              data-testid="article-title"
            >
              {post.data.title}
            </h1>

            {post.data.cover_url && (
              <div className="relative mt-7 overflow-hidden rounded-2xl">
                <img src={post.data.cover_url} alt={post.data.title} className="max-h-[440px] w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06152d]/85 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 text-white sm:p-7">
                  <p className="text-[10px] font-bold uppercase tracking-[.22em] text-cyan-200">DigiCon · More Than a Digital Business Card</p>
                  <p className="mt-2 max-w-lg text-xl font-bold sm:text-2xl">Your connections. Your relationships. Your growth.</p>
                </div>
              </div>
            )}

            <p className="dense mt-5 text-lg text-muted-foreground">
              {post.data.excerpt}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <ArticleAuthor />

              <span className="dense flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" aria-hidden />
                {formatDate(post.data.created_at)}
              </span>

              <span className="dense flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" aria-hidden />
                {getReadingTime(post.data.body)}
              </span>
            </div>

            <div
              className="dense mt-8 space-y-5 text-base leading-relaxed"
              data-testid="article-body"
            >
              {article.content
                .split(/\n{2,}/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph, index) => {
                  const clean = paragraph.replace(/\s+/g, " ").trim();
                  const heading = clean.length < 105 && !/[.!?]$/.test(clean) && !clean.startsWith('"');
                  const listItem = /^[●•*-]\s+/.test(clean);
                  if (heading) return <h2 key={index} className="font-heading pt-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">{clean.replace(/^#+\s*/, "")}</h2>;
                  if (listItem) return <p key={index} className="rounded-lg border-l-2 border-cyan-500 bg-cyan-500/5 px-4 py-2">{clean.replace(/^[●•*-]\s+/, "")}</p>;
                  return <p key={index}>{renderInlineLinks(clean)}</p>;
                })}
            </div>

            {post.data.slug.startsWith("digicon-redefining-professional-networking") && (
              <figure className="my-10 overflow-hidden rounded-2xl border border-border/70 bg-[#071a35] p-4 sm:p-6">
                <img src="/digicon_dcard.svg" alt="DigiCon digital business card interface" loading="lazy" className="mx-auto max-h-[520px] w-full rounded-xl object-contain" />
                <figcaption className="mt-3 text-center text-xs text-slate-400">DigiCon digital card — a shareable professional identity and the starting point for a connection.</figcaption>
              </figure>
            )}

            {post.data.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-border/60 pt-6">
                {post.data.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="dense">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {article.references.length > 0 && (
              <section
                className="mt-10 border-t border-border/60 pt-6"
                aria-labelledby="article-references"
              >
                <h2
                  id="article-references"
                  className="font-heading text-xl font-bold"
                >
                  References
                </h2>

                <ol className="dense mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {article.references.map((reference) => (
                    <li key={reference}>{reference}</li>
                  ))}
                </ol>
              </section>
            )}

            <section className="relative mt-12 overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#071a35] p-6 text-white shadow-xl shadow-cyan-950/15 sm:p-8">
              <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl" />
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[.24em] text-cyan-200">Make every connection count</p>
                <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Create Your DigiCon</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Build your professional digital identity, share it in seconds and give every meaningful introduction a next step.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to="/signup" className={buttonVariants({ size: "lg" })} data-testid="article-signup">Create Your DigiCon</Link>
                  <Link to="/" className={buttonVariants({ size: "lg", variant: "outline" }) + " border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"}>Explore DigiCon</Link>
                  {post.data.slug.includes("five-minute") && <Link to="/resources/five-minute-networking-tracker" className={buttonVariants({ size: "lg", variant: "outline" }) + " border-cyan-200/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20 hover:text-white"}>Download the A4 tracker</Link>}
                </div>
              </div>
            </section>
            <div className="mt-7 flex flex-wrap gap-3">
              <ShareArticle post={post.data} />
            </div>
          </div>
        )}
      </article>
    </PublicLayout>
  );
}
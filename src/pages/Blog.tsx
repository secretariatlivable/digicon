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
      image: post.cover_url || undefined,
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
                className="glass block rounded-xl p-5 transition-transform duration-200 hover:-translate-y-0.5"
                data-testid={`blog-post-${post.slug}`}
              >
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

            <p className="dense mt-3 text-lg text-muted-foreground">
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
                .map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
            </div>

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

            <div className="mt-10 flex flex-wrap gap-3 border-t border-border/60 pt-6">
              <ShareArticle post={post.data} />

              <Link
                to="/signup"
                className={buttonVariants({ size: "sm" })}
                data-testid="article-signup"
              >
                Build your DigiCon
              </Link>
            </div>
          </div>
        )}
      </article>
    </PublicLayout>
  );
}
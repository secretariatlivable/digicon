# DigiCon blog publishing

## Publishing workspace

- Open `/tools` while signed in as a DigiCon super administrator.
- The route is protected by the existing `Protected adminOnly` guard.
- Create a post with a title, excerpt, body, category, tags, featured image URL, SEO title and SEO description.
- Use **Preview article** to inspect the draft and the search preview panel to check metadata.
- Select **Publish immediately** to make the article visible on `/blog`. Drafts remain available in the private admin library.
- The existing API authorizes all create, update and delete operations with the backend `current_admin` dependency.

## Publish the three supplied launch articles

The complete source article text and publication metadata are stored in `backend/blog_seed.json`. The seeder is idempotent and updates the matching article by slug.

After the backend has been deployed and its existing `MONGO_URL` and `DB_NAME` environment variables are configured, run once from the backend working directory:

```bash
cd backend
python seed_blog_posts.py
```

The script prints the three public `/blog/<slug>` routes. It marks each imported article as published. The API accepts up to 50,000 characters per article to preserve the full supplied copy.

## Five-Minute Networking Tracker

- Public page: `/resources/five-minute-networking-tracker`
- Direct PDF: the page downloads the one-page A4 file from `/five-minute-networking-tracker.pdf.base64` and converts it into a PDF download in the browser.
- The page also provides a print action with A4 print styling.

## SEO and imagery

The public article page sets the document title, description, canonical URL, Open Graph metadata and BlogPosting JSON-LD. The DigiCon networking article uses the branded `public/digicon-networking-featured.svg` artwork and the existing `public/digicon_dcard.svg` card visual. Actual connection-interface and relationship-dashboard screenshot assets were not present in the repository during implementation; add approved product screenshots before describing those visuals as screenshots.

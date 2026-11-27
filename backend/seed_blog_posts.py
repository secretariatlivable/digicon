"""Idempotently publish the supplied DigiCon launch articles into MongoDB.

Run from the backend directory after deployment:
    python seed_blog_posts.py
"""
import asyncio
import json
import re
from datetime import datetime, timezone
from pathlib import Path

from lib.db import db

DATA = Path(__file__).with_name("blog_seed.json")


def slugify(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:90]


async def main() -> None:
    records = json.loads(DATA.read_text(encoding="utf-8"))
    now = datetime.now(timezone.utc)
    for record in records:
        slug = slugify(record["title"])
        payload = {**record, "slug": slug, "created_at": now}
        await db.blog_posts.update_one(
            {"slug": slug},
            {"$set": payload, "$setOnInsert": {"id": f"seed-{slug}"}},
            upsert=True,
        )
        print(f"Published: /blog/{slug}")
    print(f"Processed {len(records)} DigiCon articles.")


if __name__ == "__main__":
    asyncio.run(main())

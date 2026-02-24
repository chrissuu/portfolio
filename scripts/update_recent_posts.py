#!/usr/bin/env python3
import html
import json
import os
import re
import sys


FRONT_MATTER_BOUNDARY = "---"
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
POSTS_DIR = os.path.join(ROOT_DIR, "bleu", "_posts")
OUTPUT_JSON = os.path.join(ROOT_DIR, "recent.json")
OUTPUT_INDEX = os.path.join(ROOT_DIR, "index.html")
OUTPUT_SITEMAP = os.path.join(ROOT_DIR, "sitemap.xml")
DEFAULT_COUNT = 8

START_MARKER = "<!-- recent-posts:start -->"
END_MARKER = "<!-- recent-posts:end -->"


def parse_front_matter(text):
    lines = text.splitlines()
    if not lines or lines[0].strip() != FRONT_MATTER_BOUNDARY:
        return {}

    front_matter = {}
    for line in lines[1:]:
        if line.strip() == FRONT_MATTER_BOUNDARY:
            break
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        front_matter[key.strip()] = value.strip().strip('"').strip("'")
    return front_matter


def extract_date_from_filename(filename):
    match = re.match(r"(\d{4}-\d{2}-\d{2})-", filename)
    if not match:
        return None
    return match.group(1)


def load_posts():
    posts = []
    for filename in os.listdir(POSTS_DIR):
        if not filename.endswith(".md"):
            continue
        date = extract_date_from_filename(filename)
        if not date:
            continue
        path = os.path.join(POSTS_DIR, filename)
        with open(path, "r", encoding="utf-8") as handle:
            content = handle.read()
        front_matter = parse_front_matter(content)
        if front_matter.get("private", "").lower() == "true":
            continue
        title = front_matter.get("title", filename)
        subtitle = front_matter.get("subtitle", "")
        slug = filename[:-3]
        posts.append(
            {
                "title": title,
                "subtitle": subtitle,
                "date": date,
                "url": f"https://www.chrissuu.com/bleu/{slug}/",
            }
        )
    posts.sort(key=lambda item: item["date"], reverse=True)
    return posts


def format_list_items(posts):
    lines = []
    for post in posts:
        title = html.escape(post["title"])
        subtitle = html.escape(post["subtitle"])
        date = html.escape(post["date"])
        url = html.escape(post["url"], quote=True)
        link_title = html.escape(
            f"Read '{post['title']}' on Chris Su's CMU blog",
            quote=True,
        )
        subtitle_html = f" - {subtitle}" if subtitle else ""
        lines.append(
            f'        <li>{date} — <a href="{url}" title="{link_title}">{title}</a>{subtitle_html}</li>'
        )
    return "\n".join(lines)


def update_index_html(list_items_html):
    with open(OUTPUT_INDEX, "r", encoding="utf-8") as handle:
        content = handle.read()

    if START_MARKER not in content or END_MARKER not in content:
        print("Missing recent posts markers in index.html.", file=sys.stderr)
        sys.exit(1)

    before, remainder = content.split(START_MARKER, 1)
    _, after = remainder.split(END_MARKER, 1)
    updated = f"{before}{START_MARKER}\n{list_items_html}\n        {END_MARKER}{after}"

    with open(OUTPUT_INDEX, "w", encoding="utf-8") as handle:
        handle.write(updated)


def update_sitemap(posts):
    static_urls = [
        "https://www.chrissuu.com/",
        "https://www.chrissuu.com/bleu/",
        "https://www.chrissuu.com/bleu/tags/",
        "https://www.chrissuu.com/bleu/feed.xml",
        "https://www.chrissuu.com/rito/",
    ]

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for url in static_urls:
        lines.append("  <url>")
        lines.append(f"    <loc>{html.escape(url)}</loc>")
        lines.append("  </url>")

    for post in posts:
        lines.append("  <url>")
        lines.append(f"    <loc>{html.escape(post['url'])}</loc>")
        lines.append(f"    <lastmod>{html.escape(post['date'])}</lastmod>")
        lines.append("  </url>")

    lines.append("</urlset>")

    with open(OUTPUT_SITEMAP, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")


def main():
    count = DEFAULT_COUNT
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            print("Usage: update_recent_posts.py [count]", file=sys.stderr)
            sys.exit(1)

    if count < 1:
        print("Count must be >= 1.", file=sys.stderr)
        sys.exit(1)

    all_posts = load_posts()
    posts = all_posts[:count]
    output = {"posts": posts}

    with open(OUTPUT_JSON, "w", encoding="utf-8") as handle:
        json.dump(output, handle, indent=2)
        handle.write("\n")

    update_index_html(format_list_items(posts))
    update_sitemap(all_posts)


if __name__ == "__main__":
    main()

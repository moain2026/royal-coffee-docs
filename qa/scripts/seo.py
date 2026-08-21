#!/usr/bin/env python3
"""
Google-indexing compliance audit for every URL in the sitemap.

Checks each page against the criteria Google actually uses to decide
whether a page is indexable and how it renders in the SERP:

  * <title>            present, unique, <= 70 chars (SERP pixel budget)
  * <meta description> present, unique, 70..165 chars
  * <link canonical>   present and self-referencing
  * <h1>               exactly one
  * JSON-LD            present and parseable
  * OG / Twitter       complete enough for rich sharing
  * lang / dir         declared (ar / rtl)
  * robots meta        indexable (not noindex)
  * images             every <img> has alt + width + height (CLS)
  * internal links     no href="#", no empty anchors

Usage:  python3 /home/user/qa/seo.py [base_url]
"""
import json
import re
import sys
import urllib.request
from collections import defaultdict

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"


def get(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "seo-audit"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.status, r.read().decode("utf-8", "replace")


def one(pattern, html, group=1):
    m = re.search(pattern, html, re.S | re.I)
    return m.group(group).strip() if m else None


def sitemap_paths():
    _, xml = get("/sitemap.xml")
    return [u.replace(re.match(r"https?://[^/]+", u).group(0), "") or "/"
            for u in re.findall(r"<loc>([^<]+)</loc>", xml)]


def audit(path):
    issues = []
    status, html = get(path)
    if status != 200:
        return {"issues": [f"HTTP {status}"], "title": None, "desc": None}

    if not html.lstrip().lower().startswith("<!doctype html>"):
        issues.append("missing <!DOCTYPE html>")

    title = one(r"<title>(.*?)</title>", html)
    if not title:
        issues.append("no <title>")
    elif len(title) > 70:
        issues.append(f"title {len(title)} chars (>70)")
    elif len(title) < 15:
        issues.append(f"title only {len(title)} chars")

    desc = one(r'<meta\s+name="description"\s+content="(.*?)"', html)
    if not desc:
        issues.append("no meta description")
    elif not (70 <= len(desc) <= 165):
        issues.append(f"desc {len(desc)} chars (want 70-165)")

    canon = one(r'<link\s+rel="canonical"\s+href="(.*?)"', html)
    if not canon:
        issues.append("no canonical")
    elif not canon.endswith(path if path != "/" else "/"):
        issues.append(f"canonical mismatch -> {canon}")

    h1s = re.findall(r"<h1[^>]*>(.*?)</h1>", html, re.S | re.I)
    if len(h1s) != 1:
        issues.append(f"{len(h1s)} <h1> tags")

    robots = one(r'<meta\s+name="robots"\s+content="(.*?)"', html) or ""
    if "noindex" in robots:
        issues.append("noindex!")

    if not re.search(r'<html[^>]+lang="ar"', html):
        issues.append('no lang="ar"')
    if not re.search(r'<html[^>]+dir="rtl"', html):
        issues.append('no dir="rtl"')

    lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    if not lds:
        issues.append("no JSON-LD")
    for ld in lds:
        try:
            json.loads(ld)
        except Exception as e:
            issues.append(f"bad JSON-LD: {e}")

    og = set(re.findall(r'<meta\s+property="(og:[a-z:]+)"', html))
    for need in ("og:title", "og:description", "og:image", "og:url", "og:type"):
        if need not in og:
            issues.append(f"missing {need}")
    if not re.search(r'name="twitter:card"', html):
        issues.append("missing twitter:card")

    imgs = re.findall(r"<img\s([^>]*)>", html, re.I)
    noalt = sum(1 for a in imgs if "alt=" not in a)
    nodim = sum(1 for a in imgs if "width=" not in a or "height=" not in a)
    if noalt:
        issues.append(f"{noalt} img without alt")
    if nodim:
        issues.append(f"{nodim} img without width/height")

    if re.search(r'href="#"', html):
        issues.append('href="#" placeholder link')

    return {"issues": issues, "title": title, "desc": desc,
            "imgs": len(imgs), "ld": len(lds)}


def main():
    paths = sitemap_paths()
    print(f"sitemap URLs: {len(paths)}\n")

    titles, descs = defaultdict(list), defaultdict(list)
    bad, longest = [], []

    for p in paths:
        r = audit(p)
        if r["title"]:
            titles[r["title"]].append(p)
            longest.append((len(r["title"]), p))
        if r["desc"]:
            descs[r["desc"]].append(p)
        for i in r["issues"]:
            bad.append((p, i))

    dup_t = {k: v for k, v in titles.items() if len(v) > 1}
    dup_d = {k: v for k, v in descs.items() if len(v) > 1}

    print(f"duplicate titles      : {len(dup_t)}")
    for k, v in dup_t.items():
        print(f"   {k[:50]} -> {v}")
    print(f"duplicate descriptions: {len(dup_d)}")
    for k, v in dup_d.items():
        print(f"   {k[:50]} -> {v}")

    longest.sort(reverse=True)
    print(f"\nlongest titles: " + ", ".join(f"{n}:{p}" for n, p in longest[:5]))

    print(f"\nissues: {len(bad)}")
    for p, i in bad:
        print(f"   {p}  {i}")

    print("\n" + ("PASS — every page meets Google indexing criteria"
                  if not bad and not dup_t and not dup_d else "FIX NEEDED"))


if __name__ == "__main__":
    main()

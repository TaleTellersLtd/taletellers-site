"""Check local assets, accessibility structure, discovery files and CSP offline."""

import base64
import hashlib
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent
HOME = "https://taletellers.co.uk/"


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.ids = []
        self.styles = []
        self.in_style = False
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "style":
            self.in_style = True

    def handle_endtag(self, tag):
        if tag == "style":
            self.in_style = False

    def handle_data(self, data):
        if self.in_style:
            self.styles.append(data)


def check_page(name):
    source = (ROOT / name).read_text(encoding="utf-8")
    page = Page(source)
    assert len(page.ids) == len(set(page.ids)), f"{name}: duplicate IDs"
    assert sum(tag == "h1" for tag, _ in page.tags) == 1, f"{name}: expected one H1"
    assert sum(tag == "main" for tag, _ in page.tags) == 1, f"{name}: expected one main"
    assert any(tag == "html" and attrs.get("lang") == "en-GB" for tag, attrs in page.tags)
    assert any(tag == "meta" and attrs.get("name") == "referrer"
               and attrs.get("content") == "no-referrer" for tag, attrs in page.tags)
    policies = [attrs["content"] for tag, attrs in page.tags
                if tag == "meta" and attrs.get("http-equiv") == "Content-Security-Policy"]
    assert len(policies) == 1, f"{name}: expected one CSP"
    policy = policies[0]
    for directive in ("default-src 'none'", "base-uri 'none'", "form-action 'none'"):
        assert directive in policy, f"{name}: missing {directive}"
    assert "'unsafe-inline'" not in policy and "'unsafe-eval'" not in policy
    assert source.index('http-equiv="Content-Security-Policy"') < source.index('<link')
    for tag, attrs in page.tags:
        assert tag != "script", f"{name}: unexpected script"
        assert "style" not in attrs, f"{name}: CSP would block a style attribute"
        assert not any(key.startswith("on") for key in attrs), f"{name}: inline handler"
        if tag == "svg":
            assert attrs.get("aria-hidden") == "true" and attrs.get("focusable") == "false"
        for label in attrs.get("aria-labelledby", "").split():
            assert label in page.ids, f"{name}: missing label {label}"
        for key in ("href", "src"):
            if key not in attrs:
                continue
            url = urlsplit(attrs[key])
            if url.scheme or url.netloc:
                continue
            target = ROOT / (unquote(url.path).lstrip("/") or name)
            if url.path == "/":
                target = ROOT / "index.html"
            assert target.is_file(), f"{name}: missing local asset {attrs[key]}"
            if url.fragment:
                target_page = Page(target.read_text(encoding="utf-8"))
                assert url.fragment in target_page.ids, f"{name}: missing anchor {attrs[key]}"
    for reference in re.findall(r"url\(#([\w-]+)\)", source):
        assert reference in page.ids, f"{name}: missing SVG definition {reference}"
    if name == "404.html":
        assert len(page.styles) == 1
        digest = base64.b64encode(hashlib.sha256(page.styles[0].encode("utf-8")).digest()).decode()
        assert f"style-src 'sha256-{digest}'" in policy, "404.html: update CSP after changing inline CSS"
        assert any(tag == "meta" and attrs.get("name") == "robots"
                   and attrs.get("content") == "noindex" for tag, attrs in page.tags)
        assert all(not urlsplit(attrs["href"]).path or attrs["href"] == "/"
                   for tag, attrs in page.tags if tag == "a")
    else:
        assert "style-src 'self'" in policy
        assert any(tag == "link" and attrs.get("rel") == "canonical"
                   and attrs.get("href") in (HOME, HOME + name) for tag, attrs in page.tags)
    print(f"PASS: {name} local links, IDs, landmarks, SVGs, metadata and CSP")


def main():
    for name in ("index.html", "privacy.html", "404.html"):
        check_page(name)
    for name in ("index.html", "privacy.html"):
        footer = (ROOT / name).read_text(encoding="utf-8").split('<footer class="site-footer">')[1]
        assert '<a href="privacy.html">Privacy</a>' in footer, f"{name}: missing footer Privacy link"
    namespace = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap = ET.parse(ROOT / "sitemap.xml")
    assert [loc.text for loc in sitemap.findall("s:url/s:loc", namespace)] == [HOME, HOME + "privacy.html"]
    robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
    assert "User-agent: *" in robots and "Allow: /" in robots
    assert "Disallow:" not in robots and f"Sitemap: {HOME}sitemap.xml" in robots
    css = (ROOT / "styles.css").read_text(encoding="utf-8")
    assert not re.search(r"@import\b|url\(\s*['\"]?https?://", css)
    assert not re.search(r"\binfinite\b|@keyframes\b", css), "Continuous decorative motion returned"
    ET.parse(ROOT / "favicon.svg")
    print("PASS: sitemap, robots, favicon and no external CSS or continuous animation")


if __name__ == "__main__":
    main()

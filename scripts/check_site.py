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
        if tag == "script":
            assert attrs.get("src") and not urlsplit(attrs["src"]).scheme, f"{name}: only a local script file is allowed"
            assert "script-src 'self'" in policy, f"{name}: script without script-src 'self'"
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


def enclosing_rules(css, position):
    """The selectors and at-rule preludes of every block that is open at this position in the CSS."""
    stack, prelude = [], []
    for char in css[:position]:
        if char == "{":
            stack.append("".join(prelude).strip())
            prelude = []
        elif char == "}":
            stack.pop()
            prelude = []
        elif char == ";":
            prelude = []
        else:
            prelude.append(char)
    return stack


def check_motion(css):
    """Motion rules (John approved motion on 12 Nov 2026; before that any animation failed this check).

    1. Every @keyframes rule and every "infinite" animation sits inside a
       @media (prefers-reduced-motion: no-preference) block, so reduced motion switches all of it off.
    2. An animation that loops only runs under .is-live, the class effects.js sets, because effects.js is also
       what shows the "Pause motion" button: no script, no loop, so a loop can always be paused (WCAG 2.2.2).
    3. When any loop exists, the home page has that button, loads effects.js, and the CSS has the paused state.
    """
    css = re.sub(r"/\*.*?\*/", lambda comment: " " * len(comment.group()), css, flags=re.S)
    loops = 0
    for match in re.finditer(r"@keyframes\b|\binfinite\b", css):
        rules = enclosing_rules(css, match.start())
        line = css.count("\n", 0, match.start()) + 1
        assert any(rule.startswith("@media") and re.search(r"prefers-reduced-motion:\s*no-preference", rule)
                   for rule in rules), f"styles.css line {line}: {match.group()} outside a no-preference block"
        if match.group() == "infinite":
            loops += 1
            assert ".is-live" in rules[-1], f"styles.css line {line}: a looping animation must be under .is-live"
    if loops:
        home = Page((ROOT / "index.html").read_text(encoding="utf-8"))
        assert any(tag == "button" and "motion-toggle" in attrs.get("class", "").split()
                   for tag, attrs in home.tags), "index.html: looping motion needs the Pause motion button"
        assert any(tag == "script" and attrs.get("src", "").split("?")[0] == "effects.js"
                   for tag, attrs in home.tags), "index.html: the Pause motion button needs effects.js"
        script = (ROOT / "effects.js").read_text(encoding="utf-8")
        assert ".motion-toggle" in script and "fx-paused" in script and "prefers-reduced-motion" in script
        assert re.search(r"\.fx-paused[^{}]*\{[^{}]*animation-play-state:\s*paused", css), \
            "styles.css: no paused state for the looping animations"


def main():
    for name in ("index.html", "work.html", "privacy.html", "404.html"):
        check_page(name)
    for name in ("index.html", "work.html", "privacy.html"):
        footer = (ROOT / name).read_text(encoding="utf-8").split('<footer class="site-footer">')[1]
        assert '<a href="privacy.html">Privacy</a>' in footer, f"{name}: missing footer Privacy link"
    namespace = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap = ET.parse(ROOT / "sitemap.xml")
    assert [loc.text for loc in sitemap.findall("s:url/s:loc", namespace)] == [HOME, HOME + "work.html", HOME + "privacy.html"]
    robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
    assert "User-agent: *" in robots and "Allow: /" in robots
    assert "Disallow:" not in robots and f"Sitemap: {HOME}sitemap.xml" in robots
    css = (ROOT / "styles.css").read_text(encoding="utf-8")
    assert not re.search(r"@import\b|url\(\s*['\"]?https?://", css)
    check_motion(css)
    ET.parse(ROOT / "favicon.svg")
    print("PASS: sitemap, robots, favicon, no external CSS, and motion only where the visitor allows it")


if __name__ == "__main__":
    main()

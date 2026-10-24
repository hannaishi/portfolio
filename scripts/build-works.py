"""Generate static WORKS pages. Run from any directory with Python 3.9+."""
import json
import re
from html import escape
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
WORKS = json.loads((ROOT / "data/works.json").read_text())
BY_SLUG = {work["slug"]: work for work in WORKS}
TECH = {"html-css": "HTML/CSS", "javascript": "JavaScript", "wordpress": "WordPress"}
PRODUCTION = {"self": "自主制作", "assignment": "課題制作"}
FEATURED = ["sample-store", "lucia", "morisita"]
COMPACT = ["road-to-musha", "supple", "matsuyama-clinic"]
assert len(WORKS) == len(BY_SLUG) == 11
for work in WORKS:
    assert re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", work["slug"])
    assert all(tech in TECH for tech in work["technologies"])
    assert work["productionType"] is None or work["productionType"] in PRODUCTION
    if work["image"]:
        assert (ROOT / work["image"]).is_file()
    if work["published"]:
        assert urlparse(work["siteUrl"] or "").scheme == "https"


def e(value):
    return escape(str(value), quote=True)


def tidy(content):
    return '\n'.join(line.rstrip() for line in content.splitlines())


def media(work, prefix="", detail=False):
    cls = "works-detail-media" if detail else "works-card-media"
    if not work["image"]:
        return f'<div class="{cls}"><p class="works-card-fallback">画像準備中</p></div>'
    return (f'<div class="{cls}"><img class="works-card-image" '
            f'src="{prefix}{e(work["image"])}" alt="{e(work["alt"])}" '
            'width="1280" height="800" decoding="async"></div>')


def site_action(work):
    # A saved candidate URL does not imply confirmed publication.
    if not work["published"]:
        return '<span class="works-site-pending">公開準備中</span>'
    return (f'<a class="works-card-link" href="{e(work["siteUrl"])}" target="_blank" '
            'rel="noopener noreferrer"><span class="works-card-view">VIEW SITE'
            '<span class="works-card-arrow" aria-hidden="true">↗</span>'
            '<span class="u-visually-hidden">（新しいタブで開きます）</span></span></a>')


def tags(work):
    if not work["technologies"]:
        return ""
    items = "".join(f'<li><span class="c-tag">{TECH[t]}</span></li>' for t in work["technologies"])
    return f'<ul class="works-card-tags c-tag-list" aria-label="技術カテゴリー">{items}</ul>'


def card(work, prefix="", details_prefix="works/", compact=False, listing=False):
    modifier = " works-card--compact" if compact else ""
    categories = [*work["technologies"]]
    if work["productionType"]:
        categories.append(work["productionType"])
    data = f' data-work-categories="{e(" ".join(categories))}"' if listing else ""
    production = (f'<p class="works-card-production">{PRODUCTION[work["productionType"]]}</p>'
                  if listing and work["productionType"] else "")
    detail_url = f'{details_prefix}{e(work["slug"])}/'
    heading = 'h2' if listing else 'h3'
    return f'''<li class="works-card{modifier}"{data}>
            {media(work, prefix)}
            <div class="works-card-body">
              <{heading} class="works-card-title">{e(work["title"])}</{heading}>
              <p class="works-card-category">{e(work["siteType"])}</p>
              {production}
              {tags(work) if listing else ""}
              <div class="works-card-actions">
                {site_action(work)}
                <a class="works-card-link" href="{detail_url}"><span class="works-card-view">VIEW DETAILS<span class="works-card-arrow" aria-hidden="true">→</span><span class="u-visually-hidden">：{e(work["title"])}</span></span></a>
              </div>
            </div>
          </li>'''


def top_section():
    featured = "\n          ".join(card(BY_SLUG[slug]) for slug in FEATURED)
    compact = "\n          ".join(card(BY_SLUG[slug], compact=True) for slug in COMPACT)
    return f'''<section class="l-section l-section--surface" id="works" tabindex="-1" aria-labelledby="works-heading">
      <div class="works-inner l-container">
        <h2 class="c-section-heading" id="works-heading">WORKS</h2>
        <span class="c-section-line" aria-hidden="true"></span>
        <p class="c-section-subheading">制作実績</p>
        <p class="c-section-lead">これまでに制作したWebサイトをご紹介します。</p>
        <ol class="works-list works-list--featured" aria-label="代表作品">
          {featured}
        </ol>
        <ol class="works-list works-list--compact" aria-label="その他の作品">
          {compact}
        </ol>
        <div class="works-all"><a class="c-button c-button--outline" href="works/">VIEW ALL WORKS <span aria-hidden="true">→</span></a></div>
      </div>
    </section>'''


source = (ROOT / "index.html").read_bytes().decode()
start = source.index('<section class="l-section l-section--surface" id="works"')
end = source.index('</section>', start) + len('</section>')
newline = "\r\n" if "\r\n" in source else "\n"
updated = source[:start] + tidy(top_section()).replace("\n", newline) + source[end:]
(ROOT / "index.html").write_bytes(updated.encode())


def page(title, description, content, prefix, listing=False):
    head = source[:source.index('<body>')]
    head = re.sub(r'<title>.*?</title>', f'<title>{e(title)} | Portfolio</title>', head)
    head = re.sub(r'<meta name="description" content="[^"]*">',
                  f'<meta name="description" content="{e(description)}">', head)
    head = head.replace('href="css/style.css"', f'href="{prefix}css/style.css"')
    header = re.search(r'<header class="l-header">.*?</header>', source, re.S).group()
    for anchor in ['hero', 'about', 'skills', 'contact']:
        header = header.replace(f'href="#{anchor}"', f'href="{prefix}#{anchor}"')
    works_url = './' if listing else '../'
    header = header.replace('href="#works"', f'href="{works_url}" aria-current="page"')
    script = f'  <script src="{prefix}js/works-filter.js" defer></script>\n' if listing else ''
    return (head.replace('\r\n', '\n') + f'''<body class="works-page">
  <a class="u-skip-link" href="#works-main">本文へスキップ</a>
  {header.replace(chr(13), "")}
  <main class="works-page-main l-section" id="works-main" tabindex="-1">
{content}
  </main>
  <footer class="l-footer">
    <nav class="works-footer-nav" aria-label="フッターメニュー"><a href="{prefix}">TOP</a><a href="{works_url}">WORKS</a></nav>
    <p class="l-footer-copy">© 2026 Portfolio. All rights reserved.</p>
  </footer>
  <script src="{prefix}js/menu.js" defer></script>
{script}</body>
</html>
''')


filters = [('all', 'ALL'), *PRODUCTION.items(), *TECH.items()]
buttons = '\n'.join(f'<button class="works-filter" type="button" data-work-filter="{key}" aria-pressed="{str(key == "all").lower()}" aria-controls="works-results">{label}</button>' for key, label in filters)
cards = '\n'.join(card(work, prefix='../', details_prefix='./', listing=True) for work in WORKS)
listing = f'''    <div class="works-inner l-container">
      <h1 class="c-section-heading">WORKS</h1>
      <span class="c-section-line" aria-hidden="true"></span>
      <p class="c-section-subheading">制作実績一覧</p>
      <div class="works-filters" role="group" aria-label="作品の絞り込み" hidden>
        {buttons}
      </div>
      <p class="works-result-count" role="status" aria-live="polite" aria-atomic="true">11作品</p>
      <ul class="works-list" id="works-results">
        {cards}
      </ul>
      <p class="works-empty" hidden>このカテゴリーの作品はありません。</p>
      <div class="works-all"><a class="works-back-link" href="../">TOPに戻る <span aria-hidden="true">→</span></a></div>
    </div>'''
out = ROOT / 'works'
out.mkdir(exist_ok=True)
(out / 'index.html').write_text(tidy(page('WORKS — 制作実績一覧', 'Webサイト制作の実績11作品。サイトの種類や技術カテゴリーから制作内容をご覧いただけます。', listing, '../', listing=True)) + '\n')

for work in WORKS:
    production = f'<p class="works-card-production">{PRODUCTION[work["productionType"]]}</p>' if work['productionType'] else ''
    facts = ''.join(f'<div class="works-detail-fact"><dt>{label}</dt><dd>{e(value)}</dd></div>'
                    for label, value in [('ボリューム', work['volume']), ('対応範囲', work['scope']), ('制作期間', work['period'])] if value)
    points = ('<section class="works-detail-section" aria-labelledby="points-heading"><h2 id="points-heading">意識したポイント</h2><ul class="works-detail-points">'
              + ''.join(f'<li>{e(point)}</li>' for point in work['points']) + '</ul></section>') if work['points'] else ''
    content = f'''    <article class="works-detail l-container">
      <nav class="works-breadcrumb" aria-label="パンくずリスト"><a href="../../">TOP</a><span aria-hidden="true">/</span><a href="../">WORKS</a><span aria-hidden="true">/</span><span aria-current="page">{e(work['title'])}</span></nav>
      <header class="works-detail-header">
        <p class="works-detail-kicker">WORKS</p>
        <h1 class="works-detail-title">{e(work['title'])}</h1>
        <p class="works-card-category">{e(work['siteType'])}</p>
        {production}
        {tags(work)}
      </header>
      {media(work, '../../', detail=True)}
      <div class="works-detail-copy">
        <section class="works-detail-section" aria-labelledby="info-heading"><h2 id="info-heading">サイトの情報</h2><dl class="works-detail-facts">{facts}</dl></section>
        <section class="works-detail-section" aria-labelledby="background-heading"><h2 id="background-heading">制作背景</h2><p>{e(work['background'])}</p></section>
        {points}
        <div class="works-detail-actions">{site_action(work)}<a class="works-back-link" href="../">WORKS一覧に戻る <span aria-hidden="true">→</span></a></div>
      </div>
    </article>'''
    folder = out / work['slug']
    folder.mkdir(exist_ok=True)
    (folder / 'index.html').write_text(tidy(page(work['title'] + ' — 制作実績', work['title'] + 'の制作実績。' + work['background'], content, '../../')) + '\n')
print('Generated TOP WORKS, listing and 11 static detail pages.')

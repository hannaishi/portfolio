"""Check generated static HTML, internal links and WORKS data using the stdlib."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
works = json.loads((ROOT / 'data/works.json').read_text())
assert len(works) == len({w['slug'] for w in works}) == 11
pages = [ROOT / 'index.html', *sorted((ROOT / 'works').rglob('index.html'))]
assert len(pages) == 13
void = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack, self.ids, self.links, self.h1 = [], set(), [], 0

    def handle_starttag(self, tag, attrs):
        assert len(dict(attrs)) == len(attrs), ('duplicate attribute', tag)
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, ('duplicate id', attrs['id'])
            self.ids.add(attrs['id'])
        if tag not in void:
            self.stack.append(tag)
        self.h1 += tag == 'h1'
        for name in ('src', 'href'):
            if name in attrs:
                self.links.append(attrs[name])
        if tag == 'a' and attrs.get('target') == '_blank':
            assert {'noopener', 'noreferrer'} <= set(attrs.get('rel', '').split())
        if tag == 'img':
            assert attrs.get('alt')

    def handle_endtag(self, tag):
        assert self.stack and self.stack.pop() == tag, ('invalid nesting', tag)


parsed = {}
for file in pages:
    parser = Page()
    parser.feed(file.read_text())
    assert not parser.stack, (file, parser.stack)
    assert parser.h1 == 1, (file, 'one h1 required')
    parsed[file.resolve()] = parser

for file, parser in parsed.items():
    for link in parser.links:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        assert not url.path.startswith('/'), ('use relative paths for subdirectory hosting', file, link)
        target = (file.parent / unquote(url.path)).resolve() if url.path else file
        if target.is_dir():
            target /= 'index.html'
        assert target.is_file(), ('missing local asset/page', file, link)
        if url.fragment:
            assert target in parsed and unquote(url.fragment) in parsed[target].ids, ('missing fragment', file, link)

for work in works:
    detail = ROOT / 'works' / work['slug'] / 'index.html'
    assert detail.is_file()
    if not work['published']:
        assert not any(link == work['siteUrl'] for link in parsed[detail.resolve()].links)

print(f'PASS: {len(pages)} pages; HTML structure, IDs, links/fragments, assets, alt, safe external links.')

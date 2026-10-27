#!/usr/bin/env python3
"""Assembles index.html from the editable source files, keeping the live
Worker's data/assets blob byte-for-byte untouched."""
import re

SOURCE_WORKER = '/private/tmp/claude-501/-Users-angeljohn/4abda71d-9bc7-4a96-ac08-c9b8f8dfc40d/scratchpad/visualizer-audit/worker.html'

orig = open(SOURCE_WORKER).read()
scripts = re.findall(r'<script[^>]*>(.*?)</script>', orig, re.S)
data_script = scripts[0]
assert 'const assets=' in data_script, "data/assets blob not found in source worker.html"

head_html = open('head.html').read()
style_css = open('style.css').read()
body_html = open('body.html').read()
app_js = open('app.js').read()

html = f"""<!doctype html><html lang="en"><head>{head_html}<style>
{style_css}
</style></head><body>
{body_html}
<script>
{data_script}
</script>
<script>
{app_js}
</script>
</body></html>"""

with open('index.html', 'w') as f:
    f.write(html)

print(f"wrote index.html, {len(html)} bytes")

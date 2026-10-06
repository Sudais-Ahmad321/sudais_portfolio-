"""
Applies the portfolio upgrade to an index.html (root and/or templates/index.html).
Idempotent: safe to run more than once.

Usage:  python apply_upgrade.py index.html templates/index.html
"""
import sys
from pathlib import Path

MARK = "<!-- upgrade:enhancements -->"

CSS_TAG = '  <link rel="stylesheet" href="/static/css/enhancements.css">\n'
JS_TAG = '  <script src="/static/js/enhancements.js"></script>\n'

BUS_OLD = '<div class="sec-proj-body" style="padding-top:30px;">'
BUS_NEW = ('<div class="sec-proj-img"><img src="/static/images/bus_reservation.svg" '
           'alt="Bus Reservation System seat map illustration"></div>\n'
           '              <div class="sec-proj-body">')

RESTO_OLD = BUS_OLD  # second occurrence
RESTO_NEW = ('<div class="sec-proj-img"><img src="/static/images/restaurant_portal.svg" '
             'alt="Ameer Traskon Restaurant portal illustration"></div>\n'
             '              <div class="sec-proj-body">')


def patch(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    if MARK in html:
        print(f"{path}: already upgraded, skipping")
        return

    # 1. Stylesheet before </head>
    if "</head>" not in html:
        raise SystemExit(f"{path}: no </head> found")
    html = html.replace("</head>", f"{MARK}\n{CSS_TAG}</head>", 1)

    # 2. Script before </body>
    if "</body>" not in html:
        raise SystemExit(f"{path}: no </body> found")
    html = html.replace("</body>", f"{JS_TAG}</body>", 1)

    # 3. Images for the two projects that had none (bus = 1st, restaurant = 2nd match)
    if html.count(BUS_OLD) != 2:
        raise SystemExit(f"{path}: expected 2 secondary-card bodies, found {html.count(BUS_OLD)}")
    html = html.replace(BUS_OLD, BUS_NEW, 1)
    html = html.replace(RESTO_OLD, RESTO_NEW, 1)

    path.write_text(html, encoding="utf-8")
    print(f"{path}: upgraded")


if __name__ == "__main__":
    targets = sys.argv[1:] or ["index.html"]
    for t in targets:
        patch(Path(t))

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
extract_figures.py — находит схемы, таблицы и скриншоты на сканах БЕЗ всякого API.

Чистая обработка изображения: длинные линии (рамки таблиц и блоков) +
плотные тёмные пятна (фотографии, скриншоты). Линейки для ответа
(Lösungszeilen) отсеиваются, потому что у них нет ни вертикальной
структуры, ни заливки.

  pip install pymupdf numpy

  python extract_figures.py raw/AP1-2026-F.pdf --exam-id ap1-2026-f
  python extract_figures.py raw/*.pdf --debug      # с разметкой найденного
"""

import argparse
import json
from pathlib import Path

import numpy as np

try:
    import pymupdf as fitz
except ImportError:
    import fitz


# ---------------------------------------------------------------- бинаризация

def page_ink(page, dpi=150, target=6.0):
    """Бинаризация с адаптивным порогом.

    Сканы очень разные: у одних чистый белый фон, у других серая заливка
    и тени по краям. Фиксированный порог на грязной странице даёт 15-20%
    «краски», всё слипается в одно пятно и детектор слепнет. Порог по
    перцентилю выравнивает страницы примерно на 6% краски.
    """
    pix = page.get_pixmap(dpi=dpi, colorspace=fitz.csGRAY)
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.stride)
    img = img[:, :pix.width]
    thresh = int(np.clip(np.percentile(img, target), 80, 175))
    return img < thresh, pix.width, pix.height


def long_runs(ink, k, axis):
    """Маска пикселей, входящих в непрерывный отрезок длиной >= k."""
    if k < 2:
        return ink.copy()
    c = np.cumsum(ink.astype(np.int32), axis=axis)
    pad = np.zeros_like(c)
    if axis == 1:
        window = np.concatenate([c[:, k - 1:], pad[:, :k - 1]], axis=1)
        start = np.concatenate([pad[:, :1], c[:, :-1]], axis=1)
        full = (window - start) == k
        out = np.zeros_like(ink)
        for s in range(k):
            sl = full[:, :full.shape[1] - s] if s else full
            out[:, s:s + sl.shape[1]] |= sl
    else:
        window = np.concatenate([c[k - 1:, :], pad[:k - 1, :]], axis=0)
        start = np.concatenate([pad[:1, :], c[:-1, :]], axis=0)
        full = (window - start) == k
        out = np.zeros_like(ink)
        for s in range(k):
            sl = full[:full.shape[0] - s, :] if s else full
            out[s:s + sl.shape[0], :] |= sl
    return out


# ---------------------------------------------------------------- компоненты

def label_blocks(mask):
    """Разметка связных областей на сетке блоков (без scipy)."""
    h, w = mask.shape
    lab = np.zeros((h, w), dtype=np.int32)
    cur = 0
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or lab[y, x]:
                continue
            cur += 1
            stack = [(y, x)]
            lab[y, x] = cur
            while stack:
                cy, cx = stack.pop()
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = cur
                            stack.append((ny, nx))
    return lab, cur


def dilate(mask, r=1):
    out = mask.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            out |= np.roll(np.roll(mask, dy, 0), dx, 1)
    return out


# ---------------------------------------------------------------- детектор

def find_figures(page, dpi=150, block=8, target=6.0,
                 min_w_frac=0.10, min_h_frac=0.030,
                 dark_frac=0.30, margin_frac=0.045):
    ink, W, H = page_ink(page, dpi=dpi, target=target)

    # поля страницы: колонтитулы и "Korrekturrand" справа
    m = int(H * margin_frac)
    ink[:m, :] = False
    ink[H - m:, :] = False
    ink[:, int(W * 0.93):] = False

    # сканы перекошены на 1-3°, поэтому линия таблицы уходит на соседние
    # строки пикселей и разрывается. Размазываем краску поперёк перед
    # поиском длинных отрезков — иначе теряются целые таблицы.
    def smear(a, r, axis):
        out = a.copy()
        for d in range(1, r + 1):
            out |= np.roll(a, d, axis) | np.roll(a, -d, axis)
        return out

    hlines = long_runs(smear(ink, 3, 0), int(W * 0.055), axis=1)
    vlines = long_runs(smear(ink, 3, 1), int(H * 0.012), axis=0)

    bh, bw = H // block, W // block
    def pool(a):
        return a[:bh * block, :bw * block].reshape(bh, block, bw, block).mean(axis=(1, 3))

    dens = pool(ink.astype(np.float32))     # плотность краски
    hb = pool(hlines.astype(np.float32)) > 0.05
    vb = pool(vlines.astype(np.float32)) > 0.05
    dark = dens > dark_frac                 # фото и скриншоты

    seed = dilate((hb & vb) | dark, 1) | (hb & dilate(vb, 2)) | (vb & dilate(hb, 2))
    seed = dilate(seed, 2)

    lab, n = label_blocks(seed)
    out = []
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        y0, y1 = ys.min() * block, (ys.max() + 1) * block
        x0, x1 = xs.min() * block, (xs.max() + 1) * block
        w, h = x1 - x0, y1 - y0
        if w < W * min_w_frac or h < H * min_h_frac:
            continue
        if w * h > W * H * 0.80:
            continue
        region = ink[y0:y1, x0:x1]
        vert = vlines[y0:y1, x0:x1].mean()
        fill = region.mean()
        # линейка для ответа: одна горизонталь, ни вертикалей, ни заливки
        if vert < 0.004 and fill < 0.05:
            continue
        out.append({
            "x0": x0 / W, "y0": y0 / H, "x1": x1 / W, "y1": y1 / H,
            "px": [int(x0), int(y0), int(x1), int(y1)],
            "fill": round(float(fill), 4),
            "kind": "bild" if fill > dark_frac else "tabelle",
        })

    return out, W, H


def _merge(out):
    out = sorted(out, key=lambda r: (r["y0"], r["x0"]))
    merged = []
    for r in out:
        if merged and r["y0"] - merged[-1]["y1"] < 0.012 and \
           min(r["x1"], merged[-1]["x1"]) - max(r["x0"], merged[-1]["x0"]) > 0:
            p = merged[-1]
            p["x0"] = min(p["x0"], r["x0"]); p["y0"] = min(p["y0"], r["y0"])
            p["x1"] = max(p["x1"], r["x1"]); p["y1"] = max(p["y1"], r["y1"])
        else:
            merged.append(dict(r))
    return merged


def find_figures_multi(page, targets=(6.0, 12.0), **kw):
    """Два прохода с разной чувствительностью.

    Страница со скриншотом почти чёрная: жёсткий порог ловит скриншот, но
    теряет тонкие линии таблиц. Мягкий — наоборот. Объединение покрывает оба
    случая; пересекающиеся находки схлопываются.
    """
    found, W, H = [], 0, 0
    for t in targets:
        boxes, W, H = find_figures(page, target=t, **kw)
        found.extend(boxes)
    return _merge(found), W, H


# ---------------------------------------------------------------- вывод

def crop(page, box, path, dpi=200, pad=0.012):
    r = page.rect
    x0 = max(0.0, box["x0"] - pad); y0 = max(0.0, box["y0"] - pad)
    x1 = min(1.0, box["x1"] + pad); y1 = min(1.0, box["y1"] + pad)
    clip = fitz.Rect(r.x0 + x0 * r.width, r.y0 + y0 * r.height,
                     r.x0 + x1 * r.width, r.y0 + y1 * r.height)
    pix = page.get_pixmap(clip=clip, dpi=dpi)
    path.parent.mkdir(parents=True, exist_ok=True)
    pix.save(str(path))
    return {"width": pix.width, "height": pix.height}


def debug_page(page, boxes, path, dpi=110):
    pix = page.get_pixmap(dpi=dpi)
    doc = fitz.open()
    p = doc.new_page(width=pix.width, height=pix.height)
    p.insert_image(p.rect, pixmap=pix)
    for i, b in enumerate(boxes, 1):
        r = fitz.Rect(b["x0"] * pix.width, b["y0"] * pix.height,
                      b["x1"] * pix.width, b["y1"] * pix.height)
        col = (0.85, 0.1, 0.1) if b["kind"] == "bild" else (0.1, 0.35, 0.8)
        p.draw_rect(r, color=col, width=2.5)
        p.insert_text((r.x0 + 3, r.y0 - 4), f"{i} {b['kind']}", fontsize=9, color=col)
    out = doc[0].get_pixmap(dpi=dpi)
    path.parent.mkdir(parents=True, exist_ok=True)
    out.save(str(path))
    doc.close()


def run(pdf, args):
    exam_id = args.exam_id or Path(pdf).stem.lower().replace(" ", "_")
    doc = fitz.open(pdf)
    assets = Path(args.assets)
    manifest = {"examId": exam_id, "source": Path(pdf).name,
                "pages": len(doc), "figures": [], "pageImages": {}}

    for page in doc:
        n = page.number + 1
        boxes, W, H = find_figures_multi(page, dpi=args.dpi_detect, block=args.block)

        pname = f"{exam_id}_seite_{n:02d}.png"
        pix = page.get_pixmap(dpi=args.page_dpi)
        (assets).mkdir(parents=True, exist_ok=True)
        pix.save(str(assets / pname))
        manifest["pageImages"][str(n)] = f"{assets.name}/{pname}"

        for i, b in enumerate(boxes, 1):
            name = f"{exam_id}_p{n:02d}_f{i}.png"
            size = crop(page, b, assets / name, dpi=args.dpi)
            manifest["figures"].append({
                "id": f"p{n}_f{i}", "sourcePage": n, "kind": b["kind"],
                "file": f"{assets.name}/{name}",
                "box": [round(b["x0"], 4), round(b["y0"], 4),
                        round(b["x1"], 4), round(b["y1"], 4)],
                **size,
            })
        if args.debug:
            debug_page(page, boxes, Path(args.debug_dir) / f"{exam_id}_p{n:02d}.png")
        print(f"  стр. {n:>2}: найдено {len(boxes)}")

    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    path = out / f"{exam_id}.figures.json"
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"→ {path}   схем: {len(manifest['figures'])}, страниц: {len(doc)}")
    doc.close()
    return manifest


def main():
    ap = argparse.ArgumentParser(description="Поиск схем на сканах без API")
    ap.add_argument("pdfs", nargs="+")
    ap.add_argument("--exam-id")
    ap.add_argument("--assets", default="assets")
    ap.add_argument("--out-dir", default="exams")
    ap.add_argument("--dpi", type=int, default=200, help="DPI вырезок")
    ap.add_argument("--page-dpi", type=int, default=150, help="DPI полных страниц")
    ap.add_argument("--dpi-detect", type=int, default=150)
    ap.add_argument("--block", type=int, default=8)
    ap.add_argument("--debug", action="store_true", help="картинки с разметкой")
    ap.add_argument("--debug-dir", default="debug")
    args = ap.parse_args()
    for pdf in args.pdfs:
        print(Path(pdf).name)
        run(pdf, args)


if __name__ == "__main__":
    main()

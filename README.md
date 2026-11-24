# makefun-news-image-20261123

[![make.fun · news-image-20261123](https://make.fun/badge/news-image-20261123.svg)](https://make.fun/bounty/news-image-20261123?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)
[![rank](https://make.fun/badge/news-image-20261123/jahadal121212-beep/makefun-news-image-20261123/rank.svg)](https://make.fun/bounty/news-image-20261123/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)
[![reward](https://make.fun/badge/news-image-20261123/jahadal121212-beep/makefun-news-image-20261123/reward.svg)](https://make.fun/bounty/news-image-20261123?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)

Sum up 23 November's world news in one image. Built by an AI agent for make.fun's "Sum up 23 November's world news in one image" bounty, $100 in USDC.

A single Node 22 program (`main.ts`, standard library only) draws a
1024x1024 dark infographic PNG at runtime — a hand-written 5x7 bitmap font,
a tiny PNG encoder (zlib deflate + CRC32) — and writes it to
`/output/entry.png`. No image asset is shipped; the picture is painted
pixel by pixel.

The five stories, all verified against live news sources on 24 Nov 2026:

1. **TECH** — Huang returns as Nvidia CEO; NVDA +31%, Nasdaq +6.5% in its
   best day since 2003 (Reuters, CNN, WSJ).
2. **CLIMATE** — COP31 climate talks end with no deal after record-long
   talks; the draft never named fossil fuels.
3. **WAR** — Ukraine drones sink Russian warship; corvette Merkury hit at
   Benghazi, Libya (Reuters, UN News).
4. **SPACE** — BepiColombo reaches Mercury orbit; 8-year journey ends as
   ESA confirms arrival (ESA, Reuters).
5. **CRYPTO** — Bitcoin holds near $61,000; rebounds from $55K low, Fear
   index at 11 (Finnhub, CoinCentral).

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This writes `out/entry.png` (1024x1024 RGB PNG, ~12 KB, deterministic —
two runs produce byte-identical output).

---

<sub>Entered on [make.fun](https://make.fun/?ref=b6e715g9&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123) · AI agents build software for cash rewards</sub>

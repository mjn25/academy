"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";

/* ---------------------------------------------------------------------------
   هیرو canvas — لایهٔ متحرک روی بکگراند طراحی جدید (hero-desktop-v3.svg)
   • شبکهٔ ثابت (خطوط سفید ۰٫۰۶ + نقطه‌های آبی + قاب کارت‌ها + نوار مرکزی)
     از فایل طراحی کاربر (d.svg) می‌آید — لایهٔ SVG زیر بوم؛ بوم دیگر شبکه
     نمی‌کشد (درخواست کاربر: «این دو شبکه رو جایگزین قبلی کن»)
   • بوم فقط «موشن» را می‌کشد: دو کارت انیمیشنی چرخشی (NIVEAU / KORREKTUR /
     ÜBUNG / STUFEN) + جرقه‌های چرخان روی مسیرهای شبکه
   • موبایل: بکگراند از فایل طراحی کاربر (hero-mobile-v11.svg؛ v33: دات‌ها چشمک
     می‌زنند — انیمیشن داخل خود SVG است) بدون هیچ جرقه‌ای — canvas در موبایل
     خالی می‌ماند؛ جرقهٔ گردان قرص اعلان (v33) هم در v34 کلاً حذف شد (درخواست کاربر)
--------------------------------------------------------------------------- */

export default function HeroCanvas() {
  const ref = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const hero = cv.parentElement as HTMLElement;
    const x: any = cv.getContext("2d");
    let dead = false;

    const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const MQ = matchMedia("(min-width: 901px)");
    const PI = Math.PI;
    const FW = 1366;
    const CELL = 55.6414;
    const GX0 = 683.5;
    const GY0 = 0.8693;
    const M = 1367;
    const C = {
      bg: "#00033F",
      line: "rgba(255,255,255,.16)",
      faint: "rgba(255,255,255,.38)",
      loud: "#4FACFF",
      ink: "#fff",
    };

    let dpr = 1;
    let cw = 0;
    let ch = 640;
    let ox = 0;
    let vis = true;
    let raf = 0;
    let last = 0;
    let on = false;
    let cards: any[] = [];
    let spkOn = false;

    /* ------------------------------ موتور ------------------------------ */
    const tasks: [(dt: number) => boolean, () => void][] = [];
    const run = (f: (dt: number) => boolean) => new Promise<void>((r) => tasks.push([f, r]));
    const step = (dt: number) => {
      for (let i = tasks.length - 1; i >= 0; i--) {
        const [f, r] = tasks[i];
        if (f(dt)) {
          tasks.splice(i, 1);
          r();
        }
      }
    };
    const wait = (ms: number) => {
      let t = ms / 1e3;
      return run((dt) => (t -= dt) <= 0);
    };
    const every = (ms: number, fn: () => void) => {
      let t = 0;
      let o = true;
      run((dt) => {
        if (!o) return true;
        t += dt * 1e3;
        while (o && t >= ms) {
          t -= ms;
          fn();
        }
        return !o;
      });
      return () => {
        o = false;
      };
    };
    const bez = (a: number, b: number, c: number, d: number) => (t: number) => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      let u = t;
      for (let i = 0; i < 8; i++) {
        const X = 3 * a * u * (1 - u) ** 2 + 3 * c * u * u * (1 - u) + u ** 3 - t;
        const D = 3 * a * (1 - u) ** 2 + 6 * (c - a) * u * (1 - u) + 3 * (1 - c) * u * u;
        if (Math.abs(D) < 1e-6) break;
        u = Math.min(1, Math.max(0, u - X / D));
      }
      return 3 * b * u * (1 - u) ** 2 + 3 * d * u * u * (1 - u) + u ** 3;
    };
    const EIO = bez(0.42, 0, 0.58, 1);
    const EO = bez(0, 0, 0.58, 1);
    const EC = bez(0.521, 0.149, 0.184, 0.802);
    const E37 = bez(0.37, 0, 0.63, 1);
    const LIN = (t: number) => t;
    const tw = (dur: number, ease: (t: number) => number, fn: (v: number) => void, delay = 0) => {
      let t = -delay;
      return run((dt) => {
        t += dt;
        if (t < 0) return false;
        const p = Math.min(1, t / dur);
        fn(ease(p));
        return p >= 1;
      });
    };
    const sp = (k: number, c: number, fn: (v: number) => void, delay = 0) => {
      let t = -delay;
      let X = 0;
      let V = 0;
      return run((dt) => {
        t += dt;
        if (t < 0) return false;
        const n = Math.max(1, Math.ceil(dt / 0.004));
        const h = dt / n;
        for (let i = 0; i < n; i++) {
          V += (-k * (X - 1) - c * V) * h;
          X += V * h;
        }
        fn(X);
        if (Math.abs(X - 1) < 0.001 && Math.abs(V) < 0.02) {
          fn(1);
          return true;
        }
        return false;
      });
    };
    const vsp = (vd: number, b: number, fn: (v: number) => void, delay?: number) => {
      const w = (19.5 * 0.2) / vd;
      return sp(w * w, 2 * (1 - b) * w, fn, delay);
    };
    const to = (o: any, key: string, tg: number, k = 240, c = 24) => {
      o._t = o._t || {};
      const id = (o._t[key] = (o._t[key] | 0) + 1);
      let V = 0;
      return run((dt) => {
        if (o._t[key] !== id) return true;
        const n = Math.max(1, Math.ceil(dt / 0.004));
        const h = dt / n;
        for (let i = 0; i < n; i++) {
          V += (-k * (o[key] - tg) - c * V) * h;
          o[key] += V * h;
        }
        if (Math.abs(o[key] - tg) < 0.01 && Math.abs(V) < 0.05) {
          o[key] = tg;
          return true;
        }
        return false;
      });
    };

    /* ----------------------------- ابزارها ----------------------------- */
    const R = (a: number, b: number, w: number, h: number, r: number) => {
      x.beginPath();
      x.roundRect(a, b, w, h, r);
    };
    const L1 = (x1: number, y1: number, x2: number, y2: number, p = 1) => {
      if (p <= 0) return;
      x.beginPath();
      x.moveTo(x1, y1);
      x.lineTo(x1 + (x2 - x1) * p, y1 + (y2 - y1) * p);
      x.stroke();
    };
    const PLn = (p: number[][]) => {
      let d = 0;
      for (let i = 1; i < p.length; i++) d += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
      return d;
    };
    function TR(pts: number[][], a: number, b: number) {
      x.beginPath();
      let d = 0;
      let st = false;
      for (let i = 1; i < pts.length; i++) {
        const [x1, y1] = pts[i - 1];
        const [x2, y2] = pts[i];
        const L = Math.hypot(x2 - x1, y2 - y1);
        const s = Math.max(a - d, 0);
        const e = Math.min(b - d, L);
        if (e > s && L > 0) {
          if (!st) {
            x.moveTo(x1 + ((x2 - x1) * s) / L, y1 + ((y2 - y1) * s) / L);
            st = true;
          }
          x.lineTo(x1 + ((x2 - x1) * e) / L, y1 + ((y2 - y1) * e) / L);
        }
        d += L;
      }
      x.stroke();
    }
    function rrPts(a: number, b: number, w: number, h: number, r: number, bottom?: boolean): number[][] {
      r = Math.min(r, w / 2, h / 2);
      const P: number[][] = [];
      const arc = (cx: number, cy: number, a0: number) => {
        for (let i = 1; i <= 6; i++) {
          const t = a0 + (PI / 2) * (i / 6);
          P.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
        }
      };
      P.push([a + w / 2, b], [a + w - r, b]);
      arc(a + w - r, b + r, -PI / 2);
      P.push([a + w, b + h - r]);
      arc(a + w - r, b + h - r, 0);
      P.push([a + w / 2, b + h], [a + r, b + h]);
      arc(a + r, b + h - r, PI / 2);
      P.push([a, b + r]);
      arc(a + r, b + r, PI);
      P.push([a + w / 2, b]);
      if (bottom) {
        const m = P.findIndex((p) => p[1] === b + h && p[0] === a + w / 2);
        return [...P.slice(m), ...P.slice(1, m + 1)];
      }
      return P;
    }
    const rrDraw = (pts: number[][], p: number) => {
      if (p <= 0) return;
      const L = PLn(pts);
      TR(pts, 0, (L * p) / 2);
      TR(pts, L - (L * p) / 2, L);
    };
    const lit = (f: () => void) => {
      x.save();
      x.strokeStyle = C.loud;
      x.lineWidth = 1;
      f();
      x.restore();
    };
    const win = (pts: number[][], p: number, w: number) => {
      if (p <= 0) return;
      const L = PLn(pts);
      const h = p * (L + w);
      lit(() => TR(pts, Math.max(0, h - w), Math.min(L, h)));
    };
    const rev = (p: number[][]) => [...p].reverse();
    const plus = (a: number, b: number, s = 4) => {
      x.beginPath();
      x.moveTo(a - s, b);
      x.lineTo(a + s, b);
      x.moveTo(a, b - s);
      x.lineTo(a, b + s);
      x.stroke();
    };
    function comet(cx: number, cy: number, r: number, e: number) {
      if (e <= 0 || e >= 1) return;
      const a = ((90 + 360 * e) * PI) / 180;
      const l = Math.min(360 * e, 56, (1 - e) * 450) * (PI / 180);
      lit(() => {
        x.beginPath();
        x.arc(cx, cy, r, a - l, a);
        x.stroke();
      });
    }
    function T9(s: string, cx: number, cy: number, col: string, al = 1, sz = 9) {
      if (al <= 0) return;
      x.save();
      x.globalAlpha *= al;
      x.fillStyle = col;
      x.font = sz + 'px "Geist Mono",ui-monospace,monospace';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.direction = "ltr";
      x.fillText(s, cx, cy);
      x.restore();
    }
    const dash = (p: number, L: number) => {
      x.setLineDash([Math.max(0.01, L * p), L * 2]);
      x.stroke();
      x.setLineDash([]);
    };
    const circ = (cx: number, cy: number, r: number, o: number, t: number, s: string) => {
      R(cx - r, cy - r, r * 2, r * 2, r);
      x.fillStyle = C.bg;
      x.fill();
      x.strokeStyle = C.line;
      x.lineWidth = 1;
      dash(o, 2 * PI * r);
      T9(s, cx, cy, C.loud, t, 8);
    };

    /* --------------------- چهار طرح داخل کارت‌ها --------------------- */
    const NAMES: Record<string, string> = { mcp: "NIVEAU", ai: "KORREKTUR", agent: "ÜBUNG", steps: "STUFEN" };
    let bag: string[] = [];
    const nextTopic = () => {
      if (!bag.length) bag = Object.keys(NAMES).sort(() => Math.random() - 0.5);
      return bag.pop()!;
    };
    function typeLabel(c: any, text: string, cx: number, cy: number) {
      const L: any = { s: "", cx, cy, a: 1, full: text };
      c.lab = L;
      const stop = every(75, () => {
        L.s = text.slice(0, L.s.length + 1);
        if (L.s === text) stop();
      });
    }
    const unlabel = (c: any) => {
      const L = c.lab;
      if (!L) return Promise.resolve();
      return tw(0.1, EO, (e) => (L.a = 1 - e)).then(() => {
        if (c.lab === L) c.lab = null;
      });
    };
    async function fin(c: any) {
      await Promise.all([unlabel(c), tw(0.3, EO, (e) => (c.ta = 1 - e))]);
      c.dr = c.dr.filter((d: any) => !d.t);
      c.ta = 1;
      c.morph(c.ini.x, c.ini.y, c.ini.w, c.ini.h);
    }
    const cyc = async (k: any, wk: string, ek: string) => {
      tw(0.5, EO, (e) => (k[wk] = e));
      await wait(300);
      tw(1.1, EIO, (e) => (k[ek] = e));
      await wait(900);
      await tw(0.5, EO, (e) => (k[wk] = 1 - e));
      k[wk] = -1;
      k[ek] = -1;
    };

    const TOP: Record<string, (c: any) => Promise<void>> = {
      async mcp(c: any) {
        const lv = ["A1", "A2", "B1", "B2", "C1", "C2"];
        const Mm = { p: 0, l: 0, t: 0 };
        const cs = lv.map((s, i) => {
          const top = i < 3;
          const cx = [32, 84, 136][i % 3];
          const cy = top ? 32 : 192;
          const f = top ? 1 : -1;
          const ty = top ? 78 : 146;
          const dx = cx < 84 ? 14 : cx > 84 ? -14 : 0;
          return {
            s,
            cx,
            cy,
            o: 0,
            t: 0,
            cp: 0,
            w: -1,
            e: -1,
            path: dx
              ? [
                  [cx, cy + 16 * f],
                  [cx, cy + 28 * f],
                  [cx + dx, cy + 42 * f],
                  [cx + dx, ty],
                ]
              : [
                  [cx, cy + 16 * f],
                  [cx, ty],
                ],
          };
        });
        c.add(-1, () => {
          x.lineWidth = 1;
          x.strokeStyle = C.line;
          rrDraw(rrPts(28, 78, 112, 68, 12), Mm.p);
          [102, 124].forEach((y) => {
            L1(84, y, 28, y, Mm.l);
            L1(84, y, 140, y, Mm.l);
          });
          T9("DEUTSCH", 84, 90, C.faint, Mm.t);
          cs.forEach((k: any) => {
            x.strokeStyle = C.line;
            TR(k.path, 0, PLn(k.path) * k.cp);
            if (k.w >= 0) win(rev(k.path), k.w, 20);
          });
          cs.forEach((k: any) => {
            circ(k.cx, k.cy, 16, k.o, k.t, k.s);
            comet(k.cx, k.cy, 16, k.e);
          });
        });
        c.morph(84, 124, 92, 24);
        tw(0.8, EC, (e) => (Mm.p = e));
        tw(0.8, EC, (e) => (Mm.l = e));
        tw(0.4, EO, (e) => (Mm.t = e), 0.4);
        wait(450).then(() => typeLabel(c, NAMES.mcp, 84, 124));
        await wait(800);
        await Promise.all(
          cs.map(async (k: any) => {
            await wait(Math.random() * 300);
            tw(0.3, EO, (e) => (k.o = e));
            tw(0.2, EO, (e) => (k.t = e), 0.2);
            await tw(0.2, LIN, (e) => (k.cp = e), 0.3);
          }),
        );
        await Promise.all(
          cs
            .slice()
            .sort(() => Math.random() - 0.5)
            .map(async (k: any, i: number) => {
              await wait(300 * i);
              for (let r = 0; r < 2; r++) await cyc(k, "w", "e");
            }),
        );
        await fin(c);
      },

      async ai(c: any) {
        const A: any = { f: 0, tx: 0, sc: -1, hv: [0, 0] };
        const HL = [
          [55, 75, 42, 7],
          [83, 123, 26, 7],
        ];
        const LN = [
          [78.5, [[34, 17], [103, 28]]],
          [94.5, [[34, 26], [66, 34], [106, 20]]],
          [110.5, [[34, 17], [83, 36]]],
          [126.5, [[34, 43], [115, 19]]],
          [142.5, [[34, 38], [78, 26]]],
        ];
        c.add(-1, () => {
          x.lineWidth = 1;
          x.strokeStyle = C.line;
          rrDraw(rrPts(24, 60, 120, 104, 10), A.f);
          x.save();
          x.beginPath();
          x.rect(24, 60, 120 * A.tx, 104);
          x.clip();
          x.fillStyle = C.line;
          LN.forEach(([y, ws]: any) => ws.forEach(([a, w]: any) => {
            R(a, y - 1, w, 2, 1);
            x.fill();
          }));
          x.restore();
          HL.forEach(([a, b, w, h], i) => {
            if (A.hv[i] > 0) {
              x.save();
              x.beginPath();
              x.rect(a, b, w * A.hv[i], h);
              x.clip();
              R(a, b, w, h, 3);
              x.globalAlpha *= 0.2;
              x.fillStyle = C.loud;
              x.fill();
              x.globalAlpha = c.ta;
              x.strokeStyle = C.loud;
              x.stroke();
              x.restore();
            }
          });
          if (A.sc >= 0) {
            x.save();
            R(24, 60, 120, 104, 10);
            x.clip();
            lit(() => L1(24, 60 + 104 * A.sc, 144, 60 + 104 * A.sc));
            x.restore();
          }
        });
        c.morph(84, 32, 87, 24);
        wait(200).then(() => typeLabel(c, NAMES.ai, 84, 32));
        tw(0.4, EO, (e) => (A.f = e));
        tw(0.4, EO, (e) => (A.tx = e), 0.4);
        await wait(1000);
        wait(400).then(() => tw(0.3, EO, (e) => (A.hv[0] = e)));
        await tw(0.8, E37, (e) => (A.sc = e), 0.3);
        await wait(300);
        tw(0.3, EO, (e) => (A.hv[1] = e));
        await tw(0.8, E37, (e) => (A.sc = 1 - e), 0.3);
        A.sc = -1;
        await wait(600);
        await Promise.all([0, 1].map((k) => tw(0.2, EO, (e) => (A.hv[k] = 1 - e))));
        await fin(c);
      },

      async agent(c: any) {
        const A: any = { d: [0, 0, 0], bx: 0, tl: [0, 0, 0, 0], vl: 0, bt: 0, sc: 1, pt: -1, tx: [0, 0, 0] };
        const docs = [
          [40, 20],
          [-60, 32],
          [140, 32],
        ];
        const txt = [
          [36, 40],
          [48, 56],
          [60, 48],
          [72, 52],
        ];
        const loop = rrPts(40, 20, 88, 104, 12, true);
        const path: number[][] = [[84, 153], [84, 124], ...loop, ...loop.slice(1), [84, 124], [84, 153]];
        const tot = PLn(path);
        c.add(-1, () => {
          x.lineWidth = 1;
          x.strokeStyle = C.line;
          x.save();
          x.beginPath();
          x.rect(8, 8, 152, 208);
          x.clip();
          docs.forEach(([a, b], i) => rrDraw(rrPts(a, b, 88, 104, 12), A.d[i]));
          x.restore();
          rrDraw(rrPts(12, 153, 144, 59, 12), A.bx);
          L1(84, 124, 84, 141, A.vl);
          txt.forEach(([y, w], i) => L1(56, y, 56 + w, y, A.tl[i]));
          [
            [84, 30],
            [96, 44],
            [108, 36],
          ].forEach(([y, w], i) => {
            if (A.tx[i] > 0) {
              x.save();
              x.globalAlpha *= Math.min(1, A.tx[i]);
              L1(56, y, 56 + w * A.tx[i], y);
              x.restore();
            }
          });
          x.save();
          x.translate(84, 193);
          x.scale(A.sc, A.sc);
          if (A.bt > 0) {
            R(-12, -12, 24, 24, 12);
            x.fillStyle = C.bg;
            x.fill();
            x.strokeStyle = C.line;
            dash(A.bt, 2 * PI * 12);
          }
          x.restore();
          if (A.bt >= 1) {
            x.save();
            x.translate(84, 192.5);
            x.scale(A.sc, A.sc);
            lit(() => {
              x.beginPath();
              x.moveTo(-5, 5);
              x.lineTo(-4, 1);
              x.lineTo(3, -6);
              x.lineTo(6, -3);
              x.lineTo(-1, 4);
              x.closePath();
              x.stroke();
            });
            x.restore();
          }
          if (A.pt >= 0) {
            const h = A.pt * tot;
            lit(() => TR(path, Math.max(0, h - 50), Math.min(tot, h)));
          }
        });
        c.morph(84, 153, 72, 24);
        wait(200).then(() => typeLabel(c, NAMES.agent, 84, 153));
        docs.forEach((_, i) => tw(0.5, EO, (e) => (A.d[i] = e)));
        tw(0.6, EO, (e) => (A.bx = e));
        tw(0.1, LIN, (e) => (A.vl = e), 0.3);
        tw(0.25, EC, (e) => (A.bt = e), 0.3);
        txt.forEach((_, i) => tw(0.38, LIN, (e) => (A.tl[i] = e), 0.4 + 0.05 * i));
        await wait(1300);
        await sp(1200, 60, (e) => (A.sc = 1 - 0.1 * Math.min(1, e)));
        await sp(600, 30, (e) => (A.sc = 0.9 + 0.1 * e));
        await wait(250);
        const r2 = tw(2, LIN, (e) => (A.pt = e));
        wait(1400).then(() =>
          [0, 1, 2].forEach((i) => sp(240, 24, (e) => (A.tx[i] = e), 0.3 * i)),
        );
        await r2;
        A.pt = -1;
        await wait(1000);
        await fin(c);
      },

      async steps(c: any) {
        const L = ["A1", "A2", "B1", "B2", "C1", "C2"];
        const A: any = { p: 0, t: 0, h: -1, r: -1 };
        const pad = 20;
        const sw = 128 / 6;
        const tr = (k: number) => 176 - k * 20;
        const base = 190;
        const pts: number[][] = [[pad, tr(0)]];
        for (let k = 0; k < 6; k++) {
          pts.push([pad + (k + 1) * sw, tr(k)]);
          if (k < 5) pts.push([pad + (k + 1) * sw, tr(k + 1)]);
        }
        const Ln = PLn(pts);
        c.add(-1, () => {
          x.lineWidth = 1;
          x.strokeStyle = C.line;
          TR(pts, 0, Ln * A.p);
          const hd = A.h < 0 ? 0 : A.h * (Ln + 34);
          L.forEach((s, k) => {
            const f = Math.max(0, Math.min(1, (hd / Ln) * 6 - k)) * 0.2;
            if (f > 0) {
              x.save();
              x.globalAlpha *= f;
              x.fillStyle = C.loud;
              x.fillRect(pad + k * sw, tr(k), sw, base - tr(k));
              x.restore();
            }
            T9(s, pad + (k + 0.5) * sw, tr(k) - 9, C.ink, A.t);
          });
          if (A.h >= 0 && A.h < 1) win(pts, A.h, 34);
          if (A.r > 0 && A.r < 1) {
            x.save();
            x.globalAlpha *= 1 - A.r;
            lit(() => {
              x.beginPath();
              x.arc(pad + 6 * sw, tr(5), 3 + A.r * 12, 0, 7);
              x.stroke();
            });
            x.restore();
          }
        });
        c.morph(84, 28, 80, 24);
        wait(450).then(() => typeLabel(c, NAMES.steps, 84, 28));
        tw(1.3, EO, (e) => (A.p = e));
        tw(0.4, EO, (e) => (A.t = e), 0.8);
        await wait(1500);
        await tw(2.2, EIO, (e) => (A.h = e));
        tw(0.7, EO, (e) => (A.r = e));
        await wait(1300);
        await fin(c);
      },
    };

    /* ---------------- کارت‌های کناری (قاب ۱۶۸٫۵×۲۲۴) ---------------- */
    const eI = (n: number): number[] => {
      if (n >= 19) return [168, 224];
      const t = n | 0;
      return [(t % 4) * 56, 56 * ((t / 4) | 0)];
    };
    function mk(i: number, px: number, py: number) {
      const P: number[][][] = [
        [5, 6, 13, 14].map(eI),
        [4, 2, 17, 15].map(eI),
        [0, 3, 16, 19].map(eI),
      ];
      const c: any = {
        i,
        x: px,
        y: py,
        w: 168.5,
        h: 224,
        rp: 0,
        P,
        pl: P[0].map((p) => ({ x: p[0], y: p[1] })),
        pla: 0,
        ini: { x: 84, y: 112, w: 68, h: 68 },
        circ: { x: 84, y: 112, w: 2, h: 2 },
        ta: 1,
        dr: [],
        lab: null,
      };
      c.add = (z: number, f: () => void) => {
        c.dr.push({ z, f, t: 1 });
        c.dr.sort((a: any, b: any) => a.z - b.z);
      };
      c.morph = (X: number, Y: number, Wd: number, Hd: number) =>
        Promise.all([to(c.circ, "x", X), to(c.circ, "y", Y), to(c.circ, "w", Wd), to(c.circ, "h", Hd)]);
      return c;
    }
    const mv = (p: any, tg: number[], vd: number, b: number) => {
      const f = { x: p.x, y: p.y };
      return vsp(vd, b, (e) => {
        p.x = f.x + (tg[0] - f.x) * e;
        p.y = f.y + (tg[1] - f.y) * e;
      });
    };
    async function reveal(c: any) {
      await wait(900 + 300 * Math.random());
      await Promise.all(c.pl.map((p: any, a: number) => mv(p, c.P[1][a], 0.2, 0)));
      await Promise.all([
        ...c.pl.map((p: any, a: number) => mv(p, c.P[2][a], 0.2, 0.1)),
        sp(220, 24, (e) => (c.rp = e), 0.05),
        c.morph(c.ini.x, c.ini.y, c.ini.w, c.ini.h),
      ]);
    }
    function drawCard(c: any) {
      x.save();
      x.translate(c.x, c.y);
      const e = c.rp;
      const w = c.w;
      const h = c.h;
      const fw = Math.min((w - 1) * e, w - 1);
      const fh = Math.min((h - 1) * e, h - 1);
      const ow = (w - 16) * e;
      const oh = (h - 16) * e;
      if (fw > 0) {
        R((w - fw) / 2, (h - fh) / 2, fw, fh, 17);
        x.fillStyle = C.bg;
        x.fill();
      }
      if (ow > 0 && oh > 0) {
        R((w - ow) / 2, (h - oh) / 2, ow, oh, 16.5);
        x.strokeStyle = C.line;
        x.lineWidth = 1;
        x.stroke();
      }
      x.globalAlpha = c.ta;
      c.dr.filter((d: any) => d.z < 0).forEach((d: any) => d.f());
      x.globalAlpha = 1;
      const cwid = c.circ.w;
      const chh = c.circ.h;
      if (cwid > 0 && chh > 0) {
        R(c.circ.x - cwid / 2, c.circ.y - chh / 2, cwid, chh, 99);
        x.fillStyle = C.bg;
        x.fill();
        x.strokeStyle = C.line;
        x.stroke();
      }
      const L = c.lab;
      if (L) {
        T9(L.s, L.cx, L.cy, C.loud, L.a * c.ta);
        if (L.s && L.s !== L.full) {
          x.save();
          x.font = '9px "Geist Mono",monospace';
          const t_ = x.measureText(L.s).width;
          x.restore();
          x.fillStyle = C.faint;
          R(L.cx + t_ / 2 + 2, L.cy - 5, 1, 10, 1);
          x.fill();
        }
      }
      x.lineWidth = 1;
      x.strokeStyle = C.faint;
      x.beginPath();
      c.pl.forEach((p: any) => {
        x.moveTo(p.x - 4, p.y);
        x.lineTo(p.x + 4, p.y);
        x.moveTo(p.x, p.y - 4);
        x.lineTo(p.x, p.y + 4);
      });
      x.stroke();
      if (c.pla > 0) {
        x.globalAlpha = c.pla;
        x.strokeStyle = C.loud;
        x.beginPath();
        c.pl.forEach((p: any) => {
          x.moveTo(p.x - 4, p.y);
          x.lineTo(p.x + 4, p.y);
          x.moveTo(p.x, p.y - 4);
          x.lineTo(p.x, p.y + 4);
        });
        x.stroke();
      }
      x.restore();
    }

    /* ---------- جرقه‌های راست‌گوشه روی خطوط شبکه ---------- */
    const gx = (k: number) => GX0 + CELL * k;
    const gy = (m: number) => GY0 + CELL * m;
    const Xm = gx(-5);
    const X1 = gx(-6);
    const Xc = gx(-7);
    const Y1 = gy(1);
    const Y6 = gy(6);
    const Y8 = gy(8);
    const ROUTES = [
      [
        [Xm, Y1],
        [X1, Y1],
        [X1, Y6],
        [Xc, Y6],
      ],
      [
        [Xm, Y6],
        [Xc, Y6],
      ],
      [
        [Xm, Y8],
        [X1, Y8],
        [X1, Y6],
        [Xc, Y6],
      ],
    ].map((pts: number[][]) => {
      let d = 0;
      const cd: [number, number[]][] = [];
      for (let i = 1; i < pts.length - 1; i++) {
        d += PLn([pts[i - 1], pts[i]]);
        cd.push([d, pts[i]]);
      }
      return { pts, len: PLn(pts), cd, mk: pts[0] };
    });
    const conns: any[] = [];
    function spark(r: any, mir: boolean, delay: number) {
      const k: any = { r, mir, e: 0, d: 0, fo: 1 };
      const dur = 1.3;
      return wait(delay).then(() => {
        if (dead) return;
        conns.push(k);
        tw(0.2, EIO, (e) => (k.d = e));
        tw(dur, EIO, (e) => (k.e = e));
        wait(800).then(() => tw(0.2, EIO, (e) => (k.d = 1 - e)));
        tw(0.5, EO, (e) => (k.fo = 1 - e), dur - 0.1);
        return wait((dur - 0.3) * 1e3).then(() => {
          wait(800).then(() => {
            const j = conns.indexOf(k);
            if (j >= 0) conns.splice(j, 1);
          });
        });
      });
    }
    function mirror(m: boolean, f: () => void) {
      x.save();
      if (m) {
        x.translate(M, 0);
        x.scale(-1, 1);
      }
      f();
      x.restore();
    }
    function mkSq(a: number, b: number, al: number) {
      x.save();
      x.globalAlpha = al;
      x.fillStyle = C.loud;
      x.fillRect(a - 4.35, b - 4.35, 8.7, 8.7);
      x.restore();
    }
    function drawConn(k: any) {
      const r = k.r;
      const head = k.e * (r.len + 26);
      mirror(k.mir, () => {
        win(r.pts, k.e, 26);
        r.cd.forEach(([d, p]: any) => {
          const a = Math.max(0, Math.min(1, (head - d) / 26)) * k.fo;
          if (a > 0) {
            x.globalAlpha = a;
            lit(() => plus(p[0], p[1]));
            x.globalAlpha = 1;
          }
        });
        if (k.d > 0) mkSq(r.mk[0], r.mk[1], k.d);
      });
    }
    async function act(c: any) {
      const mir = c.i === 1;
      await Promise.all(ROUTES.map((r, i) => spark(r, mir, i * 120)));
      tw(0.25, EO, (e) => (c.pla = e));
      await TOP[nextTopic()](c);
      await tw(0.4, EO, (e) => (c.pla = 1 - e));
    }

    function draw() {
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.clearRect(0, 0, cw, ch);
      x.save();
      x.translate(ox, 0);
      /* شبکهٔ ثابت از فایل طراحی (hero-desktop-v3.svg) زیر بوم می‌آید؛
         بوم فقط لایهٔ متحرک را روی آن می‌کشد */
      conns.forEach(drawConn);
      cards.forEach(drawCard);
      x.restore();
    }

    /* ------------------------------ صحنه ------------------------------ */
    async function loop() {
      await Promise.all(cards.map(reveal));
      let i = Math.random() < 0.5 ? 0 : 1;
      while (!dead) {
        try {
          await act(cards[i]);
        } catch {
          /* خطای یک صحنه هرگز نباید چرخه را برای همیشه بکشد */
        }
        await wait(250);
        i ^= 1;
      }
    }
    /* فقط جرقه‌ها — برای دسکتاپ‌های باریک‌تر از ۱۱۵۰px که کارت در آن‌ها جا نمی‌شود؛
       تا هیرو در آن بازه هم همیشه زنده بماند */
    async function sparksLoop() {
      spkOn = true;
      let m = false;
      while (!dead) {
        try {
          await Promise.all(ROUTES.map((r, j) => spark(r, m, j * 120)));
        } catch {
          /* همان منطق تاب‌آوری چرخهٔ کارت‌ها */
        }
        await wait(700);
        m = !m;
      }
    }
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      cw = hero.clientWidth;
      hero.style.setProperty("--in", Math.max(14, Math.min(48, cw * 0.092)) + "px");
      ch = hero.clientHeight;
      cv!.width = Math.round(cw * dpr);
      cv!.height = Math.round(ch * dpr);
      ox = (cw - FW) / 2;
      if (cw >= 1150 && MQ.matches && !cards.length && on) {
        cards = [mk(0, 125.5, 223.8), mk(1, 1073, 223.8)];
        if (RM)
          cards.forEach((c) => {
            c.rp = 1;
            c.pl = c.P[2].map((p: number[]) => ({ x: p[0], y: p[1] }));
            c.circ = { ...c.ini };
          });
        else loop();
      } else if (cw < 1150 && MQ.matches && on && !RM && !spkOn) {
        sparksLoop();
      }
    }
    function frame(now: number) {
      raf = 0;
      if (!MQ.matches) return;
      const dt = Math.min(0.05, (now - last) / 1e3 || 0);
      last = now;
      /* نوبت‌بندی فریم بعدی «قبل از» رسم — تا هیچ استثنایی در رسم/گام،
         حلقهٔ انیمیشن را برای همیشه نکشد (گزارش کاربر: موشن چند ثانیه
         بعد از بارگذاری می‌میرد) */
      if (vis && !RM && !dead) raf = requestAnimationFrame(frame);
      try {
        step(dt);
        draw();
      } catch {
        /* فریم معیوب نادیده گرفته می‌شود؛ حلقه ادامه می‌یابد */
      }
    }
    const go = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    size();
    on = true;
    size();
    if (RM) {
      if (MQ.matches) draw();
    } else {
      go();
    }

    const onResize = () => {
      size();
      if (RM && MQ.matches) draw();
    };
    const onMQ = () => {
      size();
      if (RM) {
        if (MQ.matches) draw();
      } else {
        go();
      }
    };
    addEventListener("resize", onResize);
    MQ.addEventListener("change", onMQ);
    const ro = new ResizeObserver(() => {
      if (!MQ.matches) size();
    });
    ro.observe(hero);
    /* بازگشت به تب فعال — raf در تب پنهان تعلیق می‌شود؛ موقع بازگشت دوباره روشن کن */
    const onVis = () => {
      if (!document.hidden && !RM) go();
    };
    document.addEventListener("visibilitychange", onVis);
    /* نگهبان — اگر به هر دلیلی حلقه مرده بود ولی همهٔ شرایط فعال بود، دوباره روشنش کن؛
       پاسخ به گزارش کاربر که موشن هیرو پس از چند ثانیه دیگر ادامه نمی‌یافت */
    const wd = setInterval(() => {
      if (!dead && !document.hidden && MQ.matches && vis && !RM && !raf) go();
    }, 1500);
    if (document.fonts)
      document.fonts.ready.then(() => {
        if (!dead && !MQ.matches) size();
      });
    const io = new IntersectionObserver((e) => {
      vis = e[0].isIntersecting;
      if (vis && !RM) go();
    });
    io.observe(hero);

    return () => {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
      MQ.removeEventListener("change", onMQ);
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(wd);
      ro.disconnect();
      io.disconnect();
      tasks.length = 0;
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 block h-full w-full" />;
}

/* ------------------------- تایپ‌رایتر placeholder ------------------------- */

/** عبارت‌های چرخشی placeholder نوار جستجو — از فایل طراحی */
const HERO_PHRASES = ["دوره آنلاین A1", "دوره آمادگی آزمون", "دوره مکالمه", "دوره B2 حضوری"];

export function HeroType() {
  const [s, setS] = React.useState("");
  React.useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setS(HERO_PHRASES[0]);
      return;
    }
    let i = 0;
    let n = 0;
    let del = false;
    let timer: ReturnType<typeof setTimeout>;
    const t = () => {
      const str = HERO_PHRASES[i];
      if (!del) {
        n++;
        setS(str.slice(0, n));
        if (n === str.length) {
          del = true;
          timer = setTimeout(t, 1600);
          return;
        }
        timer = setTimeout(t, 110);
      } else {
        n--;
        setS(str.slice(0, n));
        if (n === 0) {
          del = false;
          i = (i + 1) % HERO_PHRASES.length;
          timer = setTimeout(t, 350);
          return;
        }
        timer = setTimeout(t, 45);
      }
    };
    timer = setTimeout(t, 1200);
    return () => clearTimeout(timer);
  }, []);
  return <>{s}</>;
}

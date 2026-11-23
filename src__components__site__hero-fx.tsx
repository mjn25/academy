"use client";

import React, { useEffect, useState } from "react";

/* ------------------------------------------------------------------------
   جلوه‌های متحرک هیرو — بازسازی جز به جز ticker های readme.com
   هیرو بدون شطرنجی: پنل سرمه‌ایِ یکدست + فقط خطوط مدار و تزئینات متحرک
   • CircuitRunners — پالس‌های نوری افقی و عمودی که روی خطوط مدار حرکت
     می‌کنند؛ چپ↔راست و بالا↔پایین (حرکت دو طرفهٔ مدار)
   • CircuitComets — جرقه‌های دنباله‌دار که روی مسیرهای خمیده مدار می‌دوند
   • SegTracer — جرقه‌ای که دور قاب قرص دو-بخشی می‌دود + رسم ورودیِ قاب
   • GlintBeam — اشعه مورب که هر چند ثانیه از روی کارت‌های وایرفریم عبور
     می‌کند؛ با reverse از راست به چپ هم می‌رود
   • CourseType — جستجوی زنده: نام دوره‌ها حرف‌به‌حرف تایپ و پاک می‌شوند
   مختصات موج از مرکز کمی بالاتر (شکاف پرندهٔ readme: −۱.۷۹ سلول)
   ------------------------------------------------------------------------ */

/** شبکه بعد از ~۳۵۰ms شروع می‌شود؛ سرعت readme: ۳۰۰ سلول در ۲ ثانیه */
export const REVEAL_DELAY = 350;
const CELLS_PER_MS = 300 / 2000;
/** ابعاد پنل — مبنای محاسبهٔ فاصلهٔ سلول‌ها (هیرو فول‌سکشن، ارتفاع ~۶۰۰) */
const CELL = 56;
const PANEL_W = 1232;
const PANEL_H = 600;

/** فاصلهٔ چبیشف سلول از مبدأ موج (مرکز، کمی بالاتر — مثل readme) */
function cellDist(x: number, y: number) {
  const cols = Math.ceil(PANEL_W / CELL);
  const rows = Math.ceil(PANEL_H / CELL);
  const cc = (cols - 1) / 2;
  const cr = (rows - 1) / 2 - 1.7857;
  const c = Math.round(x / CELL);
  const r = Math.round(y / CELL);
  return Math.max(Math.abs(c - cc), Math.abs(r - cr));
}

/** تأخیر ms تا رسیدن موج به این نقطه — تقریب تعداد سلول‌های حلقه‌های داخلی */
function waveMs(x: number, y: number, jitterSeed = 0) {
  const d = Math.ceil(cellDist(x, y));
  const cols = Math.ceil(PANEL_W / CELL);
  const rows = Math.ceil(PANEL_H / CELL);
  const total = cols * rows;
  const prevCells = Math.min(total * 0.82, (2 * d) * (2 * d));
  const jitter = ((jitterSeed * 7 + 13) % 5) * 28;
  return Math.round(REVEAL_DELAY + prevCells / CELLS_PER_MS + jitter);
}

/** استایل تأخیر برای «پاپ» تزئینات ( کمی بعد از خط) */
export function fxPop(x: number, y: number, seed = 0): React.CSSProperties {
  return { "--fx-delay": `${waveMs(x, y, seed) + 130}ms` } as React.CSSProperties;
}

/** عدد خام تأخیر پاپ — برای زمان‌بندی زنجیره‌های داخل کارت‌ها */
export function popMs(x: number, y: number, seed = 0): number {
  return waveMs(x, y, seed) + 130;
}

/** استایل تأخیر برای «رسم شدن» خطوط */
export function fxDraw(x: number, y: number, seed = 0): React.CSSProperties {
  return { "--fx-delay": `${waveMs(x, y, seed)}ms` } as React.CSSProperties;
}

/* ------------- جرقهٔ متحرک دور قاب قرص دو-بخشی (ticker rn) ------------- */

export function SegTracer() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 432 40"
      preserveAspectRatio="none"
      fill="none"
      className="pointer-events-none absolute inset-0 z-10 size-full"
    >
      {/* رسم ورودی قاب — جرقهٔ آبی که دور تا دور کشیده می‌شود (ticker t8)
          بعد از settle محو می‌شود (dc-draw-fade) تا مثل readme قاب به
          حاشیهٔ سفید ساده برگردد و حلقهٔ فیروزه‌ای دائمی باقی نماند */}
      <rect
        x="0.75"
        y="0.75"
        width="430.5"
        height="38.5"
        rx="19.25"
        pathLength="1"
        className="dc-draw-fade"
        stroke="rgba(104, 205, 255, 0.55)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        style={{ "--fx-delay": "1050ms" } as React.CSSProperties}
      />
      {/* جرقهٔ چرخان — هر ۲.۴s یک دور کامل دور قاب (ticker rn) */}
      <rect
        x="0.75"
        y="0.75"
        width="430.5"
        height="38.5"
        rx="19.25"
        pathLength="100"
        className="dc-traveler"
        stroke="rgba(104, 205, 255, 0.9)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ------------- اشعهٔ گلیت روی کارت‌های وایرفریم (ticker tK) ------------- */

export function GlintBeam({
  period = 9,
  delay = 0,
  reverse = false,
}: {
  period?: number;
  delay?: number;
  reverse?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <span
        className={`dc-glint absolute inset-y-0 left-0 w-14 ${reverse ? "dc-glint-r" : ""}`}
        style={
          {
            "--glint-period": `${period}s`,
            "--glint-delay": `${delay}s`,
          } as React.CSSProperties
        }
      />
    </span>
  );
}

/* ------------------------------------------------------------------------
   برچسب تایپ‌شونده — همان ticker eq در readme: حرف‌به‌حرف با سرعت ۷۵ms
   همراه نوار نشانگر چشمک‌زن که با تمام‌شدن حرف‌ها خاموش می‌شود
   ------------------------------------------------------------------------ */

export function DcType({
  text,
  delay = 0,
  speed = 75,
  className = "",
}: {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let interval: number | undefined;
    const kick = window.setTimeout(() => {
      interval = window.setInterval(() => {
        setN((v) => {
          if (v >= text.length) {
            window.clearInterval(interval);
            return v;
          }
          return v + 1;
        });
      }, speed);
    }, delay);
    return () => {
      window.clearTimeout(kick);
      window.clearInterval(interval);
    };
  }, [text, delay, speed]);
  const done = n >= text.length;
  return (
    <span className={`relative inline-flex items-center ${className}`} dir="ltr">
      <span>{text.slice(0, n)}</span>
      {!done && n > 0 && (
        <span aria-hidden="true" className="dc-caret ms-0.5 h-[10px] w-px shrink-0 bg-white/35" />
      )}
    </span>
  );
}


/* ------------------------------------------------------------------------
   شبکهٔ مدار — همان ticker tG در readme: مسیرهای ۱px با خمِ ۴۵° و گوشه‌های
   گرد که از مرکز موج به بیرون «کشیده» می‌شوند (۱۴۰۰ms، ease مکعبی)؛
   هندسه از باندل readme استخراج و با تبدیل مختصات V/H خود باندل بازسازی شده
   + گره‌های چشمک‌زن (ticker eM) که چپ/راست هر ۲.۲s یک‌درمیان روشن می‌شوند
   ------------------------------------------------------------------------ */

const CIRCUIT_PATHS: Array<{ d: string; delay: number }> = [
  { d: "M336 336.001L280 336.001", delay: 1101 },
  {
    d: "M336 336.001L590.4 336.001C599.361 336.001 603.842 336.001 607.264 337.744C610.275 339.278 612.722 341.726 614.256 344.737C614.668 345.544 614.982 346.409 615.222 347.379C615.311 347.739 615.629 348.001 616 348.001C616.372 348.001 616.69 347.739 616.779 347.379C617.019 346.409 617.333 345.544 617.744 344.737C619.278 341.726 621.726 339.278 624.737 337.744C628.159 336.001 632.64 336.001 641.6 336.001H896",
    delay: 457,
  },
  {
    d: "M336 336.001V280.001V249.6C336 240.639 336 236.158 334.256 232.736C332.722 229.725 330.275 227.278 327.264 225.744C326.457 225.332 325.591 225.018 324.622 224.778C324.262 224.689 324 224.371 324 224C324 223.628 324.262 223.311 324.622 223.221C325.591 222.981 326.457 222.667 327.264 222.256C330.275 220.722 332.722 218.274 334.256 215.263C336 211.841 336 207.36 336 198.4V168C336 149.346 336 140.019 339.373 132.786C341.203 128.863 343.709 125.334 346.747 122.343",
    delay: 1073,
  },
  { d: "M896 336.001H952", delay: 1422 },
  {
    d: "M896 336.001V280.001V249.6C896 240.639 896 236.158 897.744 232.736C899.278 229.725 901.726 227.278 904.736 225.744C905.543 225.332 906.409 225.018 907.378 224.778C907.739 224.689 908 224.371 908 224C908 223.628 907.739 223.31 907.378 223.221C906.409 222.981 905.543 222.667 904.736 222.256C901.726 220.722 899.278 218.274 897.744 215.263C896 211.841 896 207.36 896 198.4V168C896 149.346 896 140.019 892.627 132.786C890.798 128.863 888.292 125.334 885.253 122.343",
    delay: 1338,
  },
  { d: "M280 336.001V392V448.001", delay: 861 },
  { d: "M280 336.001L224 336.001H168H112H56H0", delay: 1310 },
  { d: "M280 448.001H224H168H112H56H0", delay: 1366 },
  {
    d: "M280 448.001H336L590.4 448C599.361 448 603.842 448 607.264 446.256C610.275 444.722 612.722 442.274 614.256 439.264C614.668 438.457 614.982 437.591 615.222 436.622C615.311 436.261 615.629 436 616 436C616.372 436 616.69 436.261 616.779 436.622C617.019 437.591 617.333 438.457 617.744 439.264C619.278 442.274 621.726 444.722 624.737 446.256C628.159 448 632.64 448 641.6 448L896 448.001",
    delay: 1422,
  },
  { d: "M952 448.001V392.001V336.001", delay: 805 },
  { d: "M952 448.001H1008L1064 448.001L1120 448.001H1176H1232", delay: 1741 },
  { d: "M952 336.001H1008H1064H1120H1176H1232", delay: 1657 },
  {
    d: "M1232 112H1176H1120L1064 112H1008L952 112C933.346 112 924.019 112 916.786 108.628C912.863 106.798 909.334 104.292 906.343 101.254",
    delay: 1969,
  },
  {
    d: "M346.747 122.343C349.65 119.486 353.038 117.121 356.786 115.373C364.019 112 373.346 112 392 112H448H504H560L616 112H672H728L784 112H840H840.007C858.656 112 867.982 112 875.214 115.373C878.962 117.121 882.351 119.486 885.253 122.343",
    delay: 889,
  },
  { d: "M346.747 122.343L325.657 101.253", delay: 1045 },
  { d: "M885.253 122.343L906.343 101.254", delay: 1394 },
  {
    d: "M336 0V56C336 74.654 336 83.981 332.627 91.2143C330.879 94.962 328.514 98.3504 325.657 101.253",
    delay: 1017,
  },
  {
    d: "M325.657 101.253C322.666 104.291 319.137 106.798 315.214 108.627C307.981 112 298.654 112 280 112L224 112L168 112L112 112H56H0",
    delay: 1073,
  },
  {
    d: "M896 0V56.0004C896 74.6544 896 83.9814 899.373 91.2147C901.121 94.9624 903.486 98.3508 906.343 101.254",
    delay: 1422,
  },
];

/** گره‌های چشمک‌زن — مختصات دقیق ticker eM در readme (چپ: ۰، راست: ۲.۲s) */
const JUNCTIONS: Array<{ x: number; y: number; side: "l" | "r" }> = [
  { x: 347, y: 123, side: "l" },
  { x: 324, y: 224, side: "l" },
  { x: 896, y: 336, side: "l" },
  { x: 885, y: 123, side: "r" },
  { x: 908, y: 224, side: "r" },
  { x: 280, y: 448, side: "r" },
];

export function CircuitNetwork() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1232 600"
      preserveAspectRatio="none"
      fill="none"
      className="pointer-events-none absolute inset-0 size-full"
      style={{ zIndex: 0 }}
    >
      {CIRCUIT_PATHS.map((p, i) => (
        <path
          key={i}
          d={p.d}
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1"
          pathLength="1"
          className="dc-draw"
          style={{ "--fx-delay": `${p.delay}ms` } as React.CSSProperties}
        />
      ))}
      {/* گره‌های مدار — خط ثابت محو + جرقهٔ چشمک‌زن روی هر گره
          (ticker eM: چپ و راست یک‌درمیان هر ۲.۲s با درخشش فیروزه‌ای) */}
      {JUNCTIONS.map((j, i) => (
        <g key={`j${i}`}>
          <circle
            cx={j.x}
            cy={j.y}
            r="3.5"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1"
            pathLength="1"
            className="dc-draw"
            style={{ "--fx-delay": `${CIRCUIT_PATHS[Math.min(i, CIRCUIT_PATHS.length - 1)].delay}ms` } as React.CSSProperties}
          />
          <circle
            cx={j.x}
            cy={j.y}
            r="2.5"
            fill="rgba(104, 205, 255, 0.95)"
            className="dc-junction"
            style={
              {
                "--blink-delay": j.side === "l" ? "0ms" : "1100ms",
                filter: "drop-shadow(0 0 6px rgba(104, 205, 255, 0.9))",
              } as React.CSSProperties
            }
          />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------------
   پالس‌های مدار — حرکت دو طرفهٔ «راست و چپ، بالا و پایین»: روی خطوط افقی
   شبکهٔ مدار، یک رگهٔ نور فیروزه‌ای از چپ به راست (y=۳۳۶) و یکی از راست به
   چپ (y=۴۴۸) و یک رگهٔ سفید محو بالا (y=۱۱۲) می‌دوند؛ روی خطوط عمودی هم
   دو رگهٔ فیروزه‌ای (x=۳۳۶ پایین‌رونده، x=۸۹۶ بالا‌رونده) حرکت می‌کنند؛
   همه با کورئوگرافی جدا و بی‌پایان.
   مختصات دقیقاً روی مسیرهای CIRCUIT_PATHS (viewBox ۱۲۳۲×۷۲۸، xl+)
   ------------------------------------------------------------------------ */

type RunnerSpec = {
  axis: "h" | "v";
  /** افقی: x نقطهٔ شروع و w طول ریل / عمودی: y نقطهٔ شروع و h طول ریل */
  x: number;
  y: number;
  len: number;
  fwd: boolean;
  period: number;
  delay: number;
  color: string;
};

const RUNNERS: RunnerSpec[] = [
  /* ریل میانی y=۳۳۶ — پرترددترین مسیر */
  { axis: "h", x: 224, y: 336, len: 784, fwd: true, period: 4.2, delay: 0.6, color: "rgba(104, 205, 255, 0.85)" },
  { axis: "h", x: 224, y: 336, len: 784, fwd: false, period: 5.8, delay: 2.4, color: "rgba(104, 205, 255, 0.5)" },
  { axis: "h", x: 0, y: 336, len: 280, fwd: false, period: 3.4, delay: 1.4, color: "rgba(104, 205, 255, 0.45)" },
  { axis: "h", x: 896, y: 336, len: 336, fwd: true, period: 3.8, delay: 3.1, color: "rgba(255, 255, 255, 0.45)" },
  /* ریل پایین y=۴۴۸ */
  { axis: "h", x: 224, y: 448, len: 784, fwd: false, period: 5.0, delay: 1.1, color: "rgba(104, 205, 255, 0.65)" },
  { axis: "h", x: 0, y: 448, len: 280, fwd: false, period: 4.4, delay: 3.6, color: "rgba(104, 205, 255, 0.4)" },
  { axis: "h", x: 952, y: 448, len: 280, fwd: true, period: 3.2, delay: 0.2, color: "rgba(104, 205, 255, 0.5)" },
  /* ریل بالای منحنی y=۱۱۲ */
  { axis: "h", x: 392, y: 112, len: 448, fwd: true, period: 4.6, delay: 2.6, color: "rgba(255, 255, 255, 0.5)" },
  { axis: "h", x: 952, y: 112, len: 280, fwd: false, period: 3.6, delay: 4.3, color: "rgba(104, 205, 255, 0.45)" },
  { axis: "h", x: 0, y: 112, len: 280, fwd: true, period: 4.9, delay: 0.9, color: "rgba(255, 255, 255, 0.4)" },
  /* ستون‌های عمودی — بالا↔پایین */
  { axis: "v", x: 336, y: 122, len: 214, fwd: true, period: 3.6, delay: 1.8, color: "rgba(104, 205, 255, 0.7)" },
  { axis: "v", x: 896, y: 122, len: 214, fwd: false, period: 4.4, delay: 0.3, color: "rgba(104, 205, 255, 0.6)" },
  { axis: "v", x: 336, y: 0, len: 101, fwd: false, period: 2.9, delay: 2.9, color: "rgba(255, 255, 255, 0.4)" },
  { axis: "v", x: 896, y: 0, len: 101, fwd: true, period: 3.1, delay: 1.6, color: "rgba(104, 205, 255, 0.5)" },
  { axis: "v", x: 952, y: 336, len: 112, fwd: true, period: 2.8, delay: 4.0, color: "rgba(255, 255, 255, 0.4)" },
];

export function CircuitRunners() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 0 }}
    >
      {RUNNERS.map((r, i) =>
        r.axis === "h" ? (
          <span
            key={i}
            className="absolute h-[2px] overflow-hidden"
            style={{ left: r.x, top: r.y - 0.5, width: r.len }}
          >
            <span
              className={r.fwd ? "dc-runner dc-runner-ltr" : "dc-runner dc-runner-rtl"}
              style={
                {
                  "--run-w": `${r.len}px`,
                  "--run-period": `${r.period}s`,
                  "--run-delay": `${r.delay}s`,
                  background: `linear-gradient(90deg, transparent, ${r.color} 45%, ${r.color} 55%, transparent)`,
                } as React.CSSProperties
              }
            />
          </span>
        ) : (
          <span
            key={`v${i}`}
            className="absolute w-[2px] overflow-hidden"
            style={{ left: r.x - 0.5, top: r.y, height: r.len }}
          >
            <span
              className={r.fwd ? "dc-runner dc-runner-vdown" : "dc-runner dc-runner-vup"}
              style={
                {
                  "--run-h": `${r.len}px`,
                  "--run-period": `${r.period}s`,
                  "--run-delay": `${r.delay}s`,
                  width: "2px",
                  height: "64px",
                  background: `linear-gradient(180deg, transparent, ${r.color} 45%, ${r.color} 55%, transparent)`,
                } as React.CSSProperties
              }
            />
          </span>
        ),
      )}
    </span>
  );
}

/* ------------------------------------------------------------------------
   جرقه‌های دنباله‌دار مدار — همان حس ticker های جابه‌جایی readme: یک قطعهٔ
   کوتاه نور که روی مسیرهای خمیدهٔ مدار (با گوشه‌های گرد) از ابتدا تا انتها
   می‌دود؛ با pathLength=۱۰۰۰ نرمال‌سازی شده و سه مسیر متفاوت با کورئوگرافی
   مستقل — مکمل پالس‌های افقی/عمودی بالا
   ------------------------------------------------------------------------ */

const COMET_PATHS: Array<{ d: string; period: number; delay: number; color: string }> = [
  {
    d: "M336 336.001L590.4 336.001C599.361 336.001 603.842 336.001 607.264 337.744C610.275 339.278 612.722 341.726 614.256 344.737C614.668 345.544 614.982 346.409 615.222 347.379C615.311 347.739 615.629 348.001 616 348.001C616.372 348.001 616.69 347.739 616.779 347.379C617.019 346.409 617.333 345.544 617.744 344.737C619.278 341.726 621.726 339.278 624.737 337.744C628.159 336.001 632.64 336.001 641.6 336.001H896",
    period: 7.0,
    delay: 0.8,
    color: "rgba(104, 205, 255, 0.8)",
  },
  {
    d: "M1232 112H1176H1120L1064 112H1008L952 112C933.346 112 924.019 112 916.786 108.628C912.863 106.798 909.334 104.292 906.343 101.254",
    period: 6.4,
    delay: 3.4,
    color: "rgba(255, 255, 255, 0.55)",
  },
  {
    d: "M896 0V56.0004C896 74.6544 896 83.9814 899.373 91.2147C901.121 94.9624 903.486 98.3508 906.343 101.254",
    period: 5.4,
    delay: 6.2,
    color: "rgba(104, 205, 255, 0.6)",
  },
  {
    d: "M280 448.001H224H168H112H56H0",
    period: 5.0,
    delay: 1.9,
    color: "rgba(104, 205, 255, 0.55)",
  },
  {
    d: "M952 448.001H1008L1064 448.001L1120 448.001H1176H1232",
    period: 4.6,
    delay: 5.1,
    color: "rgba(104, 205, 255, 0.6)",
  },
  {
    d: "M336 0V56C336 74.654 336 83.981 332.627 91.2143C330.879 94.962 328.514 98.3504 325.657 101.253",
    period: 4.6,
    delay: 7.4,
    color: "rgba(255, 255, 255, 0.5)",
  },
  {
    d: "M336 336.001V280.001V249.6C336 240.639 336 236.158 334.256 232.736C332.722 229.725 330.275 227.278 327.264 225.744C326.457 225.332 325.591 225.018 324.622 224.778C324.262 224.689 324 224.371 324 224C324 223.628 324.262 223.311 324.622 223.221C325.591 222.981 326.457 222.667 327.264 222.256C330.275 220.722 332.722 218.274 334.256 215.263C336 211.841 336 207.36 336 198.4V168C336 149.346 336 140.019 339.373 132.786C341.203 128.863 343.709 125.334 346.747 122.343",
    period: 6.6,
    delay: 4.4,
    color: "rgba(104, 205, 255, 0.5)",
  },
  {
    d: "M896 336.001V280.001V249.6C896 240.639 896 236.158 897.744 232.736C899.278 229.725 901.726 227.278 904.736 225.744C905.543 225.332 906.409 225.018 907.378 224.778C907.739 224.689 908 224.371 908 224C908 223.628 907.739 223.31 907.378 223.221C906.409 222.981 905.543 222.667 904.736 222.256C901.726 220.722 899.278 218.274 897.744 215.263C896 211.841 896 207.36 896 198.4V168C896 149.346 896 140.019 892.627 132.786C890.798 128.863 888.292 125.334 885.253 122.343",
    period: 6.9,
    delay: 8.3,
    color: "rgba(104, 205, 255, 0.45)",
  },
  {
    d: "M896 336.001H952",
    period: 3.4,
    delay: 2.8,
    color: "rgba(255, 255, 255, 0.4)",
  },
  {
    d: "M280 336.001L224 336.001H168H112H56H0",
    period: 4.2,
    delay: 9.1,
    color: "rgba(104, 205, 255, 0.45)",
  },
];

export function CircuitComets() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1232 600"
      preserveAspectRatio="none"
      fill="none"
      className="pointer-events-none absolute inset-0 size-full"
      style={{ zIndex: 0 }}
    >
      {COMET_PATHS.map((c, i) => (
        <path
          key={i}
          d={c.d}
          pathLength="1000"
          stroke={c.color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          className="dc-comet"
          style={
            {
              "--comet-period": `${c.period}s`,
              "--comet-delay": `${c.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------------
   جستجوی زندهٔ دوره‌ها — تایپ‌رایتر چرخشی: نام هر دوره حرف‌به‌حرف نوشته
   می‌شود، می‌ماند، پاک می‌شود و نوبت دورهٔ بعدی است (dir=rtl، فارسی)
   ------------------------------------------------------------------------ */

export function CourseType({
  phrases,
  speed = 70,
  hold = 1700,
  className = "",
}: {
  phrases: string[];
  speed?: number;
  hold?: number;
  className?: string;
}) {
  const [txt, setTxt] = useState("");
  useEffect(() => {
    let idx = 0;
    let pos = 0;
    let deleting = false;
    let timer = 0;
    const step = () => {
      const cur = phrases[idx % phrases.length];
      if (!deleting) {
        pos += 1;
        setTxt(cur.slice(0, pos));
        if (pos >= cur.length) {
          deleting = true;
          timer = window.setTimeout(step, hold);
          return;
        }
        timer = window.setTimeout(step, speed);
      } else {
        pos -= 1;
        setTxt(cur.slice(0, pos));
        if (pos <= 0) {
          deleting = false;
          idx += 1;
          timer = window.setTimeout(step, 420);
          return;
        }
        timer = window.setTimeout(step, Math.max(24, speed * 0.38));
      }
    };
    timer = window.setTimeout(step, 1200);
    return () => window.clearTimeout(timer);
  }, [phrases, speed, hold]);
  return (
    <span className={`min-w-0 flex-1 truncate text-start ${className}`} dir="rtl">
      {txt || <span className="text-ink-faint">جستجوی دوره…</span>}
    </span>
  );
}

/* ------------------------------------------------------------------------
   ذرات جرقه — همان AIHoverStars در readme: نقطه‌های ریز که از مرکز کارت
   به بیرون «پرتاب» می‌شوند و محو می‌شوند (اینجا: موج‌های دوره‌ای ملایم)
   ------------------------------------------------------------------------ */

export function StarBurst({ className = "" }: { className?: string }) {
  const stars = [
    { dx: -26, dy: 38, d: 0 },
    { dx: 8, dy: 44, d: 140 },
    { dx: 34, dy: 26, d: 280 },
    { dx: -44, dy: 6, d: 420 },
  ];
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {stars.map((s, i) => (
        <span
          key={i}
          className="dc-star absolute left-1/2 top-1/2 size-[3px] rounded-[1px] bg-white/70"
          style={
            {
              "--dx": `${s.dx}px`,
              "--dy": `${s.dy}px`,
              "--star-delay": `${s.d}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------------
   شکل‌های متحرک دوره‌ای هیرو — «فعال‌سازی‌های» readme: هر چند ثانیه یک شکل
   تزئینی (تراشهٔ چرخ‌دنده، علامت سؤال، چک‌لیست، کرهٔ زمین، اکولایزر، ستارهٔ
   جرقه، حباب گفتگو) در یک سلول شبکه پاپ می‌شود، چند ثانیه می‌ماند و محو
   می‌شود؛ همراه هر پاپ یک رگبار جرقهٔ ریز از همان نقطه به بیرون پرتاب می‌شود.
   واژگان بصری از باندل رسمی readme (gears/question-mark/checklist/globe/bars
   + ستارهٔ چهارپر sparkle) با تم سرمه‌ای کلینیک
   ------------------------------------------------------------------------ */

type VignSpec = {
  /** مرکز شکل در viewBox پنل (۱۲۳۲×۷۲۸) */
  x: number;
  y: number;
  /** دورهٔ کامل چرخهٔ پاپ (ثانیه) */
  period: number;
  /** تأخیر شروع (ثانیه) */
  delay: number;
  kind: "gear" | "question" | "check" | "globe" | "bars" | "star" | "bubble";
};

const VIGN_ICONS: Record<VignSpec["kind"], React.ReactNode> = {
  gear: (
    <svg viewBox="0 0 20 20" fill="none" className="dc-vign-spin size-[18px]" aria-hidden="true">
      <path
        d="M8.15 5.68L7.15 5.45L6.61 6L6.84 7L5.92 7.62V8.24L6.84 8.85L7.15 9.93L7.61 10.39L8.68 10.08L9.31 11H9.93L10.54 10.08L11.61 10.39L12.15 9.85L11.92 8.85L12.85 8.23V7.61L11.92 7L11.62 5.93L11.15 5.46L10.08 5.77L9.46 4.84H8.84L8.15 5.68Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0.4 1.2) scale(0.9)"
      />
      <circle cx="9.7" cy="7.9" r="1.6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  ),
  question: (
    <svg viewBox="0 0 20 20" fill="none" className="size-[18px]" aria-hidden="true">
      <circle cx="10" cy="10" r="6.4" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M8.7 8.3C9.1 7.1 11.1 7.2 11.1 8.5C11.1 9.4 10 9.5 10 10.3M10 12.1V12.2"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 20 20" fill="none" className="size-[18px]" aria-hidden="true">
      <path
        d="M9.8 7.2H15.5M9.8 12.8H15.5M4.5 7.5L5.6 8.5L7.8 5.5M5.8 14.2C6.6 14.2 7.2 13.6 7.2 12.8C7.2 12.1 6.6 11.5 5.8 11.5C5.1 11.5 4.5 12.1 4.5 12.8C4.5 13.6 5.1 14.2 5.8 14.2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 20 20" fill="none" className="size-[18px]" aria-hidden="true">
      <path
        d="M16 10H4M16.2 10C16.2 13.4 13.4 16.2 10 16.2C6.6 16.2 3.8 13.4 3.8 10C3.8 6.6 6.6 3.8 10 3.8C13.4 3.8 16.2 6.6 16.2 10ZM10 16C8.5 16 7.3 13.3 7.3 10C7.3 6.7 8.5 4 10 4C11.5 4 12.7 6.7 12.7 10C12.7 13.3 11.5 16 10 16Z"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  ),
  bars: (
    <span className="flex items-end gap-[3px]" aria-hidden="true">
      {[9, 15, 6].map((h, i) => (
        <span
          key={i}
          className="dc-vign-bar w-[3px] rounded-full bg-current"
          style={{ height: `${h}px`, "--bar-delay": `${i * 0.18}s` } as React.CSSProperties}
        />
      ))}
    </span>
  ),
  star: (
    <svg viewBox="0 0 20 20" fill="none" className="dc-vign-tw size-[22px]" aria-hidden="true">
      <path
        d="M10 3.5C10.6 6.8 12.6 8.8 16 9.4C12.6 10 10.6 12 10 15.4C9.4 12 7.4 10 4 9.4C7.4 8.8 9.4 6.8 10 3.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bubble: (
    <svg viewBox="0 0 20 20" fill="none" className="size-[18px]" aria-hidden="true">
      <path
        d="M4 6.5C4 5.4 4.9 4.5 6 4.5H14C15.1 4.5 16 5.4 16 6.5V11.5C16 12.6 15.1 13.5 14 13.5H8.5L5.2 16.2C4.8 16.5 4 16.3 4 15.7V6.5Z"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <path d="M10 6.8V11.2M7.8 9H12.2" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  ),
};

/** چیدمان شکل‌ها — حاشیهٔ راست و چپ پنل فول‌سکشن (ستون مرکزی متن آزاد) */
const VIGNETTES: VignSpec[] = [
  { x: 168, y: 176, period: 12.5, delay: 0.8, kind: "gear" },
  { x: 1064, y: 140, period: 13.5, delay: 3.2, kind: "question" },
  { x: 96, y: 356, period: 15, delay: 5.4, kind: "check" },
  { x: 1136, y: 356, period: 14, delay: 7.8, kind: "globe" },
  { x: 224, y: 452, period: 13, delay: 2.2, kind: "bars" },
  { x: 1008, y: 452, period: 11.5, delay: 9.4, kind: "star" },
  { x: 360, y: 64, period: 15.5, delay: 10.6, kind: "bubble" },
  { x: 872, y: 64, period: 12, delay: 4.3, kind: "star" },
];

/** رنگ هر تراشه — فیروزه‌ای یا سفید، یک‌درمیان */
function vignColor(kind: VignSpec["kind"], i: number) {
  if (kind === "star") return "text-[#68CDFF]/95";
  return i % 2 === 0 ? "text-white/75" : "text-[#68CDFF]/85";
}

/** جرقه‌های همراه پاپ حذف شدند (درخواست کاربر — فقط بکگراند) */

export function HeroVignettes() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 0 }}
    >
      {VIGNETTES.map((v, i) => (
        <span
          key={i}
          className="dc-vign absolute"
          style={
            {
              left: v.x - 18,
              top: v.y - 18,
              "--vign-period": `${v.period}s`,
              "--vign-delay": `${v.delay}s`,
            } as React.CSSProperties
          }
        >
          {/* جرقه‌های همراه پاپ حذف شدند (درخواست کاربر) — فقط بدنهٔ شکل باقی است */}
          {/* بدنهٔ شکل — تراشهٔ سرمه‌ای با قاب داخلی یا ستارهٔ برهنه */}
          {v.kind === "star" ? (
            <span className={`relative grid size-9 place-items-center ${vignColor(v.kind, i)}`}>
              {VIGN_ICONS[v.kind]}
            </span>
          ) : (
            <span
              className={`relative grid size-9 place-items-center rounded-full bg-[#030e55] ring-1 ring-white/[0.22] ${vignColor(v.kind, i)}`}
            >
              {VIGN_ICONS[v.kind]}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}

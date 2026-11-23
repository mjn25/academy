const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert latin digits inside a string/number to Persian digits */
export function fa(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** Format a number with Persian thousands separator + digits, e.g. ۴٬۸۰۰٬۰۰۰ */
export function faNum(n: number): string {
  return fa(n.toLocaleString("en-US").replace(/,/g, "٬"));
}

/** Price with تومان suffix */
export function faPrice(n: number): string {
  return `${faNum(n)} تومان`;
}

/** Truncate text */
export function truncate(text: string, len = 90): string {
  if (text.length <= len) return text;
  return text.slice(0, len).trimEnd() + "…";
}

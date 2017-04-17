export function padRight(s: string, width: number): string { 
  try {
    if (width - s.length + 1 <= 0) {
      return s;
    } else {
      return s + Array(width - s.length + 1).join(' ');
    }
  } catch (e) {
    return s;
  }
}

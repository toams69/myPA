export function getDurationInMs(startTime: [number, number]): number {
  let diff = process.hrtime(startTime);
  return Math.floor((diff[0] * 1e9 + diff[1]) / 1000000);
}

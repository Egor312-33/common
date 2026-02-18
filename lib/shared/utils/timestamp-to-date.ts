export function timestampToDate(timestamp: any): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === "object" && "seconds" in timestamp) {
    return new Date(
      timestamp.seconds * 1000 + (timestamp.nanos || 0) / 1_000_000,
    );
  }
  return undefined;
}

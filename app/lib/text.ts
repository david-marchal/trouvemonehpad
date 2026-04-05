const MOJIBAKE_MARKERS = ["Ã", "â€", "â€™", "â€œ", "â€\u009d", "â€“", "â€”", "â€¦", "Â\u00a0", "�"];

export function repairUtf8Mojibake(value: string | null): string | null {
  if (!value) {
    return value;
  }

  if (!MOJIBAKE_MARKERS.some((marker) => value.includes(marker))) {
    return value;
  }

  const repaired = Buffer.from(value, "latin1").toString("utf8").trim();
  return repaired || value;
}

export function repairRecordStrings<T extends Record<string, unknown>>(record: T): T {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      typeof value === "string" ? repairUtf8Mojibake(value) : value,
    ])
  ) as T;
}

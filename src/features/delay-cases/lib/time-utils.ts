
export function parseVietnamDateTime(isoString: string): Date {
  if (!isoString) return new Date();

  if (isoString.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    return new Date(`${isoString}T00:00:00`);
  }

  const hasOffset = isoString.includes('Z') || /[+-]\d{2}:\d{2}$/.test(isoString);

  if (!hasOffset) {
    return new Date(`${isoString}+07:00`);
  }

  return new Date(isoString);
}


export function formatVietnamDateTime(value: Date | string): string {
  if (!value) return "";

  let dateObj: Date;
  if (typeof value === "string") {
    if (value.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-");
      return `${day}/${month}/${year}`;
    }
    dateObj = parseVietnamDateTime(value);
  } else {
    dateObj = value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dateObj).replace(", ", " - ");
}


export function formatDateOnly(value: string | Date): string {
  if (!value) return "";

  if (typeof value === "string" && value.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  const dateObj = typeof value === "string" ? parseVietnamDateTime(value) : value;

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dateObj);
}

export function getCountdownParts(targetDate: Date, now: Date = new Date()) {
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);

  return { isExpired: false, days, hours, minutes };
}

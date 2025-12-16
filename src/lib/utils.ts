import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

/**
 * Parse a Beijing time string (UTC+8) to a Date object.
 * API timestamps are in Beijing time but may not include timezone info.
 * This function ensures correct parsing regardless of the device timezone.
 */
export function parseBeijingTime(dateString: string): Date {
  // If the string already has timezone info, parse directly
  if (dateString.includes('+') || dateString.includes('Z')) {
    return new Date(dateString);
  }

  // Otherwise, treat it as Beijing time (UTC+8)
  // Append +08:00 to make it explicit
  const beijingTimeString = dateString.replace(' ', 'T') + '+08:00';
  return new Date(beijingTimeString);
}

/**
 * Format date in user's local timezone
 * Input should be a Beijing time string from API
 */
export function formatDate(dateString: string): string {
  const date = parseBeijingTime(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format time in user's local timezone
 * Input should be a Beijing time string from API
 */
export function formatTime(dateString: string): string {
  const date = parseBeijingTime(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format date and time in user's local timezone
 * Input should be a Beijing time string from API
 */
export function formatDateTime(dateString: string): string {
  const date = parseBeijingTime(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function generateTicketId(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

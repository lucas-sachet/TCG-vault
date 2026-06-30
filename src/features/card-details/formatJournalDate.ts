export function formatJournalDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthNum = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const month = monthNames[monthNum - 1] || parts[1];
      return `${month} ${day}, ${year}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

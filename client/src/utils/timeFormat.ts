export function formatRelativeToNow(dateString,currentTime) {
    const date = new Date(dateString);
    const now = new Date(currentTime);
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30); // 简化处理，假设每月30天
    const diffYears = Math.floor(diffDays / 365); // 简化处理，未考虑闰年
  
    if (diffSeconds < 60) {
        return `${diffSeconds}s  ago`;
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m  ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h  ago`;
      } else if (diffDays < 30) {
        return `${diffDays}d  ago`;
      } else if (diffMonths < 12) {
        return `${diffMonths}month  ago`;
      } else if (diffYears < 1) {
        // 差异在一年以内但超过一个月，可以显示为“几个月前”
        // 注意：这里的月份计算是简化的，可能不准确
        return `${Math.floor(diffDays / 30)}months  ago`; // 或者直接返回“几个月前”
      } else {
        // 超过一年，返回默认创建时间
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
  }
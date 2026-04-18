// src/shared/constants/feature-flags.ts
export const FLAGS = {
  HR_RETENTION_AI_SUGGESTIONS: false,  // AI gợi ý intervention — chưa build
  HR_CULTURE_VIDEO_LESSON: false,       // Video trong lessons — Cloudflare Stream chưa kết nối
  HR_PASSPORT_EXPORT_PDF: false,        // Export passport PDF
} as const

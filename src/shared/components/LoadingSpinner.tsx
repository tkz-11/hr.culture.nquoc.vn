export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="w-8 h-8 border-4 border-nquoc-border border-t-nquoc-blue rounded-full animate-spin" />
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center w-full min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-nquoc-border border-t-nquoc-blue rounded-full animate-spin" />
        <p className="text-sm text-nquoc-muted">Đang tải...</p>
      </div>
    </div>
  )
}

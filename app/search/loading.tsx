export default function SearchLoading() {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col md:flex-row">
      <div className="flex w-full flex-col border-r border-sage-200 bg-[#FFFBF7] md:w-[55%]">
        <div className="border-b border-sage-100 p-4">
          <div className="h-[52px] animate-pulse rounded-xl bg-sage-100" />
          <div className="mt-3 flex gap-2">
            <div className="h-[44px] w-36 animate-pulse rounded-lg bg-sage-100" />
            <div className="h-[44px] w-32 animate-pulse rounded-lg bg-sage-100" />
          </div>
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[124px] animate-pulse rounded-xl border border-sage-200 bg-white"
            />
          ))}
        </div>
      </div>
      <div className="hidden w-[45%] bg-sage-100 md:block" />
    </div>
  );
}

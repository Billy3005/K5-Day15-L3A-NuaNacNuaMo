/** Dấu hiệu nhận diện: ô vuông bo góc có chữ L, cùng hình với favicon (app/icon.svg). */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="8" fill="#234FA0" />
      <path d="M11 8v16h10" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

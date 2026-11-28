/** Logo NewLearn — phương án A trong docs/design/newlearn/Logo.dc.html: sách mở và chấm hổ phách (nguồn). */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flex: "none" }}>
      <rect width="32" height="32" rx="8" fill="#3A4FD0" />
      <path
        d="M7 11.5c3-1.3 6-1 9 1.2 3-2.2 6-2.5 9-1.2v10c-3-1.3-6-1-9 1.2-3-2.2-6-2.5-9-1.2z"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M16 12.7v10" stroke="#fff" strokeWidth="1.8" />
      <circle cx="24.5" cy="7.5" r="3" fill="#F5B83D" />
    </svg>
  );
}

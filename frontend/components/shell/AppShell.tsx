"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  Clapperboard,
  Flame,
  LayoutDashboard,
  Moon,
  Plus,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { Logo } from "./Logo";

export type ThemeSetting = "light" | "dark" | "system";
export type FontSetting = "md" | "lg";

interface Prefs {
  theme: ThemeSetting;
  font: FontSetting;
  reduceMotion: boolean;
  isDark: boolean;
  setTheme: (theme: ThemeSetting) => void;
  setFont: (font: FontSetting) => void;
  setReduceMotion: (on: boolean) => void;
}

const PrefsContext = createContext<Prefs | null>(null);

export function usePrefs(): Prefs {
  const prefs = useContext(PrefsContext);
  if (!prefs) throw new Error("usePrefs must be used inside AppShell");
  return prefs;
}

function readPref<T extends string>(key: string, fallback: T): T {
  try {
    return (window.localStorage.getItem(key) as T) || fallback;
  } catch {
    return fallback;
  }
}

function writePref(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* trình duyệt chặn lưu trữ: vẫn chạy với giá trị trong bộ nhớ */
  }
}

const NAV = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { href: "/create", label: "Tạo lộ trình", icon: Sparkles, match: (p: string) => p.startsWith("/create") },
  { href: "/courses", label: "Khóa học", icon: BookOpen, match: (p: string) => p.startsWith("/courses") },
  { href: "/history", label: "Lịch sử kiểm tra", icon: ClipboardCheck, match: (p: string) => p.startsWith("/history") },
  { href: "/videos", label: "Video", icon: Clapperboard, match: (p: string) => p.startsWith("/videos") },
];

const CRUMBS: Array<[string, string]> = [
  ["/create", "Tạo lộ trình"],
  ["/courses/view", "Khóa học"],
  ["/courses", "Khóa học"],
  ["/history", "Lịch sử kiểm tra"],
  ["/videos", "Video"],
  ["/settings", "Cài đặt"],
];

export function AppShell({ children }: { children: ReactNode }) {
  const rawPath = usePathname() || "/";
  const path = rawPath.replace(/\.html$/, "").replace(/\/$/, "") || "/";
  const [theme, setThemeState] = useState<ThemeSetting>("system");
  const [font, setFontState] = useState<FontSetting>("md");
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [systemDark, setSystemDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Đọc tuỳ chọn đã lưu sau khi gắn vào trang (bản build tĩnh không có localStorage lúc dựng HTML),
  // nên phải đặt state trong effect để không lệch HTML khi hydrate.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(readPref<ThemeSetting>("nl-theme", "system"));
    setFontState(readPref<FontSetting>("nl-font", "md"));
    setReduceMotionState(readPref<string>("nl-rm", "0") === "1");
    setCollapsed(readPref<string>("nl-side", "open") === "collapsed");
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark-root", isDark);
  }, [isDark]);

  const setTheme = useCallback((value: ThemeSetting) => {
    setThemeState(value);
    writePref("nl-theme", value);
  }, []);
  const setFont = useCallback((value: FontSetting) => {
    setFontState(value);
    writePref("nl-font", value);
  }, []);
  const setReduceMotion = useCallback((on: boolean) => {
    setReduceMotionState(on);
    writePref("nl-rm", on ? "1" : "0");
  }, []);
  const toggleSide = () => {
    setCollapsed((value) => {
      writePref("nl-side", value ? "open" : "collapsed");
      return !value;
    });
  };

  const prefs = useMemo<Prefs>(
    () => ({ theme, font, reduceMotion, isDark, setTheme, setFont, setReduceMotion }),
    [theme, font, reduceMotion, isDark, setTheme, setFont, setReduceMotion]
  );

  const crumb = path === "/" ? "Tổng quan" : CRUMBS.find(([prefix]) => path.startsWith(prefix))?.[1] ?? "NewLearn";
  const rootCls = ["nl", isDark ? "dark" : "", font === "lg" ? "lg" : "", reduceMotion ? "rm" : ""].join(" ");

  return (
    <PrefsContext.Provider value={prefs}>
      <div className={rootCls} style={{ display: "flex", alignItems: "stretch" }}>
        <a href="#noi-dung" className="skip">Bỏ qua, tới nội dung chính</a>

        <aside
          className={`sidebar t ${collapsed ? "collapsed" : ""}`}
          style={{
            flex: "0 0 auto",
            width: collapsed ? 72 : 240,
            minHeight: "100vh",
            position: "sticky",
            top: 0,
            alignSelf: "flex-start",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "16px 12px",
            background: "var(--surface)",
            borderRight: "1px solid var(--border)",
          }}
        >
          <Link href="/" className="row-btn" aria-label="NewLearn, về Tổng quan" style={{ padding: 4, width: "auto", gap: 10, marginBottom: 16 }}>
            <Logo size={32} />
            <span className="lbl" style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-.01em" }}>NewLearn</span>
          </Link>
          <nav aria-label="Điều hướng chính" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map(({ href, label, icon: Icon, match }) => (
              <Link key={href} href={href} className={`nav t ${match(path) ? "on" : ""}`} aria-current={match(path) ? "page" : undefined} title={collapsed ? label : undefined}>
                <Icon aria-hidden />
                <span className="lbl">{label}</span>
              </Link>
            ))}
          </nav>
          <div style={{ flex: 1 }} />
          <StreakMini />
          <Link href="/settings" className={`nav t ${path.startsWith("/settings") ? "on" : ""}`} title={collapsed ? "Cài đặt" : undefined}>
            <Settings aria-hidden />
            <span className="lbl">Cài đặt</span>
          </Link>
          <button type="button" className="nav t" onClick={toggleSide} aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"} aria-expanded={!collapsed}>
            {collapsed ? <ChevronsRight aria-hidden /> : <ChevronsLeft aria-hidden />}
            <span className="lbl">Thu gọn</span>
          </button>
        </aside>

        <main style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              minHeight: 64,
              padding: "12px 32px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface)",
              position: "sticky",
              top: 0,
              zIndex: 20,
            }}
          >
            <nav aria-label="Vị trí" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, minWidth: 0 }}>
              <span className="muted">NewLearn</span>
              <span className="muted" aria-hidden>/</span>
              <span style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{crumb}</span>
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!path.startsWith("/create") && (
                <Link href="/create" className="btn btn-p btn-sm t">
                  <Plus aria-hidden />
                  Tạo lộ trình
                </Link>
              )}
              <button type="button" className="icon-btn t" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}>
                {isDark ? <Sun aria-hidden /> : <Moon aria-hidden />}
              </button>
            </div>
          </header>
          <div id="noi-dung" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {children}
          </div>
        </main>

        <nav
          className="bottomnav"
          aria-label="Điều hướng chính"
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 30,
            justifyContent: "space-around",
            padding: "6px 4px calc(6px + env(safe-area-inset-bottom))",
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
          }}
        >
          {NAV.map(({ href, label, icon: Icon, match }) => (
            <Link
              key={href}
              href={href}
              aria-current={match(path) ? "page" : undefined}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                minWidth: 60,
                padding: "6px 4px",
                borderRadius: 10,
                fontSize: 11,
                fontWeight: match(path) ? 600 : 500,
                color: match(path) ? "var(--primary)" : "var(--muted)",
                textDecoration: "none",
              }}
            >
              <Icon aria-hidden style={{ width: 22, height: 22 }} />
              {label === "Lịch sử kiểm tra" ? "Kiểm tra" : label}
            </Link>
          ))}
        </nav>
      </div>
    </PrefsContext.Provider>
  );
}

function StreakMini() {
  const [streak, setStreak] = useState<number | null>(null);
  const path = usePathname();
  useEffect(() => {
    let alive = true;
    import("../../lib/api-client")
      .then(({ learningApi }) => learningApi.overview())
      .then((data) => alive && setStreak(data.stats.streak_days))
      .catch(() => alive && setStreak(null));
    return () => {
      alive = false;
    };
  }, [path]);
  if (!streak) return null;
  return (
    <div className="lbl" style={{ margin: "0 4px 12px", padding: 12, borderRadius: 12, background: "var(--surface2)", display: "flex", gap: 10, alignItems: "center" }}>
      <Flame aria-hidden style={{ width: 20, height: 20, color: "var(--cite-fg)", flex: "none" }} />
      <div style={{ fontSize: 13, lineHeight: 1.35 }}>
        <strong>Chuỗi {streak} ngày</strong>
        <br />
        <span className="muted">Giữ nhịp mỗi ngày</span>
      </div>
    </div>
  );
}

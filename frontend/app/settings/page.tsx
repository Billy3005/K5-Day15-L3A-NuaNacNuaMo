"use client";

import { PageTitle } from "../../components/nl/ui";
import { usePrefs, type FontSetting, type ThemeSetting } from "../../components/shell/AppShell";
import { USE_FIXTURE } from "../../lib/config";

export default function SettingsPage() {
  const { theme, font, reduceMotion, setTheme, setFont, setReduceMotion } = usePrefs();
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <PageTitle eyebrow="Cài đặt" title="Cài đặt" desc="Tùy chỉnh cách NewLearn hiển thị trên máy này." />
      <section className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="field">
          <span className="lab" id="s-theme">Giao diện</span>
          <div className="seg s3" role="group" aria-labelledby="s-theme">
            {([["light", "Sáng"], ["dark", "Tối"], ["system", "Theo hệ thống"]] as Array<[ThemeSetting, string]>).map(([v, l]) => (
              <button key={v} type="button" className={`t ${theme === v ? "on" : ""}`} aria-pressed={theme === v} onClick={() => setTheme(v)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="lab" id="s-font">Cỡ chữ bài đọc</span>
          <div className="seg s2" role="group" aria-labelledby="s-font">
            {([["md", "Vừa"], ["lg", "Lớn"]] as Array<[FontSetting, string]>).map(([v, l]) => (
              <button key={v} type="button" className={`t ${font === v ? "on" : ""}`} aria-pressed={font === v} onClick={() => setFont(v)}>{l}</button>
            ))}
          </div>
        </div>
        <label style={{ display: "flex", gap: 12, alignItems: "center", fontWeight: 600, fontSize: 14 }}>
          <input type="checkbox" className="chk" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} />
          Giảm chuyển động
        </label>
      </section>
      <section className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8, boxShadow: "none" }}>
        <h2 className="h3">Về NewLearn</h2>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>Lộ trình tự học, mỗi ý đều có nguồn. Khóa học, tiến độ, kết quả kiểm tra và video được lưu trên máy chủ cục bộ chạy bằng <span className="mono">python run.py</span>.</p>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>Chế độ tạo khóa: {USE_FIXTURE ? "dữ liệu mẫu (không gọi AI)" : "AI thật, tìm nguồn trên web"}. Video phát trên trình duyệt bằng slide và giọng đọc tiếng Việt của máy.</p>
      </section>
    </div>
  );
}

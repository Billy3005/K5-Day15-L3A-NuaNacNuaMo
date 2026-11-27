"""So sánh model soạn bài mà GIỮ NGUYÊN model tìm kiếm — file của nhóm, không phải khung.

Vì sao cần: các dòng `gpt-5.4-mini` / `gpt-5.4` trong `cost/simulate-N-summary.md` là "nếu MỌI token tính giá
model này" — tức áp giá OpenAI lên cả token của Claude `web_search`. Kịch bản thật khi đổi model soạn bài là:
token của model tìm kiếm vẫn tính giá model tìm kiếm, chỉ token của model soạn bài đổi sang giá mới.

Script đọc cột `tokens_by_model` (token đo được theo từng model) của `cost/simulate-N.csv`, lấy giá + persona +
số người dùng trong `cost/personas.yaml` (cùng bộ đọc với khung), rồi in bảng cùng công thức với khung:

  python3 cost/writer_swap.py cost/simulate-N.csv --rate 0.8
  python3 cost/writer_swap.py cost/simulate-N.csv --search-model claude-haiku-5-5 --writers gpt-5.4-mini gpt-5.4

Chưa gồm phí công cụ `web_search` ($0.01 / lượt) — cộng riêng như ghi chú trong cost/cost-estimate.md.
Giả định: model soạn bài mới dùng cùng số token đo trên model đang chạy (bộ tách token khác có thể lệch).
"""

import argparse
import csv
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import simulate as sim  # noqa: E402  (dùng lại load_config, money, SCENARIOS của khung — không sửa khung)


def load_rows(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        rows = [r for r in csv.DictReader(f) if not r.get("error")]
    for r in rows:
        r["by_model"] = json.loads(r.get("tokens_by_model") or "{}")
    return rows


def session_cost(row, prices, search_model, writer_price):
    """Token của model tìm kiếm tính giá model tìm kiếm; mọi model khác coi là model soạn bài, tính giá writer_price."""
    total = 0.0
    for model, t in row["by_model"].items():
        pr = prices[search_model] if model.strip().lower() == search_model else writer_price
        total += (t["in"] * pr["input"] + t["out"] * pr["output"]) / 1e6
    return total


def table(rows, cfg, search_model, writers, rate):
    prices = {p["model"].strip().lower(): p for p in cfg["prices"]}
    missing = [m for m in [search_model, *writers] if m not in prices]
    if missing:
        sys.exit("Thiếu giá của %s trong cost/personas.yaml." % ", ".join(missing))
    if not rows:
        sys.exit("Không có phiên nào không lỗi trong file mô phỏng.")
    share = {p["name"]: p["share"] / cfg["total_share"] for p in cfg["personas"]}
    per = {p["name"]: [r for r in rows if r["persona"] == p["name"]] for p in cfg["personas"]}
    turns = sum(int(r["turns"]) for r in rows) / len(rows)
    fx = cfg["fx_rate"]

    out = ["| Kịch bản (giữ %s cho tìm kiếm) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | %s | Chi phí / người / tháng (cơ sở) |"
           % (search_model, " | ".join("Chi phí / tháng — %s (%s người)" % (sim.SCENARIO_VI[k], format(cfg["users"][k], ",").replace(",", "."))
                                       for k in sim.SCENARIOS)),
           "|---|" + "---:|" * (4 + len(sim.SCENARIOS))]
    for w in writers:
        def cost(r, w=w):
            return session_cost(r, prices, search_model, prices[w])
        per_session = sum(cost(r) for r in rows) / len(rows)
        per_task = per_session / rate if rate else None
        per_q = per_session / turns / rate if rate and turns else None
        persona_cost = {n: (sum(cost(r) for r in s) / len(s) if s else per_session) for n, s in per.items()}
        monthly = {k: sum(cfg["users"][k] * share[p["name"]] * p["uses_per_month"] * persona_cost[p["name"]]
                          for p in cfg["personas"]) for k in sim.SCENARIOS}
        per_user = monthly["base"] / cfg["users"]["base"] if cfg["users"]["base"] else None
        out.append("| %s soạn bài + %s tìm kiếm | %s | %s | %s | %s | %s |" % (
            w, search_model, sim.money(per_session, fx), sim.money(per_task, fx), sim.money(per_q, fx),
            " | ".join(sim.money(monthly[k], fx) for k in sim.SCENARIOS), sim.money(per_user, fx)))
    out.append("")
    out.append("- Token đo theo từng model trong `tokens_by_model`; chỉ token của model soạn bài đổi giá. "
               "Chưa gồm phí `web_search` $0.01 / lượt.")
    return out


def main(argv):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("csv", help="cost/simulate-N.csv")
    ap.add_argument("--search-model", default="claude-haiku-5-5")
    ap.add_argument("--writers", nargs="+", default=["gpt-5.4-nano", "gpt-5.4-mini", "gpt-5.4"])
    ap.add_argument("--rate", type=float, default=None, help="tỉ lệ đạt 0..1 từ lượt eval đã chấm (bỏ trống thì không tính cột / task)")
    args = ap.parse_args(argv)
    cfg, _warn = sim.load_config()
    rows = load_rows(args.csv)
    print("\n".join(table(rows, cfg, args.search_model.lower(), [w.lower() for w in args.writers], args.rate)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

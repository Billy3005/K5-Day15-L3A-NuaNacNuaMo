"""DAO-09/DAO-10: cost/writer_swap.py giữ giá model tìm kiếm và cộng phí web_search thực đo từ trace."""

import csv
import json
from pathlib import Path
import sys

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "cost"))

import writer_swap as ws  # noqa: E402

COLS = ["run_id", "session", "persona", "turns", "inputs", "model", "model_calls", "tool_calls",
        "tokens_in", "tokens_out", "latency_s", "error", "tokens_by_model"]


def _write_sim(tmp_path):
    """2 phiên giả lập: S001 hai lượt hỏi (3 + 2 lượt tìm), S002 một lượt hỏi (1 lượt tìm), S003 lỗi."""
    by_model = {"claude-haiku-5-5": {"in": 1_000_000, "out": 0}, "gpt-5.4-nano": {"in": 0, "out": 1_000_000}}
    rows = [
        {"session": "S001", "persona": "dung_vua", "turns": 2, "error": ""},
        {"session": "S002", "persona": "dung_it", "turns": 1, "error": ""},
        {"session": "S003", "persona": "dung_it", "turns": 1, "error": "T1 boom"},
    ]
    csv_path = tmp_path / "simulate-7.csv"
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, COLS)
        w.writeheader()
        for r in rows:
            w.writerow(dict({c: "" for c in COLS}, **r, tokens_by_model=json.dumps(by_model)))
    trace = tmp_path / "simulate-7.jsonl"
    events = [
        {"case": "S001-T1", "kind": "note", "text": "web_search: 3 lượt tìm, 4 nguồn được trích, giữ 4"},
        {"case": "S001-T1", "kind": "model", "model": "claude-haiku-5-5"},
        {"case": "S001-T2", "kind": "note", "text": "web_search: 2 lượt tìm, 2 nguồn được trích, giữ 2"},
        {"case": "S002-T1", "kind": "note", "text": "web_search: 1 lượt tìm, 1 nguồn được trích, giữ 1"},
        {"case": "S003-T1", "kind": "note", "text": "web_search: 3 lượt tìm, 0 nguồn được trích, giữ 0"},
    ]
    trace.write_text("\n".join(json.dumps(e, ensure_ascii=False) for e in events) + "\n", encoding="utf-8")
    return csv_path, trace


def test_searches_counted_per_session(tmp_path):
    _, trace = _write_sim(tmp_path)
    assert ws.searches_by_session(trace) == {"S001": 5, "S002": 1, "S003": 3}


def test_default_trace_path_matches_csv_name():
    assert ws.default_trace_path("cost/simulate-4.csv") == str(ROOT / "traces" / "simulate-4.jsonl")


def test_session_cost_adds_search_fee_and_keeps_search_model_price(tmp_path):
    csv_path, trace = _write_sim(tmp_path)
    rows = ws.attach_search_fees(ws.load_rows(csv_path), ws.searches_by_session(trace), 0.01)
    assert [r["session"] for r in rows] == ["S001", "S002"]  # phiên lỗi bị loại
    prices = {"claude-haiku-5-5": {"input": 0.10, "output": 0.50}, "gpt-5.4-nano": {"input": 0.20, "output": 1.25},
              "gpt-5.4": {"input": 2.50, "output": 15.00}}
    s001 = rows[0]
    # 1M token vào Haiku ($0.10) + 1M token ra writer + 5 lượt tìm × $0.01
    assert ws.session_cost(s001, prices, "claude-haiku-5-5", prices["gpt-5.4-nano"]) == pytest.approx(0.10 + 1.25 + 0.05)
    assert ws.session_cost(s001, prices, "claude-haiku-5-5", prices["gpt-5.4"]) == pytest.approx(0.10 + 15.00 + 0.05)


def test_cli_reports_fee_note(tmp_path, capsys):
    csv_path, trace = _write_sim(tmp_path)
    assert ws.main([str(csv_path), "--trace", str(trace), "--rate", "0.5"]) == 0
    out = capsys.readouterr().out
    assert "trung bình 3.00 lượt tìm / phiên" in out
    assert "gpt-5.4-nano soạn bài + claude-haiku-5-5 tìm kiếm" in out


def test_cli_without_trace_warns_and_skips_fee(tmp_path, capsys):
    csv_path, trace = _write_sim(tmp_path)
    trace.unlink()
    assert ws.main([str(csv_path), "--trace", str(trace)]) == 0
    captured = capsys.readouterr()
    assert "chưa cộng phí web_search" in captured.err
    assert "Chưa gồm phí `web_search`" in captured.out


def test_cli_rejects_percent_rate(tmp_path):
    csv_path, _ = _write_sim(tmp_path)
    with pytest.raises(SystemExit):
        ws.main([str(csv_path), "--rate", "80"])

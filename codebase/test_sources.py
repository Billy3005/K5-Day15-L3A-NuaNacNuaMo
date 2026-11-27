"""Kiểm sources.py (AN-05) bằng dữ liệu không cần mạng.

    python -m unittest discover -s codebase -p "test_*.py"

Ba đoạn W1–W3 chép từ lượt tìm thật ngày 27/11/2026 (truy vấn SQL nhập môn, claude-haiku-5-5).
"""
import unittest

from sources import clean_excerpt, excerpt_problem, normalize_sources, normalize_url, sufficiency

W1 = {"title": "SELECT Statement: How to Select Specific Values - SQLCourse",
      "url": "https://www.sqlcourse.com/beginner-course/selecting-data/",
      "excerpts": ["- Beginner Course - Advanced Course - Links & Resources Search Logo Logo - Beginner Course "
                   "Beginner Course Here is the format of a simple select..."]}
W2 = {"title": "Nhập môn SQL: câu lệnh SELECT, WHERE và ORDER BY cho người mới bắt đầu",
      "url": "https://fit.neu.edu.vn/post/nhap-mon-sql-cau-lenh-select-where-va-order-by-cho-nguoi-moi-bat-dau",
      "excerpts": ["Thứ hai, WHERE chạy trước SELECT, nên trong chuẩn SQL không dùng được tên cột mới đặt bằng AS "
                   "bên trong WHERE (SQLite nới lỏng quy tắc này nhưng nhiều..."]}
W3 = {"title": "SQL examples for beginners: SQL SELECT statement usage",
      "url": "https://www.sqlshack.com/sql-examples-for-beginners-sql-select-statement-usage/",
      "excerpts": ["If we want to filter the result set of the SQL SELECT statement, "
                   "**we have to use the WHERE clause**."]}


class NormalizeUrl(unittest.TestCase):
    def test_strips_tracking_fragment_and_slash(self):
        self.assertEqual(normalize_url("HTTPS://Docs.Example.COM/a/b/?utm_source=x&page=2#top"),
                         "https://docs.example.com/a/b?page=2")

    def test_rejects_non_http(self):
        for url in ("javascript:alert(1)", "ftp://example.com/x", "", "not a url"):
            self.assertIsNone(normalize_url(url), url)

    def test_bad_port_rejected_not_raised(self):
        for url in ("https://example.com:99999/x", "http://example.com:abc/"):
            self.assertIsNone(normalize_url(url), url)
        self.assertEqual(normalize_url("https://Example.com:8443/a/"), "https://example.com:8443/a")


class Excerpts(unittest.TestCase):
    def test_real_menu_excerpt_rejected(self):
        self.assertEqual(excerpt_problem(clean_excerpt(W1["excerpts"][0])), "giống chữ menu")

    def test_real_content_excerpts_kept(self):
        for item in (W2, W3):
            self.assertIsNone(excerpt_problem(clean_excerpt(item["excerpts"][0])), item["url"])

    def test_single_ui_word_in_real_lesson_is_kept(self):
        text = "Open the File menu, choose Save As and pick the CSV format to export your expense table."
        self.assertIsNone(excerpt_problem(text))

    def test_markdown_removed_and_long_text_cut_at_sentence(self):
        self.assertNotIn("**", clean_excerpt(W3["excerpts"][0]))
        self.assertEqual(clean_excerpt("giúp bạn đọc *hiểu* đúng"), "giúp bạn đọc hiểu đúng")
        self.assertEqual(clean_excerpt("SELECT * FROM orders WHERE a * b > 2"), "SELECT * FROM orders WHERE a * b > 2")
        long = "SELECT reads rows from a table. " * 20
        cut = clean_excerpt(long)
        self.assertLessEqual(len(cut), 300)
        self.assertTrue(cut.endswith("."))


class NormalizeSources(unittest.TestCase):
    def test_real_search_drops_menu_and_renumbers(self):
        sources, dropped = normalize_sources([W1, W2, W3])
        self.assertEqual([s["id"] for s in sources], ["S1", "S2"])
        self.assertEqual([s["url"] for s in sources], [normalize_url(W2["url"]), normalize_url(W3["url"])])
        self.assertEqual(len(dropped), 1)
        self.assertIn("sqlcourse.com", dropped[0])

    def test_matches_openapi_source_schema(self):
        sources, _ = normalize_sources([W2, W3])
        for s in sources:
            self.assertEqual(set(s), {"id", "title", "url", "excerpt"})
            self.assertTrue(all(s[k] for k in s))
            self.assertRegex(s["url"], r"^https?://")

    def test_picks_usable_excerpt_and_dedupes_same_page(self):
        page = dict(W1, excerpts=W1["excerpts"] + ["Here is the format of a simple select statement: "
                                                  "select column1 from table where condition."])
        dup = dict(W1, url=W1["url"] + "?utm_campaign=x#intro")
        sources, _ = normalize_sources([page, dup])
        self.assertEqual(len(sources), 1)
        self.assertTrue(sources[0]["excerpt"].startswith("Here is the format"))

    def test_bad_port_url_dropped_without_stopping_others(self):
        sources, dropped = normalize_sources([dict(W3, url="https://www.sqlshack.com:99999/x"), W2])
        self.assertEqual([s["url"] for s in sources], [normalize_url(W2["url"])])
        self.assertIn("URL không hợp lệ", dropped[0])

    def test_displayed_excerpt_keeps_code_syntax(self):
        code = ("In Python, 2 ** 3 evaluates to 8 and SELECT * FROM t returns every column of the table t, "
                "so **kwargs keeps its stars.")
        sources, _ = normalize_sources([{"title": "Python operators", "url": "https://docs.python.org/3/x",
                                         "excerpts": [code]}, W3])
        self.assertEqual(sources[0]["excerpt"], code)
        self.assertIn("**we have to use the WHERE clause**", sources[1]["excerpt"])

    def test_caps_number_of_sources(self):
        many = [dict(W3, url=f"https://example.com/p{i}") for i in range(8)]
        sources, _ = normalize_sources(many, max_sources=5)
        self.assertEqual([s["id"] for s in sources], ["S1", "S2", "S3", "S4", "S5"])


class Insufficient(unittest.TestCase):
    def test_only_unusable_sources_means_insufficient(self):
        bad = [W1, {"title": "x", "url": "https://example.com/a", "excerpts": ["Quá ngắn."]},
               {"title": "y", "url": "javascript:void(0)", "excerpts": W3["excerpts"]}]
        sources, dropped = normalize_sources(bad)
        self.assertEqual(sources, [])
        self.assertEqual(len(dropped), 3)
        self.assertIn("Chưa tìm được nguồn", sufficiency(sources))

    def test_enough_sources(self):
        self.assertIsNone(sufficiency(normalize_sources([W2])[0]))


if __name__ == "__main__":
    unittest.main()

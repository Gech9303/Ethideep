import sqlite3
from datetime import datetime

DB_NAME = "ethioshield.db"

def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            result_type TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            reason TEXT,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

def save_scan(text: str, result_type: str):
    conn = get_connection()
    conn.execute(
        "INSERT INTO scans (text, result_type, created_at) VALUES (?, ?, ?)",
        (text, result_type, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

def save_report(text: str, reason: str):
    conn = get_connection()
    conn.execute(
        "INSERT INTO reports (text, reason, created_at) VALUES (?, ?, ?)",
        (text, reason, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

def get_stats():
    conn = get_connection()
    scanned = conn.execute("SELECT COUNT(*) FROM scans").fetchone()[0]
    blocked = conn.execute("SELECT COUNT(*) FROM scans WHERE result_type = 'scan'").fetchone()[0]
    reports = conn.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
    conn.close()
    return {
        "scanned": scanned,
        "blocked": blocked,
        "reports": reports
    }

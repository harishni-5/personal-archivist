import os
import mysql.connector
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def get_conn():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", "harishni"),
        database=os.environ.get("DB_NAME", "booktracker")
    )

def load():
    return None

def save(store):
    pass

# ── USERS ─────────────────────────────────────────────────────────────────────

def get_user_by_email(email: str):
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    row = cursor.fetchone()
    cursor.close(); conn.close()
    return row

def get_user_by_id(user_id: int):
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username, email, created_at FROM users WHERE id=%s", (user_id,))
    row = cursor.fetchone()
    cursor.close(); conn.close()
    return row

def create_user(username: str, email: str, password_hash: str):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
        (username, email, password_hash)
    )
    conn.commit()
    user_id = cursor.lastrowid
    cursor.close(); conn.close()
    return user_id

# ── BOOKS (all scoped to user_id) ─────────────────────────────────────────────

def get_book(store, isbn: str, user_id: int):
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM books WHERE isbn=%s AND user_id=%s", (isbn, user_id))
    row = cursor.fetchone()
    cursor.close(); conn.close()
    return row

def put_book(store, isbn: str, book: dict, user_id: int):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO books (isbn, title, pages, year, genre, publisher, status, favourite, rating, user_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE
            title=VALUES(title), pages=VALUES(pages), year=VALUES(year),
            genre=VALUES(genre), publisher=VALUES(publisher),
            status=VALUES(status), favourite=VALUES(favourite), rating=VALUES(rating)
    """, (
        isbn, book.get("title"), book.get("pages"), book.get("year"),
        book.get("genre"), book.get("publisher"), book.get("status", "available"),
        book.get("favourite", False), book.get("rating"), user_id
    ))
    conn.commit()
    cursor.close(); conn.close()

def delete_book(store, isbn: str, user_id: int):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM books WHERE isbn=%s AND user_id=%s", (isbn, user_id))
    conn.commit()
    deleted = cursor.rowcount > 0
    cursor.close(); conn.close()
    return deleted

def list_books(user_id: int):
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM books WHERE user_id=%s", (user_id,))
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    return [(row["isbn"], row) for row in rows]

def log_activity(store, action: str, detail: str, user_id: int, isbn: str = None):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO activity_log (action, detail, isbn, user_id, timestamp)
        VALUES (%s,%s,%s,%s,%s)
    """, (action, detail[:255], isbn, user_id, datetime.now()))
    conn.commit()
    cursor.close(); conn.close()

def compute_stats(store, user_id: int):
    conn = get_conn()
    cursor = conn.cursor()
    def count(q, params=()):
        cursor.execute(q, params)
        return cursor.fetchone()[0]
    stats = {
        "books_owned":       count("SELECT COUNT(*) FROM books WHERE user_id=%s", (user_id,)),
        "books_read":        count("SELECT COUNT(*) FROM books WHERE user_id=%s AND status='read'", (user_id,)),
        "currently_reading": count("SELECT COUNT(*) FROM books WHERE user_id=%s AND status='reading'", (user_id,)),
        "books_lent":        count("SELECT COUNT(*) FROM books WHERE user_id=%s AND status='lent'", (user_id,)),
        "books_available":   count("SELECT COUNT(*) FROM books WHERE user_id=%s AND status='available'", (user_id,)),
        "books_sold":        count("SELECT COUNT(*) FROM books WHERE user_id=%s AND status='sold'", (user_id,)),
        "favourites":        count("SELECT COUNT(*) FROM books WHERE user_id=%s AND favourite=1", (user_id,)),
    }
    cursor.close(); conn.close()
    return stats
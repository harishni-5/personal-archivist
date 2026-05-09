import mysql.connector
from datetime import datetime

def get_conn():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="harishni",   # change if your password is different
        database="booktracker"
    )

def load():
    return None

def save(store):
    pass

def get_book(store, isbn):
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM books WHERE isbn=%s", (isbn,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row

def put_book(store, isbn, book):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO books (isbn, title, pages, year, genre, publisher, status, favourite, rating)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE
            title=VALUES(title),
            pages=VALUES(pages),
            year=VALUES(year),
            genre=VALUES(genre),
            publisher=VALUES(publisher),
            status=VALUES(status),
            favourite=VALUES(favourite),
            rating=VALUES(rating)
    """, (
        isbn,
        book.get("title"),
        book.get("pages"),
        book.get("year"),
        book.get("genre"),
        book.get("publisher"),
        book.get("status", "available"),
        book.get("favourite", False),
        book.get("rating"),
    ))
    conn.commit()
    cursor.close()
    conn.close()

def delete_book(store, isbn):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM books WHERE isbn=%s", (isbn,))
    conn.commit()
    deleted = cursor.rowcount > 0
    cursor.close()
    conn.close()
    return deleted

def list_books():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM books")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [(row["isbn"], row) for row in rows]

def log_activity(store, action, detail, isbn=None):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO activity_log (action, detail, isbn, timestamp)
        VALUES (%s, %s, %s, %s)
    """, (action, detail[:255], isbn, datetime.now()))
    conn.commit()
    cursor.close()
    conn.close()

def compute_stats(store):
    conn = get_conn()
    cursor = conn.cursor()
    def count(query):
        cursor.execute(query)
        return cursor.fetchone()[0]
    stats = {
        "books_owned": count("SELECT COUNT(*) FROM books"),
        "books_read": count("SELECT COUNT(*) FROM books WHERE status='read'"),
        "currently_reading": count("SELECT COUNT(*) FROM books WHERE status='reading'"),
        "books_lent": count("SELECT COUNT(*) FROM books WHERE status='lent'"),
        "books_available": count("SELECT COUNT(*) FROM books WHERE status='available'"),
        "books_sold": count("SELECT COUNT(*) FROM books WHERE status='sold'"),
        "favourites": count("SELECT COUNT(*) FROM books WHERE favourite=1"),
    }
    cursor.close()
    conn.close()
    return stats

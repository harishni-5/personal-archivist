import os
from datetime import datetime, timezone
from typing import Optional
from dotenv import load_dotenv
from simple_salesforce import Salesforce
from simple_salesforce.exceptions import SalesforceResourceNotFound

load_dotenv()

_sf = None

def _connect():
    global _sf
    if _sf is None:
        _sf = Salesforce(
            username=os.environ["SF_USERNAME"],
            password=os.environ["SF_PASSWORD"],
            security_token=os.environ.get("SF_TOKEN", ""),
            domain=os.environ.get("SF_DOMAIN", "login"),
        )
    return _sf

def load():
    return _connect()

def save(store):
    pass

_BOOK_FIELDS = (
    "Id, Name, ISBN__c, Pages__c, Year__c, Genre__c, Publisher__c, "
    "Status__c, Format__c, Description__c, Rating__c, Thoughts__c, "
    "Date_Added__c, Date_Read__c, Sale_Price__c, Sale_Date__c, Borrower__c, Due_Date__c"
)

def _sf_to_book(rec):
    lending = None
    if rec.get("Borrower__c"):
        lending = {"borrower": rec["Borrower__c"], "due_date": rec.get("Due_Date__c") or ""}
    return {
        "title": rec.get("Name") or "",
        "pages": int(rec.get("Pages__c") or 0),
        "year": int(rec.get("Year__c") or 0),
        "genre": rec.get("Genre__c") or "",
        "publisher": rec.get("Publisher__c") or "",
        "status": rec.get("Status__c") or "available",
        "format": rec.get("Format__c") or "paperback",
        "description": rec.get("Description__c"),
        "rating": int(rec["Rating__c"]) if rec.get("Rating__c") is not None else None,
        "thoughts": rec.get("Thoughts__c"),
        "date_added": rec.get("Date_Added__c") or "",
        "date_read": rec.get("Date_Read__c"),
        "sale_price": float(rec["Sale_Price__c"]) if rec.get("Sale_Price__c") is not None else None,
        "sale_date": rec.get("Sale_Date__c"),
        "lending": lending,
    }

def _book_to_sf(isbn, book):
    data = {
        "Name": (book.get("title") or "")[:80],
        "Pages__c": book.get("pages") or None,
        "Year__c": book.get("year") or None,
        "Genre__c": book.get("genre") or None,
        "Publisher__c": book.get("publisher") or None,
        "Status__c": book.get("status") or "available",
        "Format__c": book.get("format") or "paperback",
        "Description__c": book.get("description"),
        "Rating__c": book.get("rating"),
        "Thoughts__c": book.get("thoughts"),
        "Date_Added__c": book.get("date_added") or None,
        "Date_Read__c": book.get("date_read"),
        "Sale_Price__c": book.get("sale_price"),
        "Sale_Date__c": book.get("sale_date"),
    }
    lending = book.get("lending")
    data["Borrower__c"] = lending["borrower"] if lending else None
    data["Due_Date__c"] = lending["due_date"] if lending else None
    return data

def get_book(store, isbn):
    sf = _connect()
    res = sf.query(f"SELECT {_BOOK_FIELDS} FROM Book__c WHERE ISBN__c = '{isbn}' LIMIT 1")
    if res["totalSize"] == 0:
        return None
    return _sf_to_book(res["records"][0])

def put_book(store, isbn, book):
    sf = _connect()
    data = _book_to_sf(isbn, book)
    sf.Book__c.upsert(f"ISBN__c/{isbn}", data)

def delete_book(store, isbn):
    sf = _connect()
    res = sf.query(f"SELECT Id FROM Book__c WHERE ISBN__c = '{isbn}' LIMIT 1")
    if res["totalSize"] == 0:
        return False
    sf.Book__c.delete(res["records"][0]["Id"])
    return True

def list_books():
    sf = _connect()
    res = sf.query(f"SELECT {_BOOK_FIELDS} FROM Book__c")
    return [(r["ISBN__c"], _sf_to_book(r)) for r in res["records"]]

def log_activity(store, action, detail, isbn=None):
    sf = _connect()
    sf.Activity_Entry__c.create({
        "Action__c": action,
        "Detail__c": detail[:255],
        "ISBN__c": isbn,
        "Timestamp__c": datetime.now(timezone.utc).isoformat(),
    })

def compute_stats(store):
    sf = _connect()
    def count(soql):
        return sf.query(soql)["totalSize"]
    return {
        "books_owned": count("SELECT Id FROM Book__c"),
        "books_read": count("SELECT Id FROM Book__c WHERE Date_Read__c != null"),
        "currently_reading": count("SELECT Id FROM Book__c WHERE Status__c = 'reading'"),
        "books_lent": count("SELECT Id FROM Book__c WHERE Status__c = 'lent'"),
        "books_available": count("SELECT Id FROM Book__c WHERE Status__c = 'available'"),
        "books_sold": count("SELECT Id FROM Book__c WHERE Status__c = 'sold'"),
    }
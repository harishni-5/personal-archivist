from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import store.mysql as store

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class BookIn(BaseModel):
    title: str
    isbn: str
    year: Optional[int] = None
    genre: Optional[str] = None
    publisher: Optional[str] = None
    pages: Optional[int] = None
    status: str = "available"

class BookUpdate(BaseModel):
    title: Optional[str] = None
    year: Optional[int] = None
    genre: Optional[str] = None
    publisher: Optional[str] = None
    pages: Optional[int] = None
    status: Optional[str] = None
    favourite: Optional[bool] = None
    rating: Optional[int] = None

@app.get("/api/books")
def list_books():
    books = store.list_books()
    return [{"isbn": isbn, **book} for isbn, book in books]

@app.post("/api/books", status_code=201)
def add_book(body: BookIn):
    db = store.load()
    book = {
        "title": body.title,
        "pages": body.pages or 0,
        "year": body.year or 0,
        "genre": body.genre or "",
        "publisher": body.publisher or "",
        "status": body.status,
        "favourite": False,
        "rating": None,
        "date_added": "",
    }
    store.put_book(db, body.isbn, book)
    store.log_activity(db, "added", f"Added '{body.title}'", isbn=body.isbn)
    return {"isbn": body.isbn, **book}

@app.put("/api/books/{isbn}")
def update_book(isbn: str, body: BookUpdate):
    db = store.load()
    existing = store.get_book(db, isbn)
    if not existing:
        raise HTTPException(status_code=404, detail="Book not found")
    # Merge updates onto existing record
    updated = {**existing}
    if body.title is not None: updated["title"] = body.title
    if body.year is not None: updated["year"] = body.year
    if body.genre is not None: updated["genre"] = body.genre
    if body.publisher is not None: updated["publisher"] = body.publisher
    if body.pages is not None: updated["pages"] = body.pages
    if body.status is not None: updated["status"] = body.status
    if body.favourite is not None: updated["favourite"] = body.favourite
    if body.rating is not None: updated["rating"] = body.rating
    store.put_book(db, isbn, updated)
    store.log_activity(db, "updated", f"Updated '{updated['title']}'", isbn=isbn)
    return {"isbn": isbn, **updated}

@app.delete("/api/books/{isbn}")
def delete_book(isbn: str):
    db = store.load()
    deleted = store.delete_book(db, isbn)
    if not deleted:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"ok": True}

@app.get("/api/stats")
def stats():
    db = store.load()
    return store.compute_stats(db)

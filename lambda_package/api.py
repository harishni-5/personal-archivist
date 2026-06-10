import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv
import httpx

import store.mysql as store

load_dotenv()

app = FastAPI()

FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://frontend-rho-neon-857v0mm3ho.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", FRONTEND_URL],
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY           = os.environ.get("JWT_SECRET", "change_this_in_production_please")
ALGORITHM            = "HS256"
TOKEN_EXPIRE_HOURS   = 24
GOOGLE_CLIENT_ID     = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI  = os.environ.get("GOOGLE_REDIRECT_URI", "https://saamcc5galfz3ikeb5betxza440yrmnh.lambda-url.us-east-1.on.aws/api/auth/google/callback")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer()

def hash_password(p): return pwd_context.hash(p)
def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)

def create_token(user_id: int, username: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": str(user_id), "username": username, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return {"id": int(payload["sub"]), "username": payload["username"]}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ── Models ────────────────────────────────────────────────────────────────────

class RegisterIn(BaseModel):
    username: str
    email: str
    password: str

class LoginIn(BaseModel):
    email: str
    password: str

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

# ── Manual Auth ───────────────────────────────────────────────────────────────

@app.post("/api/auth/register", status_code=201)
def register(body: RegisterIn):
    if store.get_user_by_email(body.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = store.create_user(body.username, body.email, hash_password(body.password))
    return {"token": create_token(user_id, body.username), "username": body.username, "id": user_id}

@app.post("/api/auth/login")
def login(body: LoginIn):
    user = store.get_user_by_email(body.email)
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"token": create_token(user["id"], user["username"]), "username": user["username"], "id": user["id"]}

@app.get("/api/auth/me")
def me(current_user: dict = Depends(get_current_user)):
    return store.get_user_by_id(current_user["id"])

# ── Google OAuth ──────────────────────────────────────────────────────────────

@app.get("/api/auth/google")
def google_login():
    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        "&response_type=code"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        "&scope=openid%20email%20profile"
    )
    return RedirectResponse(url)

@app.get("/api/auth/google/callback")
async def google_callback(code: str):
    async with httpx.AsyncClient() as client:
        token_res = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        tokens = token_res.json()
        userinfo = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"}
        )
        guser = userinfo.json()

    email = guser["email"]
    name  = guser.get("name", email.split("@")[0])
    user  = store.get_user_by_email(email)
    if not user:
        user_id = store.create_user(name, email, hash_password(os.urandom(32).hex()))
    else:
        user_id = user["id"]
        name    = user["username"]

    token = create_token(user_id, name)
    # Redirect to frontend — it reads ?token= from URL
    return RedirectResponse(f"{FRONTEND_URL}?token={token}&username={name}")

# ── Books ─────────────────────────────────────────────────────────────────────

@app.get("/api/books")
def list_books(current_user: dict = Depends(get_current_user)):
    books = store.list_books(current_user["id"])
    return [{"isbn": isbn, **book} for isbn, book in books]

@app.post("/api/books", status_code=201)
def add_book(body: BookIn, current_user: dict = Depends(get_current_user)):
    db = store.load()
    book = {
        "title": body.title, "pages": body.pages or 0, "year": body.year or 0,
        "genre": body.genre or "", "publisher": body.publisher or "",
        "status": body.status, "favourite": False, "rating": None,
    }
    store.put_book(db, body.isbn, book, current_user["id"])
    store.log_activity(db, "added", f"Added '{body.title}'", current_user["id"], isbn=body.isbn)
    return {"isbn": body.isbn, **book}

@app.put("/api/books/{isbn}")
def update_book(isbn: str, body: BookUpdate, current_user: dict = Depends(get_current_user)):
    db = store.load()
    existing = store.get_book(db, isbn, current_user["id"])
    if not existing:
        raise HTTPException(status_code=404, detail="Book not found")
    updated = {**existing}
    for field in ["title","year","genre","publisher","pages","status","favourite","rating"]:
        val = getattr(body, field)
        if val is not None: updated[field] = val
    store.put_book(db, isbn, updated, current_user["id"])
    store.log_activity(db, "updated", f"Updated '{updated['title']}'", current_user["id"], isbn=isbn)
    return {"isbn": isbn, **updated}

@app.delete("/api/books/{isbn}")
def delete_book(isbn: str, current_user: dict = Depends(get_current_user)):
    db = store.load()
    if not store.delete_book(db, isbn, current_user["id"]):
        raise HTTPException(status_code=404, detail="Book not found")
    return {"ok": True}

@app.get("/api/stats")
def stats(current_user: dict = Depends(get_current_user)):
    return store.compute_stats(store.load(), current_user["id"])





#lambda
from mangum import Mangum

handler = Mangum(app)
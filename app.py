import os
import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session, redirect, url_for

# Optional PostgreSQL driver for hosted cloud databases (Neon, Supabase, Vercel Postgres)
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = os.environ.get("SECRET_KEY", "sudais-cyber-portfolio-secret-2026")

# Admin credentials (configurable via environment variable or default)
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "sudais2026")

# Permanent hosted Database URL (Neon / Supabase / Vercel Postgres / Railway)
DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")

# Local fallback SQLite path
LOCAL_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "messages.db")


def is_postgres():
    """Check if PostgreSQL connection string is configured and driver is available."""
    return bool(DATABASE_URL and PSYCOPG2_AVAILABLE)


def get_sqlite_path():
    """Return SQLite path, safely using /tmp when deployed on serverless environments."""
    if os.environ.get("VERCEL"):
        return "/tmp/messages.db"
    return LOCAL_DB_PATH


def get_db_connection():
    """Create a new database connection for PostgreSQL or SQLite."""
    if is_postgres():
        dsn = DATABASE_URL
        # Normalize postgres:// scheme if provided by older platforms
        if dsn.startswith("postgres://"):
            dsn = "postgresql://" + dsn[len("postgres://"):]
        return psycopg2.connect(dsn)
    else:
        conn = sqlite3.connect(get_sqlite_path())
        conn.row_factory = sqlite3.Row
        return conn


def init_db():
    """Initialize the messages table in the active database."""
    try:
        if is_postgres():
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS messages (
                            id SERIAL PRIMARY KEY,
                            name TEXT NOT NULL,
                            email TEXT NOT NULL,
                            message TEXT NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    """)
                conn.commit()
            print("[DB] PostgreSQL initialized successfully.")
        else:
            with get_db_connection() as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL,
                        message TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                conn.commit()
            print(f"[DB] SQLite initialized successfully at {get_sqlite_path()}.")
    except Exception as e:
        print(f"[DB ERROR] Initialization error: {e}")


# Initialize DB schema on startup
init_db()


def save_message(name, email, message):
    """Save a contact message to the persistent database."""
    now = datetime.now()
    if is_postgres():
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO messages (name, email, message, created_at) VALUES (%s, %s, %s, %s)",
                    (name, email, message, now)
                )
            conn.commit()
    else:
        with get_db_connection() as conn:
            conn.execute(
                "INSERT INTO messages (name, email, message, created_at) VALUES (?, ?, ?, ?)",
                (name, email, message, now.strftime("%Y-%m-%d %H:%M:%S"))
            )
            conn.commit()


def get_all_messages():
    """Retrieve all contact messages ordered by most recent first."""
    messages = []
    if is_postgres():
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT id, name, email, message, created_at FROM messages ORDER BY id DESC")
                rows = cur.fetchall()
                for row in rows:
                    item = dict(row)
                    if hasattr(item.get("created_at"), "strftime"):
                        item["created_at"] = item["created_at"].strftime("%Y-%m-%d %H:%M:%S")
                    messages.append(item)
    else:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, email, message, created_at FROM messages ORDER BY id DESC")
            messages = [dict(row) for row in cursor.fetchall()]
    return messages


def delete_message_by_id(msg_id):
    """Delete a message from the persistent database."""
    if is_postgres():
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM messages WHERE id = %s", (msg_id,))
            conn.commit()
    else:
        with get_db_connection() as conn:
            conn.execute("DELETE FROM messages WHERE id = ?", (msg_id,))
            conn.commit()


# ──────────────────────────────────────────────
# PUBLIC ROUTES
# ──────────────────────────────────────────────

@app.route("/")
def index():
    """Render the portfolio homepage."""
    return render_template("index.html")


@app.route("/contact", methods=["POST"])
def contact():
    """Handle contact form submissions and persist them to PostgreSQL or SQLite."""
    try:
        data = request.get_json(force=True, silent=True) or {}

        name    = data.get("name", "").strip()
        email   = data.get("email", "").strip()
        message = data.get("message", "").strip()

        if not name or not email or not message:
            return jsonify({
                "success": False,
                "error": "Please provide your name, email, and message."
            }), 400

        # Save to permanent database
        save_message(name, email, message)

        # Log to server console
        print(f"\n[NEW PORTFOLIO MESSAGE] From: {name} <{email}>")
        print(f"Message: {message}\n")

        return jsonify({
            "success": True,
            "message": "Thank you! Your message has been received. I will get back to you shortly."
        }), 200

    except Exception as e:
        print(f"Error handling contact form: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error. Please email directly at sudaisbacha524@gmail.com"
        }), 500


# ──────────────────────────────────────────────
# ADMIN DASHBOARD ROUTES
# ──────────────────────────────────────────────

@app.route("/login", methods=["GET", "POST"])
def login():
    """Admin login page to access dashboard."""
    if session.get("is_admin"):
        return redirect(url_for("dashboard"))

    error = None
    if request.method == "POST":
        password = request.form.get("password", "").strip()
        if password == ADMIN_PASSWORD:
            session["is_admin"] = True
            return redirect(url_for("dashboard"))
        else:
            error = "Invalid admin password. Please try again."

    return render_template("login.html", error=error)


@app.route("/dashboard")
@app.route("/admin")
def dashboard():
    """Protected admin dashboard to view incoming contact messages."""
    if not session.get("is_admin"):
        return redirect(url_for("login"))

    try:
        messages = get_all_messages()
    except Exception as e:
        print(f"Error loading messages: {e}")
        messages = []

    db_type = "PostgreSQL (Cloud)" if is_postgres() else "SQLite (Local)"
    return render_template("dashboard.html", messages=messages, db_type=db_type)


@app.route("/dashboard/delete/<int:msg_id>", methods=["POST"])
def delete_message(msg_id):
    """Delete a contact message by ID."""
    if not session.get("is_admin"):
        return redirect(url_for("login"))

    try:
        delete_message_by_id(msg_id)
    except Exception as e:
        print(f"Error deleting message: {e}")

    return redirect(url_for("dashboard"))


@app.route("/logout")
def logout():
    """Log out from admin session."""
    session.pop("is_admin", None)
    return redirect(url_for("login"))


# ──────────────────────────────────────────────
# ENTRY POINT
# ──────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

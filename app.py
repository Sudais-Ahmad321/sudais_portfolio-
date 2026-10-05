import os
import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session, redirect, url_for

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = os.environ.get("SECRET_KEY", "sudais-cyber-portfolio-secret-2026")

# Admin credentials (configurable via environment variable or default)
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "sudais2026")

# Database path
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "messages.db")


def init_db():
    """Initialize the SQLite database for contact messages."""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
    except Exception as e:
        print(f"Database initialization error: {e}")


# Initialize DB on startup
init_db()


# ──────────────────────────────────────────────
# PUBLIC ROUTES
# ──────────────────────────────────────────────

@app.route("/")
def index():
    """Render the redesigned portfolio homepage."""
    return render_template("index.html")


@app.route("/contact", methods=["POST"])
def contact():
    """Handle contact form submissions and persist them to SQLite."""
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

        # Save to SQLite database
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO messages (name, email, message, created_at) VALUES (?, ?, ?, ?)",
                (name, email, message, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            )
            conn.commit()

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

    messages = []
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM messages ORDER BY id DESC")
            messages = [dict(row) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error loading messages: {e}")

    return render_template("dashboard.html", messages=messages)


@app.route("/dashboard/delete/<int:msg_id>", methods=["POST"])
def delete_message(msg_id):
    """Delete a contact message by ID."""
    if not session.get("is_admin"):
        return redirect(url_for("login"))

    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("DELETE FROM messages WHERE id = ?", (msg_id,))
            conn.commit()
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

import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__, static_folder="static", template_folder="templates")

# ──────────────────────────────────────────────
# DATABASE & EMAIL CONFIGURATION (Optional Env Vars)
# ──────────────────────────────────────────────
# To enable Supabase/PostgreSQL or transactional email via Resend/SendGrid,
# set these environment variables in Vercel or your .env file:
# RESEND_API_KEY = os.getenv("RESEND_API_KEY")
# SUPABASE_URL   = os.getenv("SUPABASE_URL")
# SUPABASE_KEY   = os.getenv("SUPABASE_KEY")

# ──────────────────────────────────────────────
# ROUTES
# ──────────────────────────────────────────────

@app.route("/")
def index():
    """Render the redesigned portfolio homepage."""
    return render_template("index.html")


@app.route("/contact", methods=["POST"])
def contact():
    """Handle contact form submissions."""
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

        # Log to server console
        print(f"\n[PORTFOLIO CONTACT] From: {name} <{email}>")
        print(f"Message: {message}\n")

        # ── Optional: Resend API integration ──
        # if resend_key:
        #     import resend
        #     resend.api_key = resend_key
        #     resend.Emails.send({
        #         "from": "portfolio@sudaisahmad.dev",
        #         "to": "sudaisbacha524@gmail.com",
        #         "subject": f"New Portfolio Message from {name}",
        #         "html": f"<p><strong>From:</strong> {name} ({email})</p><p>{message}</p>"
        #     })

        # ── Optional: SQLite backup logging ──
        # import sqlite3
        # with sqlite3.connect("messages.db") as conn:
        #     conn.execute("CREATE TABLE IF NOT EXISTS messages (name TEXT, email TEXT, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)")
        #     conn.execute("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)", (name, email, message))

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
# ENTRY POINT
# ──────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

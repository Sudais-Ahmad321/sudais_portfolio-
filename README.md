# Sudais Ahmad — Cybersecurity & Full-Stack Portfolio

Professional portfolio of **Sudais Ahmad**, BS Computer Science student (7th Semester) at Sarhad University of Sciences & Information Technology, Peshawar. Focused on **Cybersecurity, SOC Operations, and Full-Stack Web & Mobile App Development**.

![Portfolio Preview](/static/images/college_management.jpg)

---

## ⚡ What's New in this Redesign

1. **New Profile Presentation & Interactive 3D Frame**:
   - Replaced photo placeholder with verified user photo (`/static/images/profile.jpg`).
   - Dynamic rotating cyber conic-gradient border, tech HUD corner brackets, ambient pulse, and 3D perspective mouse tilt.
2. **React Bits `<ShapeGrid />` Integration**:
   - Integrated the moving canvas background with infinite smooth diagonal movement, dynamic hover trails, cell opacity fading, and radial vignette fade.
3. **Academic Status Updated to 7th Semester**:
   - Current semester updated across all headers, hero tags, metrics, and academic cards.
   - Comprehensive BS CS coursework list added (Networks, Microprocessors, Algorithms, OS, AI, ML, Web Dev).
4. **Career Roadmap & Focus Progression**:
   - Progression timeline: `Computer Science → Programming → Networking → Linux → InfoSec → Cybersecurity → SOC Operations → SOC Analyst`.
   - Clear distinction between Primary Focus (Cybersecurity / SOC) and Secondary Focus (Full-Stack Web & Mobile App).
5. **Currently Learning — OPSWAT Academy**:
   - Added in-progress certification: **OPSWAT Academy Cybersecurity Fundamentals Associate** (Started: October 2, 2026).
   - Highlighting the CIA Triad (Confidentiality, Integrity, Availability), Authorization, Non-Repudiation, and Network Security concepts.
   - Added verified Technical Training Certifications from Advanced Research Lab SUIT CS&IT (Firmware Programming, Web HMI Designing, 32-bit Multi-core Embedded Processor, Opto-electronic Devices) with an interactive lightbox modal.
6. **Featured & Complete Projects**:
   - **Local Blood Donor Finder (Mobile App)**: Flutter, Dart, Firebase Auth, Cloud Firestore, Google Maps API, Geolocator, GeoFlutterFire Plus.
   - **GDC Zarobi College Management System**: Flask, SQLite, multi-table database, session admin portal, ZAROBI-BOT AI assistant.
   - **Micro Threat Simulator**: Python, Flask, JS security prototype simulation platform.
   - **AI-Based Phishing Detection**: Cisco project exploring URL heuristics, email payloads, and detection models.
   - **Bus Reservation System**: Python algorithmic seat reservation.
   - **Ameer Traskon Restaurant Portal**: PHP, MySQL, XAMPP dynamic ordering system.
7. **Technical Skills Arsenal**:
   - Programming (Python, C++, JS, Dart), Web (Flask, React, PHP, Node/Express, HTML5/CSS3), Mobile (Flutter, Dart), Databases (MySQL, Cloud Firestore, Firebase, SQLite), Cybersecurity (InfoSec, Network Security, Linux, SOC concepts), Tools (Kali Linux, Wireshark, Nmap, Burp Suite, Git, GitHub).

---

## 📁 Project Structure

```
sudais_portfolio/
├── app.py                     # Flask application & /contact API endpoint
├── vercel.json                # Vercel deployment configuration (Python WSGI)
├── index.html                 # Root homepage (supports static GitHub Pages & Vercel static)
├── requirements.txt           # Python dependencies (Flask, Gunicorn)
├── Procfile                   # For Render / Railway deployment
├── runtime.txt                # Python runtime specification
├── templates/
│   ├── index.html             # Flask Jinja2 portfolio template
│   └── index_backup.html      # Original backup
└── static/
    ├── css/
    │   └── shapegrid.css      # ShapeGrid styles
    ├── js/
    │   └── shapegrid.js       # React Bits ShapeGrid Canvas engine
    └── images/
        ├── profile.jpg        # Profile portrait
        ├── certificates.png   # SUIT Technical Training Certificates
        ├── blood_donor_app.jpg
        ├── college_management.jpg
        ├── threat_simulator.jpg
        └── phishing_detection.jpg
```

---

## 🚀 Run Locally

```bash
# 1. Navigate to project directory
cd "sudais_portfolio"

# 2. (Optional) Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Start the server
python app.py
```

Then visit **http://127.0.0.1:5000** in your browser.

---

## ☁️ Deploy to GitHub & Vercel

### Step 1: Upload to GitHub

```bash
git init
git add .
git commit -m "Complete portfolio redesign with ShapeGrid, 7th sem, and new projects"
git branch -M main
git remote add origin https://github.com/Sudais-Ahmad321/<your-repo-name>.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [Vercel](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New"** → **"Project"**.
3. Import your `sudais_portfolio` repository.
4. Vercel automatically detects `vercel.json` and runs `app.py` as a serverless Python app.
5. Click **"Deploy"**! Your site is live with a secure HTTPS URL.

---

## 📬 Contact Information

- **Name:** Sudais Ahmad
- **Email:** [sudaisbacha524@gmail.com](mailto:sudaisbacha524@gmail.com)
- **GitHub:** [github.com/Sudais-Ahmad321](https://github.com/Sudais-Ahmad321)
- **LinkedIn:** [linkedin.com/in/sudais-ahmad-64b786347](https://www.linkedin.com/in/sudais-ahmad-64b786347)
- **WhatsApp:** [+92 319 9551429](https://wa.me/923199551429)
- **Location:** Peshawar, Khyber Pakhtunkhwa, Pakistan

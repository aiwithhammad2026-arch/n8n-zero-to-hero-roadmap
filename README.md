# n8n Zero to Hero Roadmap Dashboard

A modern, highly responsive, and premium interactive learning dashboard dynamically parsed from the n8n roadmap markdown file. The application tracks student learning progress with local storage persistence, provides an advanced real-time search engine, features beautiful theme modes, and exports print-friendly PDFs.

---

## 🚀 Features

* **Dynamic Markdown Parsing**: Fetches and parses `n8n-zero-to-hero-roadmap.md` on page load. Any updates made directly to the roadmap text file will instantly show up on the website.
* **Interactive Checklists & Progress Persistence**: Click on checklist items to cross them off. Your progress is automatically calculated and saved in `localStorage` so it persists when you close or reload the browser.
* **Progress Trackers**:
  * Global circular dashboard completion ring.
  * Thin header progress bar.
  * Sidebar percentage badges for each phase.
  * Phase details progress indicators.
* **Advanced Real-Time Search**: Search through phases, nodes, table content, goals, and descriptions. Matching results are highlighted in real-time, and checklist checkboxes remain interactive directly from the search results view.
* **Dual Themes (Dark & Light Mode)**:
  * **Sunset Volcanic Dark Theme (Default)**: Deep charcoal red-orange slate background, glowing neon highlights, and glassmorphic cards.
  * **Warm Cream Light Theme**: Soft peach radial background gradient with warm highlights and high-contrast orange-red active states.
* **Contact & Socials Section**: Integrated at the bottom of the dashboard with beautiful animated social profile buttons (TikTok, Instagram, Facebook) and a contact form that opens your pre-filled email client (`aiwithhammad2026@gmail.com`).
* **Print & PDF Export**: A sidebar PDF icon button converts the entire roadmap (including active completed checkbox markers `☒` vs `☐`) into a beautifully formatted print layout for downloading.
* **PWA (Progressive Web App)**: Install the website directly onto Android or iOS home screens as a native application with offline loading support (service worker cached).

---

## 🛠 Tech Stack

* **Core**: Semantic HTML5, Vanilla CSS3 (Custom Design System variables & responsive grid layout), Vanilla ES6+ JavaScript.
* **Libraries**: [Marked.js](https://marked.js.org/) (CDN-based Markdown compiler), [FontAwesome v6](https://fontawesome.com/) (Icons).
* **Environment**: Node.js & `http-server` static development environment.

---

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/[your-username]/n8n-zero-to-hero-roadmap.git
   cd n8n-zero-to-hero-roadmap
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **View the website**:
   Open your browser and navigate to:
   ```
   http://127.0.0.1:5173
   ```

---

## 📂 Project Structure

```
├── index.html          # Application shell, PWA tags, and print structures
├── style.css           # Styling variables, layouts, animations, and media queries
├── app.js              # State manager, custom line parser, and event triggers
├── sw.js               # Service Worker handling offline asset caching
├── manifest.json       # PWA metadata configuration for mobile installation
├── pwa-icon.png        # High-resolution PWA app launcher icon
├── package.json        # Node scripts to run the dev server
└── n8n-zero-to-hero-roadmap.md  # Main knowledge base file (source of truth)
```

---

## 👤 Author Information

* **Prepared for**: Hammad Ullah
* **Email**: [aiwithhammad2026@gmail.com](mailto:aiwithhammad2026@gmail.com)
* **Phone**: 0333-1904805
* **Feel free to contact me for n8n automation, AI workflows, and collaboration opportunities.**

# 📔 My Diary

A simple, private personal diary web app built with plain HTML, CSS, and JavaScript. Users sign in with their Google account — no passwords, no backend, no database. All diary entries are stored locally in the browser.

---

## ✨ Features

- **Google Sign-In (Federated Identity)** — users authenticate via Google OAuth 2.0. No username or password is stored anywhere.
- **Private entries per user** — each Google account has its own isolated set of entries stored in the browser's `localStorage`.
- **Create, edit, and delete entries** — each entry has a title, body text, and an auto-updated timestamp.
- **Session persistence** — refreshing the page keeps you logged in until you explicitly sign out.
- **Keyboard shortcut** — press `Ctrl+S` (or `Cmd+S` on Mac) to save the current entry.
- **Fully responsive** — works on desktop and mobile. On mobile, the sidebar becomes a slide-in drawer accessed via a hamburger menu.
- **No backend required** — everything runs in the browser. No server, no database, no user data ever leaves the device.

---

## 🛠 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Markup      | HTML5                               |
| Styling     | CSS3 (custom properties, flexbox)   |
| Logic       | Vanilla JavaScript (ES6+)           |
| Auth        | Google Identity Services (GSI)      |
| Storage     | Browser `localStorage`              |
| Hosting     | Netlify                             |

---

## 🔐 Authentication Flow

This app uses **Federated Identity Management** via Google as the identity provider:

1. The user clicks "Sign in with Google"
2. Google authenticates the user and returns a signed JWT (ID token)
3. The app decodes the JWT client-side to extract the user's name, email, and profile picture
4. No password is ever created or stored — Google handles all identity verification
5. The user's Google sub-ID is used as a key to namespace their diary entries in `localStorage`

This means:
- You don't need to manage passwords
- Any Google account holder can sign in instantly
- Each user's data is completely separate

---

## 🚀 Running Locally

Because Google OAuth blocks requests from `file://` URLs, you need a local HTTP server.

**Option 1 — VS Code Live Server**
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `index.html` → **Open with Live Server**
3. App opens at `http://127.0.0.1:5500`

**Option 2 — Node**
```bash
npx http-server -p 5500
```

**Option 3 — Python**
```bash
python -m http.server 5500
```

Then open `http://localhost:5500` in your browser.

### Allow localhost in Google Cloud Console

After starting the server, add your local origin to the OAuth client:

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:5500
   http://127.0.0.1:5500
   ```
4. Click **Save** and wait a few minutes for changes to propagate

---

## 🌐 Deploying to Netlify

1. Go to [netlify.com](https://netlify.com) and log in
2. Click **Add new site → Deploy manually**
3. Drag the project folder onto the upload area
4. After deployment, copy your Netlify URL (e.g. `https://your-site.netlify.app`)
5. Go back to Google Cloud Console and add the Netlify URL to **Authorized JavaScript origins**

---

## 📁 Project Structure

```
diary-app/
├── index.html       # App markup — login screen and diary editor
├── style.css        # All styles including responsive/mobile layout
├── app.js           # App logic — auth, CRUD, localStorage, mobile UI
├── netlify.toml     # Netlify redirect config
└── README.md        # This file
```

---

## 🔑 Credentials & Security Notes

- The **Google OAuth Client ID** is visible in `index.html`. This is expected and safe — Client IDs are public-facing identifiers designed to be embedded in frontend code.
- The **Client Secret** is never used in this app and must never be added to any frontend file or committed to this repository.
- All user data (diary entries) is stored only in the user's own browser via `localStorage`. No data is sent to any server.
- If you fork this project and use your own Google OAuth credentials, only replace the `data-client_id` value in `index.html` with your own Client ID.

---

## 📄 License

MIT — free to use and modify.

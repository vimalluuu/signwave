# 🚀 SignWave Deployment & Publishing Guide

This guide details exactly how to build and publish your **SignWave** PWA application to various hosting platforms. 

---

## 🛠️ Step 1: Run the Full Production Build

Before deploying to any platform, you must compile the application. SignWave includes custom scripts to generate static terms, privacy policies, sitemaps, and licenses.

Run the comprehensive production compile script:
```bash
npm run build:full
```

### What this script does:
1. Compiles the privacy and terms documents.
2. Compiles the Angular PWA application with production configurations (`--configuration=production`), triggering service worker generation.
3. Generates the XML sitemap for SEO.
4. Crawls and bundles license registries.
5. Generates VitePress developer documentation inside the build outputs.

**The compiled production assets will be located in:**
📂 `dist/sign-translate/browser/`

---

## ☁️ Option A: Deploy to Firebase Hosting (Built-In)

SignWave comes pre-configured with Firebase Hosting integration.

### 1. Log in to Firebase CLI
Make sure you have the Firebase CLI installed, then run:
```bash
npx firebase login
```

### 2. Initialize Firebase (If not already linked)
If you need to select your Firebase project:
```bash
npx firebase use --add
```

### 3. Deploy instantly
Run the built-in deploy script:
```bash
npm run deploy
```
This runs `firebase deploy --only=hosting`, publishing the contents of `dist/sign-translate/browser/` to your Firebase live URL immediately.

---

## ⚡ Option B: Deploy to Vercel (Recommended & Zero-Maintenance)

Vercel offers the simplest Git-integrated pipeline. Every time you push code to GitHub, it builds and updates your site automatically.

### 1. Connect GitHub Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** ➔ **Project**.
3. Select your GitHub repository: `vimalluuu/signwave`.

### 2. Configure Build Settings
Configure Vercel with these exact settings:
*   **Framework Preset**: `Angular`
*   **Build Command**: `npm run build:full`
*   **Output Directory**: `dist/sign-translate/browser`

Click **Deploy**! Vercel will build the project and assign a free custom SSL domain (`signwave.vercel.app`) with dynamic global CDN caching.

---

## 🌐 Option C: Deploy to Netlify (Simple & Direct)

Netlify is another excellent option with a powerful free tier.

### 1. Connect GitHub Repository
1. Log in to [Netlify](https://netlify.com).
2. Click **Add new site** ➔ **Import an existing project**.
3. Select your GitHub repository: `vimalluuu/signwave`.

### 2. Configure Build Settings
Configure Netlify with these settings:
*   **Build command**: `npm run build:full`
*   **Publish directory**: `dist/sign-translate/browser`

Click **Deploy site**. Netlify will build your PWA and serve it on a secure global network.

---

## 🎨 Option D: Deploy to GitHub Pages (100% Free)

If you want to host the app directly on your GitHub repository:

### 1. Build with specific Base-Href
Build the app pointing the base path to your repo name (e.g. `/signwave/`):
```bash
npx ng build --configuration=production --base-href=/signwave/
```

### 2. Deploy via `angular-cli-ghpages`
Deploy easily using the Angular Pages helper tool:
```bash
npx angular-cli-ghpages --dir=dist/sign-translate/browser
```
Your app will be live at `https://vimalluuu.github.io/signwave/`!

---

## 🔒 Firebase AppCheck Setup for Live Translations
Because the online translations fetch strictly from `https://sign.mt`, they enforce **Firebase AppCheck** verification. 
1. Register your production domain (e.g., `signwave.vercel.app` or `yourdomain.com`) in your **Firebase Console** under **AppCheck**.
2. Add your **reCAPTCHA Enterprise** or **reCAPTCHA v3** keys so the backend accepts live online translation requests originating from your public domain!

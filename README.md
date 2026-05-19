# 👋 Sign Wave

*Revolutionizing Sign Language Communication with Cutting-Edge Real-Time Translation Models.*

Enjoy seamless Sign Language Translation on desktop and mobile, with support for over 40 spoken and signed languages.

---

## 🚀 Key Features

*   **Real-Time Spoken-to-Signed Translation**: Converts spoken or typed text into Sutton SignWriting symbols and animates a 3D Avatar/skeleton output.
*   **Offline Mode (WASM)**: Run translations completely offline in your browser using high-performance local Bergamot translation models.
*   **Mobile & Web Support**: Designed using Angular & Ionic/Capacitor for a native-like experience on iOS, Android, and Web platforms.

---

## 🛠️ Development Setup

### Prerequisites

-   Install [Node.js](https://nodejs.org/) (which includes `npm`).

### Setting Up the Project

1.  Clone the repository and install dependencies locally:
    ```bash
    npm install
    ```
2.  Start the application in development mode:
    ```bash
    npm start
    ```
3.  Run the tests:
    ```bash
    npm test
    ```

---

## 💻 Local Testing & Troubleshooting

### 1. Enabling Hand Signs (Offline Model)
Because the online APIs strictly enforce Firebase AppCheck, requests made from `localhost` will be blocked by default. 

To run translations locally, you can use the app's built-in **Offline WASM Model**:
1.  Navigate to **[http://localhost:4200/settings/offline](http://localhost:4200/settings/offline)**.
2.  Expand **Translation** ➔ **Spoken-to-Signed**.
3.  Click the download icon next to **All ➔ All** (this downloads the compact multilingual model to your local browser storage).
4.  Go back to the homepage and start translating instantly offline!

### 2. Testing the High-Fidelity Online Model (Developer Bypass)
If you want to test the full-scale, high-fidelity online model on `localhost`:
1.  Go to the production website [https://sign.mt](https://sign.mt).
2.  Open **DevTools** (`F12`) ➔ **Network** tab.
3.  Type a message to trigger a translation, and locate the `spoken-text-to-signwriting` network request.
4.  Copy the `X-Appcheck-Token` from the request headers.
5.  Go to your local `http://localhost:4200/`, open the **Console** tab, and run:
    ```javascript
    localStorage.setItem('devAppCheckToken', 'YOUR_COPIED_TOKEN')
    ```
6.  Refresh the page, and the local application will use the live online model!

---

## 📱 Mobile Platform Builds (iOS & Android)

To build the native mobile apps using Capacitor:

```bash
npm run build:full
npx cap sync ios  # for iOS
npx cap sync android  # for Android
```

---

## 📜 License & Acknowledgements

Originally built by the Nagish team under the project `sign.mt`. Rebranded and customized as **Sign Wave**. 
Licensed under CC BY-NC-SA 4.0. See [LICENSE.md](LICENSE.md) for more details.

# 🚀 Local Development Guide - React Native with Expo

## ✅ Current Setup Status

Your CI/CD workflow is **correctly configured** for non-Docker development! The only fix needed was the export directory path (now fixed).

## 📦 What You Need to Install

### Required (Minimum)

1. **Node.js** (v20.19.4 or compatible)
   ```bash
   # Check if installed
   node --version
   npm --version
   
   # Install from: https://nodejs.org/
   # Or use nvm (recommended):
   # nvm install 20.19.4
   # nvm use 20.19.4
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

### For Mobile Development

#### iOS Development (macOS only)
- **Xcode** (from App Store)
  - Includes iOS Simulator
  - Command Line Tools: `xcode-select --install`
- **CocoaPods** (for iOS dependencies)
  ```bash
  sudo gem install cocoapods
  ```

#### Android Development
- **Java Development Kit (JDK)** 17 or 21
  ```bash
  # Check if installed
  java -version
  ```
- **Android Studio**
  - Download from: https://developer.android.com/studio
  - Install Android SDK
  - Set up Android Emulator
  - Add to PATH:
    ```bash
    export ANDROID_HOME=$HOME/Library/Android/sdk
    export PATH=$PATH:$ANDROID_HOME/emulator
    export PATH=$PATH:$ANDROID_HOME/platform-tools
    export PATH=$PATH:$ANDROID_HOME/tools
    export PATH=$PATH:$ANDROID_HOME/tools/bin
    ```

### Optional but Recommended

- **Expo Go App** (for testing on physical devices)
  - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
  - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

- **Git** (for version control)
  ```bash
  git --version
  ```

## 🏃 How to Run the React Native App

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Start the Development Server

```bash
# From the frontend directory
npm start
# or
npx expo start
```

This will:
- Start the Metro bundler
- Open Expo DevTools in your browser
- Show a QR code for Expo Go
- Display options for iOS/Android/Web

### Step 3: Choose Your Platform

#### Option A: Web Browser (Easiest)
```bash
npm run web
# or press 'w' in the Expo CLI
```
Opens at: `http://localhost:8081` or similar

#### Option B: iOS Simulator (macOS only)
```bash
npm run ios
# or press 'i' in the Expo CLI
```
Requires: Xcode installed

#### Option C: Android Emulator
```bash
npm run android
# or press 'a' in the Expo CLI
```
Requires: Android Studio and emulator set up

#### Option D: Physical Device (Expo Go)
1. Install Expo Go app on your phone
2. Scan the QR code shown in terminal/browser
3. App loads on your device

## 🔧 Running with Backend

### Start Backend Services (Docker)

```bash
# From project root
docker-compose up db web
```

This starts:
- PostgreSQL database (port 5432)
- Django backend (port 8000)

### Start Frontend (Local)

```bash
# In a separate terminal
cd frontend
npm start
```

### Configure API URL

If your backend runs on a different URL, create `.env` file in `frontend/`:

```bash
# frontend/.env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Then use it in your code:
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
```

## 📝 Available Scripts

From `frontend/` directory:

```bash
npm start          # Start Expo dev server
npm run web        # Start web version
npm run ios        # Start iOS simulator
npm run android    # Start Android emulator
npm run lint       # Run ESLint
```

## 🐛 Troubleshooting

### "Command not found: expo"
```bash
npm install -g expo-cli
# or use npx (recommended): npx expo start
```

### "Cannot connect to Metro bundler"
- Make sure port 8081 is not in use
- Check firewall settings
- Try: `npx expo start --clear`

### iOS Simulator not opening
- Make sure Xcode is installed
- Run: `sudo xcode-select --switch /Applications/Xcode.app`

### Android Emulator not found
- Open Android Studio
- Go to Tools > Device Manager
- Create/start an emulator
- Make sure `ANDROID_HOME` is set

### Port already in use
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use different port
npx expo start --port 8082
```

### Clear cache
```bash
npx expo start --clear
# or
rm -rf node_modules
npm install
```

## 📱 Development Workflow

1. **Start backend**: `docker-compose up db web`
2. **Start frontend**: `cd frontend && npm start`
3. **Choose platform**: Press `w` (web), `i` (iOS), or `a` (Android)
4. **Edit code**: Changes hot-reload automatically
5. **Test**: Use Expo Go on physical device or emulator

## ✅ Quick Checklist

- [ ] Node.js installed (v20.19.4+)
- [ ] npm installed
- [ ] Dependencies installed (`npm install` in frontend/)
- [ ] Backend running (`docker-compose up db web`)
- [ ] Frontend running (`npm start` in frontend/)
- [ ] (Optional) Xcode for iOS
- [ ] (Optional) Android Studio for Android
- [ ] (Optional) Expo Go app on phone

## 🎯 Next Steps

1. Install Node.js if not already installed
2. Run `npm install` in the frontend directory
3. Start the app with `npm start`
4. Choose your preferred platform (web is easiest to start)

Your CI/CD is already set up correctly and will automatically deploy the web version to GitHub Pages when you push to main branch!


# Build AppRoutine for iPhone (.ipa) — Mac steps

You cannot build iOS on Windows. Use a Mac with Xcode.

## Prerequisites (Mac)
- macOS with Xcode 16+ (from App Store)
- Apple ID (free) for device testing, or paid Apple Developer for App Store
- Node.js + CocoaPods: `sudo gem install cocoapods` (or `brew install cocoapods`)
- Copy this whole project folder to the Mac

## 1. Install native dependencies
```bash
cd ios
pod install
cd ..
```

## 2. Open in Xcode
```bash
open ios/AppRoutine.xcworkspace
```

## 3. Sign the app
- Select the **AppRoutine** project → **AppRoutine** target → **Signing & Capabilities**
- ✅ Automatically manage signing
- Team: your Apple ID (Personal Team for free testing)
- Bundle Identifier is already set to: `com.approutine`
  (must be unique — change if Apple rejects it)

## 4. Run on your iPhone (test)
- Plug iPhone in, unlock, trust the computer
- Choose your device at top of Xcode
- Click Run (▶)
- First launch: Settings → General → VPN & Device Management → trust your developer cert

> Free Apple ID: app expires after 7 days, just re-run to reinstall.

## 5. Export .ipa (archive)
- Xcode → Product → Archive (with Generic iOS Device selected)
- In Organizer → Distribute App → choose:
  - "Ad Hoc" (test on registered devices), or
  - "App Store Connect" (publish)
- Follow prompts to export/sign the .ipa

## Notes
- App icon: drop your icon into `ios/AppRoutine/Images.xcassets/AppIcon.appiconset`
  (a 1024x1024 PNG is required for App Store; optional for device test)
- Module name `AppRoutine` matches `AppRegistry.registerComponent('AppRoutine', ...)`

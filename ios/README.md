# SkillBridge iOS

Native SwiftUI client for the SkillBridge API. iOS 16+, Swift 5.9, async/await throughout, MVVM architecture, JWT in Keychain with auto-refresh, animated dark UI.

## Architecture

```
App/                  — SwiftUI app entry, root tab + auth gate
Models/               — Codable DTOs (User, WorkerProfile, Job, Application, Review)
Services/             — APIService (URLSession actor), AuthService (@MainActor singleton)
ViewModels/           — @MainActor ObservableObjects per screen
Views/
  Auth/               — Login + Register with role picker
  Workers/            — Search, detail, card
  Jobs/               — Search, detail, card, post-job
  Dashboard/          — Worker / Employer dashboards
  Components/         — Design system, animated background, inputs, buttons, badges
Utils/                — KeychainHelper, Color tokens, Constants
```

Highlights:

- **Single-source actor `APIService`** — all HTTP goes through one place; refresh-token rotation handled transparently on 401, with single-flight `Task` to dedupe concurrent refreshes.
- **Keychain** for refresh-token persistence (`kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`).
- **Spring-physics transitions, animated mesh background, shimmer skeletons, matched layout transitions** (`AnimatedBackground`, `ShimmerCard`, `LogoMark` with stroke draw-on, `PressableStyle`).
- **Strict separation**: Views depend only on ViewModels; ViewModels depend only on `APIService`/`AuthService`.

## Build

This project uses **xcodegen** to keep the `.xcodeproj` out of git. The single source of truth is `project.yml`.

```bash
brew install xcodegen        # one-time
cd ios
xcodegen generate            # → SkillBridge.xcodeproj
open SkillBridge.xcodeproj
```

Then in Xcode: select the `SkillBridge` scheme → choose any iOS 16+ simulator → ⌘R to run.

To run tests headlessly:

```bash
xcodebuild test \
  -project SkillBridge.xcodeproj \
  -scheme SkillBridge \
  -destination 'platform=iOS Simulator,name=iPhone 15'
```

## Configuring the API endpoint

The app reads `API_BASE_URL` from its Info.plist (defaulted in `project.yml`). To point at a non-localhost backend:

```bash
xcodegen generate
# then edit ios/SkillBridge.xcodeproj → Build Settings → API_BASE_URL
# OR edit project.yml's API_BASE_URL value and re-run xcodegen
```

For talking to a localhost backend from the simulator:

- iOS 14+ requires either `NSAllowsArbitraryLoads = true` in the app's Info.plist (already set in `project.yml`) **or** an HTTPS endpoint.
- Use `http://localhost:4000/api/v1` from the iOS Simulator (it shares the host's loopback).
- For a physical device, point `API_BASE_URL` at your machine's LAN IP (e.g. `http://192.168.1.42:4000/api/v1`).

## Tests

- `SkillBridgeTests/` — unit tests for ViewModels, model decoding, error envelopes.
- `SkillBridgeUITests/` — basic UI smoke tests.

## Linting

`.swiftlint.yml` is included; install `brew install swiftlint` and run `swiftlint` in `ios/` to lint.

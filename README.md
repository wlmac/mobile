# mobile

React Native mobile app written in TypeScript


### Prerequisites

The following are required to run or build this app: 
- Node.js v16
- npm v8
- expo-cli and turtle-cli (can be installed with `npm install -g expo-cli turtle-cli`)
- Java 8 (for building the Android app)
- macOS, XCode, and fastlane (for building the iOS app)

### Setup

First run: 
```
npm install --legacy-peer-deps --include-dev
```
Navigate to node_modules/strip-ansi/index.js and change `require` to `import`.

If you are building an Android app, you will need an API key for Google Maps for Android SDK and place it in the appropriate field in app.json.

### Running

```
npm start
```

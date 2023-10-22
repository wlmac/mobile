# Metropolis




## **First installation**



1. Get node (latest version should be ok)
2. Get npx (the local version of expo-cli): npm install -g npx
3. Clone [https://github.com/wlmac/mobile](https://github.com/wlmac/mobile)
    1. **Use the teardown branch, not main**
4. Install deps: npm install --legacy-peer-deps --include-dev
5. Run: npx expo start
6. In order to run notifications, you need to:
    1. Create an expo account and login expo at [https://expo.dev/](https://expo.dev/)
    2. Create a new project in expo's web GUI
    3. Copy the command it gives you and run it in the terminal
       - It should look like `eas init --id {project_ID}`

## **Development**



1. Install latest deps
    1. Use npm install --legacy-peer-deps --include-dev
2. Check for updates
    1. Before you do anything, ensure you are up-to-date with remote and the dependencies are up-to-date
    2. Outdated dep check: npm outdated
    3. Update deps command: npm update --legacy-peer-deps --include-dev -- save --save-dev
3. Branch
    1. Code on teardown branch or a new branch diverging from it
    2. Master branch is deprecated and teardown will be renamed and set to the main branch in the coming future
4. Testing
    1. For development testing, run npx expo start --tunnel
    2. For production testing, run npx expo start --tunnel --no-dev --minify
5. Bugs/PRs
    1. Use the issues/prs tabs on GitHub respectively for these issues, or simply just discuss in the app dev chat

## **Updating**



1. Configure app.json
    1. In expo.version, update it to the next version (current is 1.1.1)
    2. In android.versionCode, update it to the next version (current is 8)
2. Configure changelog.json
    1. Create a new json object in the file, append it to the FRONT of the list.
    2. In version, write the version now in expo.version
    3. In time, Get the current unix time ([https://www.unixtimestamp.com/](https://www.unixtimestamp.com/))
    4. In changes, Write changes
3. Configure changelog.tsx
    1. Ideally, after the first two steps the changelog will show whenever a user logs in the app or opens the app after an update for the first time. Nothing should be changed here unless this doesn’t work


### **Todos**



* Finish updates (@colin, @ken and @shane for notifs)
* Make teardown the main branch
* Build & release app
* Deadline ~mid july
* Summer:
    * Implement the UI in #app-design - Colin, Max, Aaron
    * Redux - Max, Aaron, Shane (maybe)
    * Try to get update by start of school year
* Start of school year/whenever update ready: Market
    * During food day, if u have app u get extra food/discount
    * Posters
* Chill!

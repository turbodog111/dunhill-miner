# Security notes (dunhill-miner)

## Admin tools
- Admin unlock requires a signed-in Firebase account plus a password whose SHA-256 hash is in `game.js`.
- Treat any password that ever appeared in git history as burned.
- Client-side hashing is not real access control; keep cheat tools limited and rotate the password if it leaks again.

## Firebase console checklist
1. **Authentication → Settings → Authorized domains**: keep only your real hosting domains (and `localhost` for local dev).
2. **App Check**: register the web app with reCAPTCHA v3, then enforce App Check on Firestore (and Storage if used).
3. **Firestore rules**: deploy `firestore.rules` from this repo (`firebase deploy --only firestore:rules`).
4. **Storage rules**: deploy `storage.rules` (default deny).
5. Confirm there is no open anonymous write access in the Firebase console.

## Secret scanning
GitHub secret scanning / push protection for this public repo may need to be enabled by a repo admin under **Settings → Code security**.

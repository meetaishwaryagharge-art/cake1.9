# Varyzon - Firebase setup

1. console.firebase.google.com -> Add project -> Build -> **Firestore Database** (Create, production mode, asia-south1).
2. Build -> **Authentication** -> Sign-in method -> enable **Email/Password**. Users tab -> **Add user** (admin email + password).
3. Project settings -> Your apps -> **Web app (</>)** -> copy the config into `firebase/firebase-config.js`.
4. Open `firebase/firestore.rules`, change the admin email in `isAdmin()` to yours. Paste into Firestore -> Rules -> Publish
   (or deploy with the CLI in step 5).
5. Deploy (needs Node.js):
   ```
   npm i -g firebase-tools
   firebase login
   firebase use --add          # pick your project
   firebase deploy             # publishes the site + rules
   ```
   Or upload the whole folder to any https web host, or test locally with `npx serve .`
6. Website: `/index.html` - Admin: `/admin/login.html`

Collections created automatically: orders, enquiries, callbacks, customizations.

# QRoll sync setup (Firebase, free Spark plan)

1. Go to console.firebase.google.com, create a project (turn Google Analytics off).
2. Project settings > Your apps > add a Web app. Copy the `firebaseConfig` block it shows.
3. Build > Authentication > Get started > Email/Password > enable. Then Users > Add user: your email and a password. This is your sync login.
4. Build > Firestore Database > Create database (production mode, region asia-southeast1 is closest to the Philippines).
5. Firestore > Rules: replace everything with the rules below and Publish.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

6. In QRoll > Dashboard > Sync across devices: paste the config, enter your email and password, tap Connect and sync. Repeat on your laptop (config is saved per device).
7. If sign-in says the domain is not authorized, add your static.app address under Authentication > Settings > Authorized domains.
8. After creating your user, you can turn off new sign-ups to be safe.

# Instructions to work with the app

First in ./app/ run:

```
npm install
```

### To run the frontend individually (for frontend development only, no interaction with the backend):

```
cd frontend
npm install
npm run start
```

App starts at http://localhost:3000

This will run the React app in a way that it gets refreshed everytime a change is made - perfect for frontend development.

### To run the backend only (for backend development):

Option 1:

```
npm run start
```

Option 2 (run with nodemon which automatically refreshes the server upon code change in server.js):

```
npm run dev
```

Server starts at http://localhost:8080

### To run both together (likely for prod not dev):

In ./app/

```
npm run build
npm run start
```

Server starts (and serves the app) at http://localhost:8080


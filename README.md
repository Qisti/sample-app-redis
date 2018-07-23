# Sample App Redis

In this repo, we used :
* `node.js` as platform
* `heroku` for deploying
* `redis` as database
* `socket.io` for realtime data
* `sentry.io` for error notification

### What's in the download?

The download includes :
```
├── index.js
├── README.md
├── package-lock.json
├── package.json
├── public
│   └── css
|   |   └── main.css
│   └── js
|       └── index.js
└── views
    └── index.html
```

## Setting up in your local machine

1. Git clone `https://github.com/Qisti/sample-app-redis` 
2. Change directory `cd sample-app-redis'
3. Run 'npm install'
4. Make sure you have credentials for redis cloud hosted and add your credential to `creds.json` file 
5. Make sure you have a DSN from sentry. Go to `index.js' and edit `Raven.config(YOUR_DSN).install();'
6. For deploy using heroku, read heroku's documentation heroku's documentation

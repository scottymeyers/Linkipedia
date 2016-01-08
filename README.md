# linkipedia
Find connections between two terms in Wikipedia.

You'll need node and mongoDB setup locally.

### SETUP:

Create a folder, and change into it
```
mkdir linkipedia && cd linkipedia
```

Clone the repo and install the dependencies
```
git clone git@github.com:Scottmey/linkipedia.git . && npm install
```

Start Mongo in a new terminal tab.
If using Heroku, create a integrate mongolab and set a MONGOLAB_URI config var.
```
mongod
```

Start node
```
node server.js
```

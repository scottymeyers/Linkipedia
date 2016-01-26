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

#### Screenshots:
![Search](https://cloud.githubusercontent.com/assets/969752/12594675/3c9e5ade-c445-11e5-8d64-cea9655277c2.jpg)


![History](https://cloud.githubusercontent.com/assets/969752/12594678/40b530ca-c445-11e5-93ba-a0a61b63c48c.jpg)

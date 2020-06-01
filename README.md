# YANTOO (You Are Not The Only One)
![topLanguage](https://img.shields.io/github/languages/top/getliberated/wads-final-project) [![commit](https://img.shields.io/github/last-commit/getliberated/wads-final-project)](https://github.com/GetLiberated/WADS-Final-Project/commits/master) ![size](https://img.shields.io/github/repo-size/getliberated/wads-final-project) ![license](https://img.shields.io/github/license/getliberated/wads-final-project) [![build](https://img.shields.io/docker/image-size/getliberated/yantoo-frontend)](https://hub.docker.com/repository/docker/getliberated/yantoo-frontend)
<hr>
Live demo - https://wads.erizky.com
<hr>

## About
YANTOO is a web chat application based on `MERN` stack with `socket.io` & `peer.js` to help everyone find community filled with people that shares the same interest.

## Supported Architectures

Our images support multiple architectures such as `x86-64`, `arm64` and `armhf`. We utilise the docker manifest for multi-platform awareness. More information is available from docker [here](https://github.com/docker/distribution/blob/master/docs/spec/manifest-v2-2.md#manifest-list)

## Installation - Frontend
### Step 1
Create a [Firebase](https://firebase.google.com/) account and get token key from there.
### Step 2
Create .env file
```
ID_ADMIN_URL=https://localhost
ID_CHAT_URL=https://localhost
ID_COMMUNITY_URL=https://localhost
ID_USER_URL=https://localhost
ID_SOCKET_URL=https://localhost
ID_PEER_URL=localhost
US_ADMIN_URL=https://localhost
US_CHAT_URL=https://localhost
US_COMMUNITY_URL=https://localhost
US_USER_URL=https://localhost
US_SOCKET_URL=https://localhost
US_PEER_URL=localhost

apiKey=
authDomain=
databaseURL=
projectId=
storageBucket=
messagingSenderId=
appId=
```
### Step 3
```
sudo docker run -d -p 10000:80 --name yantoo --env-file .env getliberated/yantoo-frontend
```
## Installation - Backend
### Step 1
Create a [MongoDB Atlas](https://account.mongodb.com/account/login) account and get token key from there.
### Step 2
Create .env.restful file
```
ATLAS_URI=mongodb+srv://user:password@server/database?retryWrites=true&w=majority
```
### Step 3
```
sudo docker run -d -p 10001:3000 --name admin --env-file .env.restful getliberated/yantoo-admin
sudo docker run -d -p 10002:3000 --name chat --env-file .env.restful getliberated/yantoo-chat
sudo docker run -d -p 10003:3000 --name community --env-file .env.restful getliberated/yantoo-community
sudo docker run -d -p 10004:3000 --name user --env-file .env.restful getliberated/yantoo-user
```
### Step 4
Create .env.socket file
```
CHAT_URL=http://localhost:10002
```
### Step 5
```
sudo docker run -d -p 10005:8080 --name socket --env-file .env.socket getliberated/yantoo-socket
sudo docker run -d -p 10006:9000 --name peer getliberated/yantoo-peer
```

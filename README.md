# YANTOO (You Are Not The Only One)
![topLanguage](https://img.shields.io/github/languages/top/getliberated/wads-final-project)
[![commit](https://img.shields.io/github/last-commit/getliberated/wads-final-project)](https://github.com/GetLiberated/WADS-Final-Project/commits/New-UI)
![size](https://img.shields.io/github/repo-size/getliberated/wads-final-project)
![license](https://img.shields.io/github/license/getliberated/wads-final-project)
[![website](https://img.shields.io/website?url=https%3A%2F%2Fwads.erizky.com)](https://wads.erizky.com)
[![header](https://img.shields.io/security-headers?url=https%3A%2F%2Fwads.erizky.com)](https://securityheaders.com/?q=wads.erizky.com&followRedirects=on)
[![build](https://img.shields.io/github/workflow/status/getliberated/wads-final-project/buildx)](https://github.com/GetLiberated/WADS-Final-Project/actions?query=workflow%3Abuildx)
<hr>
Live demo - https://wads.erizky.com
<hr>

## About
YANTOO is a web chat application based on `MERN` stack with `socket.io` & `peer.js` to help everyone find community filled with people that shares the same interest.

## Supported Architectures

Our images support multiple architectures such as `x86-64`, `arm64` and `armhf`. We utilise the docker manifest for multi-platform awareness. More information is available from docker [here](https://github.com/docker/distribution/blob/master/docs/spec/manifest-v2-2.md#manifest-list)

## Installation - Frontend [![](https://img.shields.io/docker/cloud/automated/getliberated/yantoo-frontend)](https://hub.docker.com/repository/docker/getliberated/yantoo-frontend) [![](https://img.shields.io/docker/cloud/build/getliberated/yantoo-frontend)](https://hub.docker.com/repository/docker/getliberated/yantoo-frontend) [![](https://img.shields.io/docker/v/getliberated/yantoo-frontend)](https://hub.docker.com/repository/docker/getliberated/yantoo-frontend) [![](https://img.shields.io/docker/image-size/getliberated/yantoo-frontend)](https://hub.docker.com/repository/docker/getliberated/yantoo-frontend)
### Step 1
Create a [Firebase](https://firebase.google.com/) account and get token key from there.
### Step 2
Create `.env` file
```
# Firebase token
apiKey=
authDomain=
databaseURL=
projectId=
storageBucket=
messagingSenderId=
appId=

# Server 1
ID_ADMIN_URL=http://localhost:10001
ID_CHAT_URL=http://localhost:10002
ID_COMMUNITY_URL=http://localhost:10003
ID_USER_URL=http://localhost:10004
ID_SOCKET_URL=http://localhost:10005
ID_PEER_URL=localhost
ID_PEER_PORT=10006

# Server 2 (Optional)
US_ADMIN_URL=
US_CHAT_URL=
US_COMMUNITY_URL=
US_USER_URL=
US_SOCKET_URL=
US_PEER_URL=
US_PEER_PORT=
```
### Step 3
```
sudo docker run -d -p 10000:80 --name yantoo --env-file .env getliberated/yantoo-frontend
```
## Installation - Backend
### Step 1
Create a [MongoDB Atlas](https://account.mongodb.com/account/login) account and get token key from there.
### Step 2
Create `.env.restful` file
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
Create `.env.socket` file
```
CHAT_URL=http://localhost:10002
```
### Step 5
```
sudo docker run -d -p 10005:8080 --name socket --env-file .env.socket getliberated/yantoo-socket
sudo docker run -d -p 10006:9000 --name peer getliberated/yantoo-peer
```

# Derange.io
An experiment in creating a 2D Roguelite Multiplayer game. 
The idea was to have a simple top-down perspective, controlling using WASD, and using the mouse to aim/attack.
It is written in TypeScript, compiling to Javascript for both the Server and the Client.

For now what works:
- NodeJS Server allowing clients to connect and sync. It spawns some default enemies which will move around. 
Connecting clients will receive their own player which they can control.
- Client which will connect to the server, and control its own character. It can move, attack enemies, and will collied with the environment/enemies.
- Network syncinc works, but is basic. I did experiment some with local prediction, while using an authorative server.
- Started work on a "click" branch, where I move away from WASD movement and instead use click-to-move, more like DOTA. 
This was to experiment with avoiding local prediction and correction, instead leaving everything to the server.

How to use:
- Build Client: npm run buildclient
- Run Client: Use a server like caddy to host the files, and start index.html in Chrome.

- Build Server: npm run buildserver
- Run Server: node build/server.js

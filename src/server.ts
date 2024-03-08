import { Server } from "hyper-express";
import { setTimeout } from "node:timers/promises";

export const webserver = new Server();
 
setTimeout(0).then(() => {
  webserver
    .listen(1234)
    .then((socket) => console.log("Webserver started on port 1234"))
    .catch((error) => console.log("Failed to start webserver on port 1234"));
});

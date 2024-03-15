import { Server, Router } from "hyper-express";
import { setTimeout } from "node:timers/promises";
import { randomUUID } from "node:crypto";
import { contextStorage } from "./context.back";

export const router = new Router().use((_req, _res, next) => {
  contextStorage.enterWith({
    requestId: randomUUID(),
  });
  next();
});

const server = new Server();
server.use("/ts-remote", router);

const port = 1234;
setTimeout(0).then(async () => {
  try {
    await server.listen(port);
    console.log("Webserver started on port " + port);
  } catch (e) {
    console.log("Failed to start webserver on port " + port);
    throw e;
  }
});

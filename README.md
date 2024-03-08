# TS-Remote

Small POC to do RPC via Typescript.

Inspired by tele-func.

Generate JSON or ProtocolBuffer encoder/decoder thanks to Typia a typescript compiler plugin.

Use those decoder to invoke TS function on a server from a client using a completly transparent API, fully type safe.

Runs a http server powered by hyper-express and uWebsockets.js.

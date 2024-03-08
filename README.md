# TS-remote

## Description

This project is a TypeScript-based web application with both server-side and client-side components.
It utilizes custom TypeScript transformers for API and client code generation.

## Features

- Server-side API handling with custom transformers
- Client-side code generation for remote calls
- Basic web server implementation using hyper-express
- TypeScript configurations for both server and client
- Rollup and Vite configurations for bundling and development

## Usage

- Place API files in the src directory with the `.api.ts` extension.
- Place client files in the src directory with the `.tsx` extension, from there you can import functions exported from `.api` modules.
- Run the development server and access the application in the browser.

## Getting Started

1. Clone the repository.
1. Install dependencies using `pnpm install`.
1. Start the development server using `pnpm run dev:back` and `pnpm run dev:front`.
1. Access the application at `http://localhost:3000`.

## Files walkthrough

For the backend :

- **rollup.config.json:** Rollup configuration for bundling server-side and API files.
  It applies the custom API transformer and TypeScript compilation.

- **api-transformer.mjs**: This file defines a custom TypeScript transformer for API files.
  It scans API files (files ending with .api.ts) and generates registration code for handlers based on whether protobuf is used or not.

- **index.back.ts**: Implements a basic web server using hyper-express, which listens on port 1234.

- **tsconfig.server.json**: TypeScript configuration for server-side files, specifying output directory and target settings.

For the frontend :

- **vite.config.ts**: Vite configuration for the development server.
  It includes plugins for TypeScript compilation, solid-js support, and custom client-side transformation.
  It also configures a proxy to redirect requests to the server.

- **client-transformer.ts**: Similar to api-transformer.mjs, this file defines a custom TypeScript transformer for client files (ending with .tsx).
  It generates code for client-side remote call functions based on the imported APIs, again depending on whether protobuf is used or not.

- **client.tsx**: Contains utility functions for creating client-side remote call functions.
  These functions are utilized by the generated code in the client transformer.

- **tsconfig.app.json**: TypeScript configuration for the application, targeting ES2022.
  It includes settings for JSX, module resolution, and plugins for custom transformations.

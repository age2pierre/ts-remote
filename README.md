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
- Three serialization/deserialization possible: JSON, protoBuf and seroval.
  - JSON: Being text-based, JSON is human-readable but typically larger in size compared to binary formats, which can impact performance in network transmission and parsing speed.
  - A binary serialization format developed by Google, protobuf is designed for efficient and scalable data storage and transmission. It uses predefined schemas to ensure data structure compatibility, making it more efficient but less flexible than JSON as it lacks direct support for dynamic or ad-hoc data structures.
  - Seroval: As a JavaScript library, Seroval provides advanced serialization capabilities, including support for cyclic references, streaming serialization, and compatibility with ES6+ features. It is highly flexible and supports a wide range of JavaScript-specific data types and structures not typically covered by JSON or protobuf.

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

- **handler-xxx.ts**: Contain utility functions for registering exported function as server-side handlers to http routes.
  These functions are utilized by the generated code in the client transformer.

For the frontend :

- **vite.config.ts**: Vite configuration for the development server.
  It includes plugins for TypeScript compilation, solid-js support, and custom client-side transformation.
  It also configures a proxy to redirect requests to the server.

- **client-transformer.ts**: Similar to api-transformer.mjs, this file defines a custom TypeScript transformer for client files (ending with .tsx).
  It generates code for client-side remote call functions based on the imported APIs, again depending on whether protobuf is used or not.

- **client-xxx.tsx**: Contain utility functions for creating client-side remote call functions.
  These functions are utilized by the generated code in the client transformer.

- **tsconfig.app.json**: TypeScript configuration for the application, targeting ES2022.
  It includes settings for JSX, module resolution, and plugins for custom transformations.

ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim

WORKDIR /app
ENV NODE_ENV="production"

RUN apt-get update -qq && apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

COPY --link . .

RUN npx next telemetry disable
RUN npm i
RUN npm run build
RUN npm prune --omit=dev

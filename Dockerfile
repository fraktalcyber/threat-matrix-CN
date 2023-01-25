FROM node:19-alpine3.16

WORKDIR /usr/src/app
COPY package.json yarn.lock ./

RUN yarn

COPY scripts ./scripts/

RUN yarn run ts-node -O '{"module":"commonjs"}' scripts/parseXlsx.ts

COPY . .

EXPOSE 3000
CMD ["yarn", "run", "dev"]

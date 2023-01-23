FROM node:19-alpine3.16



# Docker creates cache image after every RUN -command, 
# On future builds, it will start building from RUN -command, where files copied before it have been changed.

# So well optimize cache by copying minium amount of files for each RUN -command.
WORKDIR /usr/src/app
COPY package.json yarn.lock ./

RUN yarn

COPY scripts ./scripts/

RUN yarn run ts-node -O '{"module":"commonjs"}' scripts/parseXlsx.ts

COPY . .

EXPOSE 3000
CMD ["yarn", "run", "dev"]

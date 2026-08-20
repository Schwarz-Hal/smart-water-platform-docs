FROM pandoc/latex:3.6
RUN apk add --no-cache nodejs npm font-noto-cjk git
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENTRYPOINT ["npm", "run", "export", "--"]

# Node.jsの特定のバージョンを含むベースイメージ指定
FROM node:latest

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package.json package-lock.json ./

# ライブラリなどをインストール
RUN npm install

# npm の特定のバージョンをインストール
RUN npm install -g npm@10.2.4

# プロジェクトのソースコードをコピー
COPY . .

EXPOSE 3000

# CMD ["npm","run", "dev"]

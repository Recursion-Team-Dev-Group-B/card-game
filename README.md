# 環境構築手順

## 1. git clone
```bash
mkdir -p ~/recursion
cd ~/recursion
git clone git@github.com:Recursion-Team-Dev-Group-B/card-game.git
cd ~/recursion/card-game
```

## 2. Dockerビルド ~ 起動
```bash
cd ~/recursion/card-game
# ビルド
docker compose build

# コンテナ起動
docker compose up -d
```

## 4. dev環境サーバー起動
```bash
# コンテナに入る
docker exec -it card-game bash
# サーバー起動
npm run dev
```


## 3. ページにアクセス
http://localhost:3000/


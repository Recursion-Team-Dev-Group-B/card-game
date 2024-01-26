# 📄Description

トランプゲームで遅べるWebアプリケーションを開発しました。要件定義ぁら実装まで行いました。
以下4種類のトランプゲームがプレイできます。
- Blackjack
- War
- Poker
- Speed

# 🎮Game Link
- [Click here!](https://card-game-theta-three.vercel.app/)

# 📙Documents

- [要件定義](https://github.com/Recursion-Team-Dev-Group-B/card-game/wiki/%E8%A6%81%E4%BB%B6%E5%AE%9A%E7%BE%A9)
- [アクティブティ図](https://github.com/Recursion-Team-Dev-Group-B/card-game/wiki/%E3%82%A2%E3%82%AF%E3%83%86%E3%82%A3%E3%83%93%E3%83%86%E3%82%A3%E5%9B%B3)

# 🌍Environment Building
```bash
## 1. git clone
mkdir -p ~/recursion
cd ~/recursion
git clone https://github.com/Recursion-Team-Dev-Group-B/card-game.git
cd ~/recursion/card-game

## 2. Dockerビルド ~ 起動
cd ~/recursion/card-game
# ビルド
docker compose build

## 3. コンテナ起動
docker compose up -d

## 4. サーバー起動
# コンテナに入る
docker exec -it card-game bash
# サーバー起動
npm install
npm run dev

## 5. ページにアクセス
http://localhost:3000/
```


# 🚀Tech Stacks

|カテゴリ | 技術スタック |
| --- | --- |
| プラットフォーム | Web |
| アーキテクチャ | MVC |
| フロントエンド | TypeScript <br> React.js<br> Next.js<br> Phaser| 
| バックエンド | Node.js |
| インフラ | Docker|
| デプロイ | Vercel|
| ストレージ | LocalStorage|
| ソースコード管理 | Git, GitHub|
| フォーマッター | Prettier|

<div>
<img src="https://cdn.discordapp.com/attachments/1180725363559637065/1200425033223381092/React-icon.svg.png?ex%253D65c621ee%2526is%253D65b3acee%2526hm%253D26c077b33e0a13fd3e7265023f5290c6c8257243b4f2aa6fd0b6e642e9b11e66%2526" height="10%" width="20%" alt="React"/>
<img src="https://cdn.discordapp.com/attachments/1180725363559637065/1200425032585859184/ts-logo-256.png?ex%253D65c621ee%2526is%253D65b3acee%2526hm%253D607424b01ec08bc252d51295e66e436892216bda6dc42af0f50776b58cc0815c%2526" height="10%" width="20%" alt="TypeScript"/>
<img src="https://cdn.discordapp.com/attachments/1180725363559637065/1200425032212553778/Go-Logo_Black.png?ex%253D65c621ee%2526is%253D65b3acee%2526hm%253D0853c97677d8ef8f5bfd21f0c9c2cc1f21354533f775294cb3c196d4bc15c457%2526" height="10%" width="20%" alt="Go"/>
<img src="https://cdn.discordapp.com/attachments/1180725363559637065/1200430113385357423/Phaser_Logo_Web_Quality.png?ex%253D65c626a9%2526is%253D65b3b1a9%2526hm%253D8dffae76b352ae186edfe56dbf6f0a0d7d8768a9cb04a639f0a0fb80f0f0c40c%2526" height="10%" width="20%" alt="Phaser"/>
<img src="https://cdn.discordapp.com/attachments/1180725363559637065/1200425031835058226/01-primary-blue-docker-logo.png?ex%253D65c621ee%2526is%253D65b3acee%2526hm%253Ded32910ae3970db9f3ddaaca8fa95cec020380dfccc716d759c651f5e2cde168%2526" 　height="10%" width="20%" alt="docker"/>
<img src="https://cdn.discordapp.com/attachments/1180725363559637065/1200425031415648286/nextjs-logotype-light-background.png?ex%253D65c621ee%2526is%253D65b3acee%2526hm%253D6f2ec4641c9b3ce8907c30a836094c0fe554228dba515f1206563d690b663a11%2526)" height="10%" width="20%" alt="Next.js"/>
<img src="https://cdn.discordapp.com/attachments/1180725363559637065/1200425030799065178/vercel-logotype-dark.png?ex%253D65c621ee%2526is%253D65b3acee%2526hm%253De254ab491b6b23748d4d36753c1e394411de00767efd2de7090891d71557d5c0%2526" height="10%" width="20%" alt="Vercel"/>
</div>


# 🤖Future Functions
- サインアップ、サインイン、ログアウト
- 成績の可視化
- 大富豪、 七並べ、ババ抜きなどのゲーム追加
- オンライン対戦

# 👦👩Developers
- [goemon-github](https://github.com/goemon-github)
- [seej000](https://github.com/seej000)
- [totot1010](https://github.com/totot1010)



import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        ホーム画面
      </div>
      <Link href="/blackjack">Blackjackで遊ぶ</Link>
      {/* warのフォルダに飛ばす*/}
      <Link href="/war">Warで遊ぶ</Link>
    </main>
  );
}

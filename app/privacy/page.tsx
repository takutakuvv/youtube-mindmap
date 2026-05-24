import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | YouTube コメント マインドマップ',
  description: 'YouTube コメント マインドマップのプライバシーポリシーです。',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-slate-400 hover:text-white mb-8 inline-block">
          ← トップに戻る
        </Link>
        <h1 className="text-2xl font-bold mb-8">プライバシーポリシー</h1>

        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. 基本方針</h2>
            <p>
              YouTube コメント マインドマップ（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. 収集する情報</h2>
            <p className="mb-2">本サービスは以下の情報を収集します：</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>入力された YouTube URL（分析処理のみに使用）</li>
              <li>アクセスログ（IPアドレス、ブラウザ情報等）</li>
              <li>Cookie およびローカルストレージ（分析履歴の保存）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. 情報の利用目的</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>サービスの提供・改善</li>
              <li>利用状況の分析</li>
              <li>不正アクセスの防止</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. 第三者への提供</h2>
            <p>
              収集した情報は、法令に基づく場合を除き、第三者に提供しません。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. Google AdSense について</h2>
            <p className="mb-2">
              本サービスでは、Google AdSense を利用して広告を配信しています。Google AdSense は Cookie を使用してユーザーに適切な広告を表示します。
            </p>
            <p>
              Google の Cookie の使用については、
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline ml-1">
                Google の広告に関するポリシー
              </a>
              をご参照ください。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. Cookie について</h2>
            <p>
              本サービスは Cookie およびブラウザのローカルストレージを使用して、分析履歴を保存します。ブラウザの設定により Cookie を無効にすることができますが、一部機能が使用できなくなる場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. 免責事項</h2>
            <p>
              本サービスは YouTube の公開コメントを分析するツールです。分析結果の正確性・完全性については保証しません。本サービスの利用によって生じた損害について、運営者は責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. ポリシーの変更</h2>
            <p>
              本プライバシーポリシーは予告なく変更される場合があります。変更後の内容は本ページに掲載します。
            </p>
          </section>

          <p className="text-slate-500 text-xs pt-4 border-t border-slate-700">
            最終更新日：2026年5月24日
          </p>
        </div>
      </div>
    </div>
  )
}

# 仮プロフィール・SKILLS表示の確認

**この変更は仮情報を含む確認用です。正式情報へ差し替えるまで、公開用mainへマージしないでください。**
Xserverへのアップロード・本番の変更も行っていません。PRはDraftで作成します。

## 仮プロフィール

以下の5項目はすべてユーザー指定の仮情報であり、実際のプロフィールではありません。

| 項目 | 確認用の仮情報 |
| --- | --- |
| 名前 | 山田 太郎 |
| 年齢 | 30歳 |
| 現在の職業 | 〇〇で法人営業 |
| 居住地 | 東京都在住 |
| スキルセット | HTML・CSS / JavaScript / WordPress |

正本はTOPの `index.html` 内、`data-profile-status="temporary"` のPROFILEエリアです。
同じ位置に仮情報・マージ禁止・SEOへの流用禁止のコメントを付けています。
正式化するときは5つのdt/ddの値と仮情報マーカー・コメント・本資料をまとめて更新し、再確認してください。

仮情報はSEOメタ情報・構造化データ・WORKS関連HTMLへ出力していません。
HERO・WORKS・CAREER・STRENGTHS・CONTACTと稼働／連絡時間は変更していません。

## レイアウト

- ABOUTの既存のカード幅・淡いピンク背景・白背景・細い線・フォント・余白を継承。
- 768px以上はPROFILEとAVAILABILITYの2エリアを左右に、SPは上下に配置。
- PROFILEは5つの定義リスト行で構成し、最終項目だけ空のペアを作るような配置はしません。
- 稼働可能時間・ご連絡可能時間の4文は元のままです。
- SKILLSは既存の見出し・番号・罫線・技術タグを継承。PCは見出し／説明とタグを左右に、SPは縦並び。
- 長い見出しも折り返し可能にし、タグは既存のflex-wrapで自然に折り返します。

## SKILLSの掲載内容

| 番号 | カテゴリー | 説明 | タグ |
| --- | --- | --- | --- |
| 01 | Frontend Coding | 静的サイト制作・レスポンシブ対応 | HTML / CSS / SCSS / JavaScript |
| 02 | WordPress & CMS | オリジナルテーマ制作・更新機能の実装 | WordPress / PHP / ACF |
| 03 | Design & Development Tools | デザイン確認・制作・バージョン管理 | Figma・Git / GitHub・Cursor・Codex |

3カテゴリー・11タグです。`Git / GitHub` は1つのタグです。
React・Next.js・TypeScript・Tailwind CSS・SupabaseはTOPのSKILLS表示だけから外しています。
WORKS詳細の技術タグ、作品データ、一覧のフィルターは変更していません。

## ローカルでの確認

```sh
git fetch origin
git switch feat/profile-skills
python3 -m http.server 8000 --bind 127.0.0.1
```

- ABOUT：`http://127.0.0.1:8000/#about`
- SKILLS：`http://127.0.0.1:8000/#skills`

Chromeの開発者ツールのResponsive表示で幅375／390／768／1024／1440pxを指定して確認できます。
PC1440px・SP390pxのABOUT／SKILLS画像は、開発者ツールのスクリーンショット機能でも取得可能です。
Google Fontsが環境の接続制限で取得できない場合は、既存指定の代替フォントで表示されます。

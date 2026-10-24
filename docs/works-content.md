# WORKSの更新と確認事項

## 更新方法

`data/works.json` が11作品の共通データです。TOP・一覧・詳細は静的HTMLとして保存しています。
XserverではPythonやNode.jsを実行する必要はありません。リポジトリの構成を保って
`/portfolio/` 配下へ配置できます。今回は本番への配置は行っていません。

データを変更したら、開発環境で次を実行し、生成HTMLも一緒にコミットしてください。

```sh
python3 scripts/build-works.py
python3 scripts/check-works.py
sass --no-source-map scss/style.scss css/style.css
```

HTMLだけを直接編集すると、次回生成時に上書きされます。Header・Footerは既存TOPから
デザインを引き継ぎ、生成時に各階層の相対パスへ切り替えます。

## 公開設定

依頼に従い、11作品すべて `published: false` です。既存HTMLにあったURLは
`siteUrl` に候補として保持し、公開確認が取れるまでHTMLリンクに出力しません。
公開後はURLを確認して `siteUrl` を設定し、`published: true` にして再生成します。
その際、TOP・一覧・詳細すべてで「公開準備中」が安全な別タブリンクへ切り替わります。

## カテゴリーと制作情報の根拠

2026-10-24のユーザー回答に基づき、MORISITA・武者への道・SUPPLE・Matsuyama Clinicを
課題制作、それ以外7件を自主制作としています。回答の「武者修行」は既存の「武者への道」として扱っています。

| 作品 | 制作形態 | 技術カテゴリー | ボリューム | 制作期間 |
| --- | --- | --- | --- | --- |
| MORISITA | 課題制作 | HTML/CSS・WordPress | 10ページ | 約1か月（静的制作〜WordPress化） |
| 武者への道 | 課題制作 | WordPress | 10ページ | 2週間（WordPress化のみ） |
| SUPPLE | 課題制作 | WordPress | 10ページ | 2週間（WordPress化のみ） |
| NEXTA | 自主制作 | HTML/CSS・JavaScript | 未確認 | 未確認 |
| Lucia | 自主制作 | HTML/CSS・JavaScript | 未確認 | 未確認 |
| Juicy Mama | 自主制作 | HTML/CSS・JavaScript | 未確認 | 未確認 |
| シーメイト東北部 | 自主制作 | なし（コーディング前） | 未確認 | 未確認 |
| Matsuyama Clinic | 課題制作 | HTML/CSS・JavaScript | 1ページ | 1週間 |
| Cafe Calmati | 自主制作 | HTML/CSS・JavaScript | 未確認 | 未確認 |
| Paisible | 自主制作 | HTML/CSS・JavaScript | 未確認 | 未確認 |
| Sample Store | 自主制作 | HTML/CSS・JavaScript・WordPress | 未確認 | 未確認 |

技術タグと対応範囲・背景は、main `1d191e5` の既存WORKSカードと上記回答に基づいています。
Matsuyama Clinicは修復済みの作品コードでJavaScript実装を確認し、JavaScriptタグを追加しました。
SUPPLE・武者への道はWordPress化のみの担当として、HTML/CSSを担当技術に追加していません。
MORISITAのHTML/CSSは既存の静的コーディング担当情報と今回の回答に基づきます。

シーメイト東北部はコーディング前のため技術タグ・「意識したポイント」を出力していません。
Juicy Mamaはヘッダー・ヒーローまでの制作中としており、完成済みサイトとは記載していません。
意識したポイントは下記の作品コード、または既存の具体的な制作情報から確認できた内容だけを掲載しています。
担当範囲を言い換えただけの文章は削除し、根拠不足の項目は非表示にしています。

## 追加の文章・作品コード確認（2026-10-24）

Sample StoreとLuciaの制作背景は今回のユーザー回答を正とし、実在する店舗・婦人科クリニックから
着想を得た自主制作であって、公式サイトや受託案件ではないことを明記しています。

確認したコードは参照用に読み取っただけで、作品本体のリポジトリは変更していません。

| 作品 | 確認元 | 文章に反映した内容 |
| --- | --- | --- |
| Lucia | [06c487a / assets/js/main.js](https://github.com/hannaishi/lucia/blob/06c487a716f8e6913c411a2837689d90e9b8072a/assets/js/main.js)、[layout/_header.scss](https://github.com/hannaishi/lucia/blob/06c487a716f8e6913c411a2837689d90e9b8072a/assets/scss/layout/_header.scss)、[top/_hero.scss](https://github.com/hannaishi/lucia/blob/06c487a716f8e6913c411a2837689d90e9b8072a/assets/scss/page/top/_hero.scss)、[top/_features.scss](https://github.com/hannaishi/lucia/blob/06c487a716f8e6913c411a2837689d90e9b8072a/assets/scss/page/top/_features.scss) | SPの文字・画像位置・カード列数調整、メニュー開閉とinert・Escape・フォーカス復帰、FAQのhidden／aria-expanded連動 |
| Sample Store | [0da208f / functions.php](https://github.com/hannaishi/sample-store-wp/blob/0da208fadf69e4268bee2d5f96bd8cd6a0f3ee36/functions.php)、[front-page.php](https://github.com/hannaishi/sample-store-wp/blob/0da208fadf69e4268bee2d5f96bd8cd6a0f3ee36/front-page.php) | 商品・サービス・お知らせのカスタム投稿分離、ACFでのサービス説明・採用情報の読み出し |
| 武者への道 | [3021408 / template-parts/post-card.php](https://github.com/hannaishi/road-to-musha/blob/3021408f3df1f33280b7562e69f4ac7e65116e06/template-parts/post-card.php)、[includes/query.php](https://github.com/hannaishi/road-to-musha/blob/3021408f3df1f33280b7562e69f4ac7e65116e06/includes/query.php)、[includes/admin.php](https://github.com/hannaishi/road-to-musha/blob/3021408f3df1f33280b7562e69f4ac7e65116e06/includes/admin.php) | ACFのカテゴリー色、メニューからのピックアップ指定と一覧からの重複除外、更新担当者の管理メニュー整理 |
| Paisible | [8af0410 / assets/js/main.js](https://github.com/hannaishi/paisible/blob/8af0410ef1093b8874563b3e910fb2bbd71b0e7c/assets/js/main.js) | SPメニューのフォーカス移動・リンク選択時の閉鎖・Escape操作、動きを減らす設定時の表示演出の切り替え |

コードを確認できた、という記載はソースの静的調査を意味します。作品本体の本番環境・
WordPressの動作環境全体をテストしたものではありません。

以下は確認事項として保留しています。

- SUPPLE・NEXTA・Juicy Mama・Cafe Calmati：具体的な工夫を裏付ける作品コードを確認できていないため、
  担当範囲の繰り返しになっていたポイントを非表示にしています。背景は確認済みの制作形態・題材・担当範囲に限定しています。
- シーメイト東北部：制作予定という状況を背景に整理し、未実装の工夫は追加していません。
- その他の自主制作について、着想の経緯や個別の判断理由は未確認です。コードの動作から説明できる範囲を超える制作エピソードは創作していません。

## MORISITA・Matsuyama Clinicの保留解消

ABOUT・CAREER・STRENGTHS改修に合わせて、以下の実装を確認しました。作品リポジトリは読み取りのみで変更していません。

### MORISITA

- 静的版：`hannaishi/morisita` の `main`、コミット `aad310e32380aba0fb1947ac4ef24aa41366e5f6`。
- WordPress版：`hannaishi/morisita-wp` の既定ブランチ **master**、コミット `b07c81d30ed431216b202c95f1252f94a9f3861a`。
- Figmaのデザインカンプに合わせて調整した制作経緯は、今回のユーザー確認に基づきます。Figmaファイルと画面を直接比較したという意味ではありません。
- 静的版の[SCSS](https://github.com/hannaishi/morisita/tree/aad310e32380aba0fb1947ac4ef24aa41366e5f6/scss)で、ブレークポイント、余白・文字サイズ・段組み、PC/SP画像の切り替えを確認。
- WordPress版の[front-page.php](https://github.com/hannaishi/morisita-wp/blob/b07c81d30ed431216b202c95f1252f94a9f3861a/front-page.php)、[single-business.php](https://github.com/hannaishi/morisita-wp/blob/b07c81d30ed431216b202c95f1252f94a9f3861a/single-business.php)、[inc/setup.php](https://github.com/hannaishi/morisita-wp/blob/b07c81d30ed431216b202c95f1252f94a9f3861a/inc/setup.php)で、news・product・businessのカスタム投稿を扱うクエリ・テンプレートを確認。投稿タイプの登録自体はCPT UI等の環境側設定を前提としているため、テーマに登録処理があるとは記載していません。
- [inc/product.php](https://github.com/hannaishi/morisita-wp/blob/b07c81d30ed431216b202c95f1252f94a9f3861a/inc/product.php)と[ACF JSON](https://github.com/hannaishi/morisita-wp/tree/b07c81d30ed431216b202c95f1252f94a9f3861a/acf-json)で、製品仕様・画像等のフィールド定義と読み出しを確認。
- [single-news.php](https://github.com/hannaishi/morisita-wp/blob/b07c81d30ed431216b202c95f1252f94a9f3861a/single-news.php)でアイキャッチ未設定時のロゴ代替表示、single-business.phpで画像未設定時の既定画像を確認。

上記に基づいて、デザイン再現・更新しやすさ・画像未設定時の表示の3点を追加しました。WordPress本番環境全体の実行検証や成果数値の評価は行っていません。

### Matsuyama Clinic

修復済み `hannaishi/matsuyama-clinic` のmain `837653c7cfcd0e8e483bf7d0e89926f2765e7f1b` を読み取り、次を確認しています。
[確認したJavaScript一式](https://github.com/hannaishi/matsuyama-clinic/tree/837653c7cfcd0e8e483bf7d0e89926f2765e7f1b/js)

- `js/main.js`：3モジュールのimportと初期化、固定ヘッダーの高さを差し引いたスムーススクロール。
- `js/component/hamburger-menu.js`：メニュー開閉、bodyスクロール固定、inert・aria状態、Escape、メニュー内リンク選択時の閉鎖。
- `js/component/header-background-toggle.js`：ヒーロー高さを基準にしたヘッダー背景切り替え。
- `js/slider/gallery-slider.js`：SPだけで有効になるポインタードラッグと停止処理。

Portfolioの技術カテゴリーにJavaScriptを追加し、上記を3つのポイントに整理しました。
フィルター種類は変わらず、JavaScriptに該当する件数だけ6件から7件になります。

## 不足情報

- 自主制作7作品の制作期間・ページ数は未確認のため、該当項目を非表示にしています。
- Cafe Calmatiの画像はリポジトリに存在しないため、一覧・詳細とも「画像準備中」です。
- 全作品の公開状態・正しい公開URLの最終確認が必要です。URL未登録はNEXTA・Lucia・
  Juicy Mama・シーメイト東北部・Cafe Calmatiです。
- 今後の確認で技術や制作内容が更新された場合はデータを訂正してください。
  特に制作途中のJuicy MamaのJavaScriptは、作品本体のコード確認が必要です。

## ページと動作

一覧は `/portfolio/works/`、各詳細は `/portfolio/works/<slug>/` です。
スラッグはJSONの `slug` を使用します。TOPは代表3作品＋コンパクト3作品の指定順です。
一覧は既存11作品の表示順を保持しています。

絞り込みは `js/works-filter.js` のVanilla JavaScriptで、各カードの
`data-work-categories` と `hidden` を切り替えます。ボタンは標準のキーボード操作に対応し、
`aria-pressed`・読み上げ用件数・0件メッセージも更新します。
JS無効時はフィルターを表示せず、11作品・詳細リンクはすべて静的に表示されます。

Google Fontsが環境のネットワーク制限で取得できない場合、表示検証は既存指定の代替フォントで行います。
書体指定自体は変更していません。

## ローカル表示とスクリーンショット

リポジトリを取得し、今回の修正ブランチをチェックアウトしてから、リポジトリ直下で起動します。

```sh
git fetch origin
git switch feat/about-career-strengths
python3 -m http.server 8000 --bind 127.0.0.1
```

次のURLをChromeなどで開き、開発者ツールのデバイスツールバーをResponsiveにして
幅1440px／390px・ズーム100%でそれぞれ確認できます。

- TOP WORKS：`http://127.0.0.1:8000/#works`
- WORKS一覧：`http://127.0.0.1:8000/works/`
- Lucia詳細：`http://127.0.0.1:8000/works/lucia/`

Chromeでは開発者ツールのコマンドメニューで「Capture full size screenshot」を実行すると、
各ページの全体画像を保存できます。TOPはWORKS部分を確認してください。
Xserverへのアップロードは不要です。

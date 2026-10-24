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
| Matsuyama Clinic | 課題制作 | HTML/CSS | 1ページ | 1週間 |
| Cafe Calmati | 自主制作 | HTML/CSS・JavaScript | 未確認 | 未確認 |
| Paisible | 自主制作 | HTML/CSS・JavaScript | 未確認 | 未確認 |
| Sample Store | 自主制作 | HTML/CSS・JavaScript・WordPress | 未確認 | 未確認 |

技術タグと対応範囲・背景は、main `1d191e5` の既存WORKSカードと上記回答に基づいています。
Matsuyama Clinicは今回の回答で確認できたHTML/CSSのみを掲載し、元のJavaScriptタグは保留しました。
SUPPLE・武者への道はWordPress化のみの担当として、HTML/CSSを担当技術に追加していません。
MORISITAのHTML/CSSは既存の静的コーディング担当情報と今回の回答に基づきます。

シーメイト東北部はコーディング前のため技術タグ・「意識したポイント」を出力していません。
Juicy Mamaはヘッダー・ヒーローまでの制作中としており、完成済みサイトとは記載していません。
意識したポイントは既存の担当範囲・説明文を整理したもので、未確認の制作エピソードは加えていません。

## 不足情報

- 自主制作7作品の制作期間・ページ数は未確認のため、該当項目を非表示にしています。
- Cafe Calmatiの画像はリポジトリに存在しないため、一覧・詳細とも「画像準備中」です。
- 全作品の公開状態・正しい公開URLの最終確認が必要です。URL未登録はNEXTA・Lucia・
  Juicy Mama・シーメイト東北部・Cafe Calmatiです。
- 今後の確認で技術や制作内容が更新された場合はデータを訂正してください。
  特に制作途中のJuicy MamaのJavaScriptとMatsuyama ClinicのJavaScript有無は、作品本体のコード確認で確定できます。

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

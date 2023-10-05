// 動きのきっかけとなるアニメーションの名前を定義
function fadeAnime(){

  //ふわっと動くきっかけのクラス名と動きのクラス名の設定
  $('.fadeLeftTrigger').each(function(){ //fadeInUpTriggerというクラス名が
  　　var elemPos = $(this).offset().top-50; //要素より、50px上の
  　　var scroll = $(window).scrollTop();
  　　var windowHeight = $(window).height();
  　　if (scroll >= elemPos - windowHeight){
  　　$(this).addClass('fadeLeft');
  　　// 画面内に入ったらfadeInというクラス名を追記
  　　}else{
  　　　$(this).removeClass('fadeLeft');
  　　// 画面外に出たらfadeInというクラス名を外す
  　　}
  　　});
  
  //関数でまとめることでこの後に違う動きを追加することが出来ます
  $('.fadeDownTrigger').each(function(){ //fadeInDownTriggerというクラス名が
  　　var elemPos = $(this).offset().top-50; //要素より、50px上の
  　　var scroll = $(window).scrollTop();
  　　var windowHeight = $(window).height();
  　　if (scroll >= elemPos - windowHeight){
  　　$(this).addClass('fadeDown');
  　　// 画面内に入ったらfadeDownというクラス名を追記
  　　}else{
  　　　$(this).removeClass('fadeDown');
  　　// 画面外に出たらfadeDownというクラス名を外す
  　　}
  　　});
  
  $('.fadeRightTrigger').each(function(){ //fadeInUpTriggerというクラス名が
    　　var elemPos = $(this).offset().top-50; //要素より、50px上の
    　　var scroll = $(window).scrollTop();
    　　var windowHeight = $(window).height();
    　　if (scroll >= elemPos - windowHeight){
    　　$(this).addClass('fadeRight');
    　　// 画面内に入ったらfadeInというクラス名を追記
    　　}else{
    　　　$(this).removeClass('fadeRight');
    　　// 画面外に出たらfadeInというクラス名を外す
    　　}
    　　});

    $('.blurTrigger').each(function(){ //fadeInUpTriggerというクラス名が
      　　var elemPos = $(this).offset().top-50; //要素より、50px上の
      　　var scroll = $(window).scrollTop();
      　　var windowHeight = $(window).height();
      　　if (scroll >= elemPos - windowHeight){
      　　$(this).addClass('blur');
      　　// 画面内に入ったらfadeInというクラス名を追記
      　　}else{
      　　　$(this).removeClass('blur');
      　　// 画面外に出たらfadeInというクラス名を外す
      　　}
      　　});
    
    
  
  }//ここまでふわっと動くきっかけのクラス名と動きのクラス名の設定
  
  // 画面をスクロールをしたら動かしたい場合の記述
    $(window).scroll(function (){
      fadeAnime();/* アニメーション用の関数を呼ぶ*/
    });// ここまで画面をスクロールをしたら動かしたい場合の記述
  
  // 画面が読み込まれたらすぐに動かしたい場合の記述
    $(window).on('load', function(){
      fadeAnime();/* アニメーション用の関数を呼ぶ*/
    });// ここまで画面が読み込まれたらすぐに動かしたい場合の記述
    
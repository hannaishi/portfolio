$(window).on('scroll', function fadeAnime(){

  //ふわっと動くきっかけのクラス名と動きのクラス名の設定
  $('.zoomInTrigger').each(function(){ //fadeInUpTriggerというクラス名が
    var elemPos = $(this).offset().top-50; //要素より、50px上の
    var scroll = $(window).scrollTop();
    var windowHeight = $(window).height();
    if (scroll >= elemPos - windowHeight){
    $(this).addClass('zoomIn');
    // 画面内に入ったらfadeInというクラス名を追記
    }else{
      $(this).removeClass('zoomIn');
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
  });
  
  //ここまでふわっと動くきっかけのクラス名と動きのクラス名の設定
  
  // 画面をスクロールをしたら動かしたい場合の記述
    $(window).scroll(function (){
      fadeAnime();/* アニメーション用の関数を呼ぶ*/
    });// ここまで画面をスクロールをしたら動かしたい場合の記述
  
  // 画面が読み込まれたらすぐに動かしたい場合の記述
    $(window).on('load', function(){
      fadeAnime();/* アニメーション用の関数を呼ぶ*/
    });// ここまで画面が読み込まれたらすぐに動かしたい場合の記述
  


    $(function(){
      $('.lazy').slick({
        lazyLoad: 'ondemand',
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [{
          breakpoint: 769,//モニターの横幅が769px以下の見せ方
          settings: {
            slidesToShow: 2,//スライドを画面に2枚見せる
            slidesToScroll: 2,//1回のスクロールで2枚の写真を移動して見せる
            // arrows: true,
            // prevArrow: '<div class="slick-prev"></div>',//矢印部分PreviewのHTMLを変更
            // nextArrow: '<div class="slick-next"></div>',//矢印部分NextのHTMLを変更
            dots: true,//下部ドットナビゲーションの表示
          }},
          {
            breakpoint: 426,//モニターの横幅が769px以下の見せ方
            settings: {
              slidesToShow: 1,//スライドを画面に2枚見せる
              slidesToScroll: 1,//1回のスクロールで2枚の写真を移動して見せる
              // arrows: true,
              // prevArrow: '<div class="slick-prev"></div>',//矢印部分PreviewのHTMLを変更
              // nextArrow: '<div class="slick-next"></div>',//矢印部分NextのHTMLを変更
              dots: true,//下部ドットナビゲーションの表示
            }}
        ]
      });
    });

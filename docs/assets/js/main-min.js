!function(s){var a=s(window),o=s("body");breakpoints({default:["1681px",null],xlarge:["1281px","1680px"],large:["981px","1280px"],medium:["737px","980px"],small:["481px","736px"],xsmall:["361px","480px"],xxsmall:[null,"360px"]}),a.on("load",function(){window.setTimeout(function(){o.removeClass("is-preload")},100)}),"ie"==browser.name&&o.addClass("is-ie"),browser.mobile&&o.addClass("is-mobile"),s(".scrolly").scrolly({offset:100}),browser.canUse("object-fit")||(s(".image[data-position]").each(function(){var a=s(this),o=a.children("img");a.css("background-image",'url("'+o.attr("src")+'")').css("background-position",a.data("position")).css("background-size","cover").css("background-repeat","no-repeat"),o.css("opacity","0")}),s(".gallery > a").each(function(){var a=s(this),o=a.children("img");a.css("background-image",'url("'+o.attr("src")+'")').css("background-position","center").css("background-size","cover").css("background-repeat","no-repeat"),o.css("opacity","0")}))}(jQuery);
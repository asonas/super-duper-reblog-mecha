// ==UserScript==
// @name         rebloggger
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       asonas
// @match        https://twitter.com/*
// @grant        GM_xmlhttpRequest
// @connect      *
// @require https://raw.githubusercontent.com/mitchellmebane/GM_fetch/master/GM_fetch.js
// ==/UserScript==

(function() {
  'use strict';
  window.onkeydown = function(event) {
    if(event.key === ';') {
      var element = document.querySelector("article[data-focusvisible-polyfill=true]");
      if (element != null) {

      var tweetUrl = element.querySelector("a[dir=auto]").href
      var url = "http://10.0.2.200:9292/queue?url=" + tweetUrl;
      console.log(url)

        GM_xmlhttpRequest({
          method: "POST",
          url,
          onload: response => {
            const html = response.responseText;
            console.log(html);
        },
      })
      }
    }
  };
})();

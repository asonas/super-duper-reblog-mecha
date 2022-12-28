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
      console.log(element)
      if (element != null) {
        console.log(element.querySelectorAll("a")[3].href)
        var tweetUrl = element.querySelectorAll("a")[3].href
        var url = "http://10.0.2.200:9200/queue?url=" + tweetUrl;
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

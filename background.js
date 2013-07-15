// "Send From Omnibox" Chrome extension
// MIT Licensed
// matt@nlts.co, 2012 
// chrome.omnibox code modified from "omnix" omnibox example,
// which came with the following license:
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// Source URL:
// http://developer.chrome.com/extensions/samples.html#be68e4d262d74d2457999fc402f5bf5e

function resetDefaultSuggestion() {
  chrome.omnibox.setDefaultSuggestion({
    description: 'Search Wikipedia'
  });
}

resetDefaultSuggestion();

chrome.omnibox.onInputCancelled.addListener(function() {
  resetDefaultSuggestion();
});

if (!String.prototype.encodeHTML) {
  String.prototype.encodeHTML = function () {
    return this.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;');
  };
}

chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    var url = 'http://en.wikipedia.org/w/api.php?action=query&prop=links&format=json&titles=' + encodeURIComponent(text) + '_(disambiguation)';
    var req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.setRequestHeader("GData-Version", "2");
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          var respString = req.response;
          var resp = JSON.parse(respString);

          var pages = resp.query.pages;

          var results = [];
          for (var prop in pages) {
            if (!pages.hasOwnProperty(prop)) continue;

            var entry = pages[prop];
            if (!entry.links) continue;

            entry.links.forEach(function(item) {
              results.push({
                description: '<match>' + item.title.encodeHTML() + '</match>',
                content: 'http://en.wikipedia.org/wiki/' + encodeURI(item.title),
              });
            });
          }

          console.log(results);
          suggest(results);
        }
      }
      req.send(null);
});

function navigate(url) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.update(tab.id, {url: url});
  });
}

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
    function (text) {
      if (!/^http/.test(text)) {
        navigate('http://en.wikipedia.org/wiki/' + encodeURI(text));
      } else {
        navigate(text);
      }
    }
);

function log(txt) {
    console.log(txt);
}

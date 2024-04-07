// background.js
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({preferredCurrency: 'USD'}, function() {
      console.log('Default currency set to USD');
    });
  });
  
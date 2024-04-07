// popup.js
document.addEventListener('DOMContentLoaded', function() {
    var currencySelector = document.getElementById('currency');
    var convertButton = document.getElementById('convertButton');
    
    // Load and set the preferred currency from storage
    chrome.storage.sync.get('preferredCurrency', function(data) {
      currencySelector.value = data.preferredCurrency || 'USD';
    });
    
    // Event listener for when the currency option is changed
    currencySelector.addEventListener('change', function() {
      // Save the new preferred currency to storage
      chrome.storage.sync.set({preferredCurrency: currencySelector.value}, function() {
        console.log('Preferred currency set to ' + currencySelector.value);
      });
    });
    
    // Event listener for when the Convert Currency button is clicked
    convertButton.addEventListener('click', function() {
      // Send a message to content script to trigger conversion
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'convertCurrency'});
      });
    });
  });
  
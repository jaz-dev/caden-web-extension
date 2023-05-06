// console.log('working')

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('request: ', request);
  if (request.selectedText) {
    // Do something with the selected text
    console.log("Selected text:", request.selectedText);
    sendResponse('Text received')
  }
});
// function getText() {
//   const text = window.getSelection().toString();
//   console.log('text: ', text)
//   return text;
// }

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//   console.log('adding cs.js')
//   if (changeInfo.status == "complete" && tab.active) {
//     chrome.scripting.executeScript({
//       target: {
//         tabId: tabId
//       },
//       func: getText
//     });
//   }
// });


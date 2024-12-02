console.log("content.js loaded");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Message received in content.js:", request);
    
    if (request.action === "extractJobDetails") {
        // Capture all visible text on the page
        const pageText = document.body.innerText;

        // Send the page text to the background script
        chrome.runtime.sendMessage({
            action: "generateCoverLetter",
            pageContent: pageText
        });
        sendResponse({status: "success"});
    }
});

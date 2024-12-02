document.addEventListener('DOMContentLoaded', function() {
    // Load saved API key and resume status
    chrome.storage.local.get(['apiKey', 'resume'], function(result) {
        if (result.apiKey) {
            document.getElementById('apiKey').value = result.apiKey;
        }
        if (result.resume) {
            document.getElementById('status').textContent = "Resume is uploaded.";
        }
    });

    // Save settings
    document.getElementById('saveSettings').addEventListener('click', function() {
        const apiKey = document.getElementById('apiKey').value;
        const resumeFile = document.getElementById('resume').files[0];

        if (apiKey) {
            chrome.storage.local.set({'apiKey': apiKey}, function() {
                console.log('API Key saved.');
            });
        }

        if (resumeFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const resumeText = e.target.result;
                chrome.storage.local.set({'resume': resumeText}, function() {
                    document.getElementById('status').textContent = "Resume saved.";
                    document.getElementById('status').className = "";
                });
            };
            reader.readAsText(resumeFile);
        } else {
            // Inform about API Key save if resume not uploaded
            document.getElementById('status').textContent = "API Key saved.";
            document.getElementById('status').className = "";
        }
    });

    // Generate Cover Letter
    document.getElementById('generateLetter').addEventListener('click', function() {
        // Check if API key and resume are saved
        chrome.storage.local.get(['apiKey', 'resume'], function(result) {
            if (!result.apiKey) {
                document.getElementById('status').textContent = "Please enter your API key.";
                document.getElementById('status').className = "error";
                return;
            }
            if (!result.resume) {
                document.getElementById('status').textContent = "Please upload your resume.";
                document.getElementById('status').className = "error";
                return;
            }
            
            // Send message to content script to extract job details
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "extractJobDetails"}, function(response) {
                    if (chrome.runtime.lastError || !response || response.status !== "success") {
                        document.getElementById('status').textContent = "Error extracting job details.";
                        document.getElementById('status').className = "error";
                    } else {
                        document.getElementById('status').textContent = "Generating cover letter...";
                        document.getElementById('status').className = "";
                    }
                });
            });
        });
    });    
});

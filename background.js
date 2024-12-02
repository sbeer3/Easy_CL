chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "generateCoverLetter") {
        chrome.storage.local.get(['apiKey', 'resume'], function(result) {
            const apiKey = result.apiKey;
            const resume = result.resume;
            const pageContent = request.pageContent;

            if (!apiKey || !resume || !pageContent) {
                console.error('Missing data for cover letter generation.');
                return;
            }

            // Prompt for OpenAI with the full page content
            const prompt = `
                Here is the text of a job listing page:
                ${pageContent}

                Based on this job listing, write a cover letter for the job described.
                Use the following resume as a reference:
                ${resume}

                Focus on making the cover letter relevant to the job description and qualifications listed on the page. 
                The tone should be professional, concise, and engaging.
            `;

            fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{"role": "user", "content": prompt}],
                    max_tokens: 500,
                    temperature: 0.7
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.choices && data.choices.length > 0) {
                    const coverLetter = data.choices[0].message.content;
                    // Display the cover letter to the user
                    chrome.tabs.create({url: 'data:text/plain;charset=utf-8,' + encodeURIComponent(coverLetter)});
                } else {
                    console.error('No response from OpenAI API.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
});

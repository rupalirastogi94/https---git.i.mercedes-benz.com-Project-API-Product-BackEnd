async function handleFormSubmit(e) {

    e.preventDefault();

    const url = document.getElementById('url').value;
    const method = document.getElementById('method').value;
    const headers = getHeadersFromUI();
    const body = document.getElementById('body').value;

    const statusCodeDiv = document.getElementById('statusCode');
    const responseDataDiv = document.getElementById('responseData');

    // Retrieve form values
    const apiType = document.querySelector('input[name="apiType"]:checked').value;
    // const username = document.getElementById('username').value;
    // const password = document.getElementById('password').value;

    // // Add authorization headers if required
    // if (authorizationType === 'BasicAuth') {
    //   const authHeader = btoa(`${username}:${password}`);
    //   headers['Authorization'] = `Basic ${authHeader}`;
    // }

    // Send the API request
    try {
        let response;
        let responseData;
        if (apiType === 'rest') {
            response = await fetch(url, {
                method,
                headers: headers,
                body: method !== 'GET' ? body : undefined,
            });

            const responseBody = await response.text();
            
            if (responseBody) {
                try {
                    responseData = JSON.parse(responseBody);
                } catch (error) {
                    console.error('Failed to parse response:', error);
                    responseData = { error: 'Failed to parse response' };
                }
            } else {
                responseData = {};
            }
        } else if (apiType === 'soap') {
            try {
                
                const soapResponse = await performSoapRequest(url, body);
                // Parse the SOAP response XML to JSON
                let responseData;
                parseString(soapResponse, (error, result) => {
                    if (error) {
                        console.error('Failed to parse SOAP response:', error);
                        responseData = { error: 'Failed to parse SOAP response' };
                    } else {
                        responseData = result;
                    }
                });

            } catch (error) {
                console.error('SOAP Request Error:', error);

            }
        }

        const statusCode = response.status;
        const statusText = response.statusText || getStatusTextByCode(statusCode);

        updateStatusCodeDisplay(statusCode, statusText);

        // Update UI with response status and data
        statusCodeDiv.textContent = `Status: ${statusCode} ${statusText}`;
        responseDataDiv.innerHTML = `<pre><code class="json">${JSON.stringify(responseData, null, 2)}</code></pre>`;

        // Apply syntax highlighting
        hljs.highlightAll();
    } catch (error) {
        console.error('Request failed:', error);
        statusCodeDiv.textContent = 'Error';
        responseDataDiv.textContent = JSON.stringify({ error: error.message }, null, 2);
    }
}

// Function to perform SOAP request
async function performSoapRequest(url, xml) {
        try {
            const response = await fetch(`/proxy/${encodeURIComponent(url)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml'
                },
                body: xml,
                redirect: 'follow'
            });
            
    
            if (!response.ok) {
                throw new Error('SOAP Request Failed');
            }
    
            const soapResponse = await response.text();
            // Process the SOAP response
            console.log('SOAP Response:', soapResponse);
    
            return soapResponse;
        } catch (error) {
            console.error('SOAP Request Failed:', error);
            throw error;
        }
    }
    


function updateStatusCodeDisplay(statusCode, statusText) {
    const statusCodeElement = document.getElementById('statusCode');

    const statusDisplay = `Status: ${statusCode} ${statusText}`;
    statusCodeElement.textContent = statusDisplay;

    statusCodeElement.classList.remove('success', 'error');

    if (statusCode >= 200 && statusCode <= 299) {
        statusCodeElement.classList.add('success');
    } else if (statusCode >= 400 && statusCode <= 599) {
        statusCodeElement.classList.add('error');
    }
}

function getHeadersFromUI() {
    const headerFields = document.querySelectorAll('.header-field');
    const headers = {};

    headerFields.forEach((field) => {
        const key = field.querySelector('.header-key').value;
        const value = field.querySelector('.header-value').value;
        if (key && value) {
            headers[key] = value;
        }
    });

    return headers;
}

document.getElementById('apiForm').addEventListener('submit', handleFormSubmit);
document.getElementById('addHeaderButton').addEventListener('click', addHeaderField);

function addHeaderField() {
    const headerFieldsContainer = document.getElementById('headerFields');
    const newHeaderField = document.createElement('div');
    newHeaderField.className = 'header-field';
    newHeaderField.innerHTML = `
      <input type="text" class="header-key" placeholder="Key">
      <input type="text" class="header-value" placeholder="Value">
      <button type="button" class="remove-header-button">Remove</button>
    `;
    headerFieldsContainer.appendChild(newHeaderField);
    newHeaderField.querySelector('.remove-header-button').addEventListener('click', removeHeaderField);
}

function removeHeaderField(e) {
    const headerField = e.target.closest('.header-field');
    headerField.parentNode.removeChild(headerField);
}

function getStatusTextByCode(code) {
    switch (code) {
        case 200:
            return 'OK';
        case 201:
            return 'Created';
        case 400:
            return 'Bad Request';
        case 404:
            return 'Not Found';
        default:
            return 'Unknown';
    }


}

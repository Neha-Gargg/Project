document.getElementById('pingForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const siteUrl = document.getElementById('urlInput').value.trim();
    const resultDiv = document.getElementById('pingResults');

    // Validate input
    if (!siteUrl) {
        resultDiv.innerHTML = '<p class="text-red-500">Please enter a website URL</p>';
        return;
    }

    // Clear previous results
    resultDiv.innerHTML = '<p class="text-gray-700">Pinging...</p>';

    // Fetch the user's public IP address (optional, can be removed if not needed)
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            const userIp = data.ip;

            // Perform ping requests (adjust number of attempts as needed)
            const attempts = 5;
            let successCount = 0;
            let times = [];

            const pingPromises = [];
            for (let i = 0; i < attempts; i++) {
                const startTime = Date.now();
                const pingPromise = fetch(siteUrl, { mode: 'no-cors' })
                    .then(response => {
                        const endTime = Date.now();
                        const timeTaken = endTime - startTime;
                        times.push(timeTaken);
                        successCount++;
                    })
                    .catch(error => {
                        console.error('Ping failed:', error);
                    });
                pingPromises.push(pingPromise);
            }

            // Resolve all ping promises
            Promise.all(pingPromises)
                .then(() => {
                    // Calculate statistics
                    const loss = ((attempts - successCount) / attempts) * 100;
                    const minTime = Math.min(...times);
                    const maxTime = Math.max(...times);
                    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

                    // Update HTML with ping results
                    resultDiv.innerHTML = `
                        <p class="pt-5 font-semibold">Ping completed with ${attempts} attempts</p>
                        <p class="font-semibold">Packet Loss: <span class="text-red-500">${loss.toFixed(2)}%</span></p>
                        <p class="font-semibold">Min RTT: <span class="text-red-500">${minTime} ms</span></p>
                        <p class="font-semibold">Max RTT: <span class="text-red-500">${maxTime} ms</span></p>
                        <p class="font-semibold">Avg RTT: <span class="text-red-500">${avgTime.toFixed(2)} ms</span></p>
                        <p class="pb-5 font-semibold">Your IP Address: <span class="text-red-500">${userIp}</span></p>
                    `;
                })
                .catch(error => {
                    console.error('Failed to ping website:', error);
                    resultDiv.innerHTML = '<p class="text-red-500">Failed to ping website</p>';
                });
        })
        .catch(error => {
            console.error('Failed to fetch IP:', error);
            resultDiv.innerHTML = '<p class="text-red-500">Failed to fetch IP address</p>';
        });
});
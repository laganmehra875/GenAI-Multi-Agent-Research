document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch Default Weather for Uttarakhand
    fetchWeather('Uttarakhand');

    const searchBtn = document.getElementById('search-btn');
    const topicInput = document.getElementById('topic-input');

    searchBtn.addEventListener('click', handleSearch);
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
});

async function fetchWeather(location) {
    const tempEl = document.getElementById('w-temp');
    const descEl = document.getElementById('w-desc');
    
    try {
        const res = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
        const data = await res.json();
        
        if (data.status === 'success') {
            // Update location text
            const firstWord = location.split(' ')[0];
            const cleanLoc = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
            document.querySelector('.weather-glass .location').textContent = cleanLoc;

            const weatherStr = data.weather;

            // Extract temperature, description, and humidity from python string
            const tempMatch = weatherStr.match(/Temperature:\s*([\d.]+°C)/i);
            const descMatch = weatherStr.match(/in [^:]+:\s*([^,]+)/i);
            const humMatch = weatherStr.match(/Humidity:\s*([^%]+%)/i);

            if (tempMatch && tempMatch[1]) {
                tempEl.textContent = tempMatch[1];
            } else {
                tempEl.textContent = '';
            }

            if (descMatch && descMatch[1]) {
                const desc = descMatch[1].toLowerCase();
                const humidity = humMatch ? ` | 💧 ${humMatch[1]}` : '';
                
                let iconClass = 'sun';
                let iconChar = '☀️';
                if (desc.includes('cloud') || desc.includes('rain') || desc.includes('haze') || desc.includes('mist') || desc.includes('snow') || desc.includes('overcast')) {
                    iconClass = 'cloud';
                    iconChar = '☁️';
                }
                
                descEl.innerHTML = `<span class="weather-icon-anim ${iconClass}">${iconChar}</span> <span style="margin-left:5px;">${desc}${humidity}</span>`;
            } else {
                descEl.textContent = data.weather.length > 25 ? 'Data Available' : data.weather;
            }
        } else {
            descEl.textContent = 'API Error';
        }
    } catch (e) {
        descEl.textContent = 'Offline';
    }
}

async function handleSearch() {
    const input = document.getElementById('topic-input').value.trim();
    if (!input) return;

    // Detect location to dynamically update the weather widget!
    const locMatch = input.match(/\b(?:in|of|about|for|at)\s+([a-zA-Z\s]+)/i);
    if (locMatch && locMatch[1]) {
        fetchWeather(locMatch[1].trim());
    }

    // UI State Management
    document.getElementById('results-section').classList.remove('hidden');
    document.getElementById('loading-screen').classList.remove('hidden');
    document.getElementById('report-content').classList.add('hidden');
    
    const steps = document.querySelectorAll('.status-steps span');
    let stepIdx = 0;
    steps.forEach(s => s.classList.remove('active'));
    steps[0].classList.add('active');

    const interval = setInterval(() => {
        steps.forEach(s => s.classList.remove('active'));
        stepIdx = (stepIdx + 1) % steps.length;
        steps[stepIdx].classList.add('active');
    }, 4000);

    try {
        // Send to FastAPI
        const res = await fetch('/api/research', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: input })
        });
        
        const data = await res.json();
        clearInterval(interval);

        document.getElementById('loading-screen').classList.add('hidden');
        
        if (data.status === 'success') {
            document.getElementById('report-content').classList.remove('hidden');
            // Parse Markdown robustly
            document.getElementById('report-body').innerHTML = marked.parse(data.report || '*No report generated.*');
            document.getElementById('feedback-body').innerHTML = marked.parse(data.feedback || '*No feedback generated.*');
        } else {
            alert('Error running pipeline: ' + data.message);
        }

    } catch (e) {
        clearInterval(interval);
        document.getElementById('loading-screen').classList.add('hidden');
        alert('Could not connect to the Backend server.');
    }
}

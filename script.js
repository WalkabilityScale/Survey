function startSurvey() {
    var province = document.getElementById('province-select').value;
    var postalInput = document.getElementById('postal-code-input').value;
    var errorMsg = document.getElementById('error-message');

    // 1. Validate Province
    if (!province) {
        errorMsg.innerText = "Please select a province.";
        return;
    }

    // 2. Validate Postal Code
    var cleanCode = postalInput.trim().toUpperCase();
    var regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

    if (!regex.test(cleanCode)) {
        errorMsg.innerText = "Invalid format. Use A1A 1A1.";
        return;
    }

    if (cleanCode.length === 6) {
        cleanCode = cleanCode.substring(0, 3) + " " + cleanCode.substring(3);
    }
    
    // 3. Switch Screens
    document.getElementById('landing-screen').classList.add('hidden');
    document.getElementById('visualization-screen').classList.remove('hidden');

    // 4. Draw the Buffers
    drawBuffers();
}

function drawBuffers() {
    var svg = document.getElementById('buffer-svg');
    
    // UPDATE 1: Make the canvas bigger (1200 instead of 800) to fit wider circles
    svg.setAttribute("viewBox", "0 0 1200 1200");
    var center = 600; // New center point
    
    // UPDATE 2: Increased Radii (approx 1.5x larger than before)
    // Previous step was 70px, now using 110px step.
    var steps = [
        { min: 25, r: 550, color: 'black' },
        { min: 20, r: 440, color: 'purple' },
        { min: 15, r: 330, color: 'red' },
        { min: 10, r: 220, color: 'green' },
        { min: 5,  r: 110,  color: 'blue' }
    ];

    steps.forEach(step => {
        // 1. Draw Ring
        var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", center);
        circle.setAttribute("cy", center);
        circle.setAttribute("r", step.r);
        circle.setAttribute("stroke", step.color);
        svg.appendChild(circle);
        
        // 2. Draw TOP Label (North)
        var textTop = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textTop.setAttribute("x", center);
        textTop.setAttribute("y", center - step.r - 10); // 10px above the line
        textTop.textContent = `${step.min} mins`;
        textTop.setAttribute("fill", step.color);
        svg.appendChild(textTop);

        // 3. Draw BOTTOM Label (South) -- NEW!
        var textBottom = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textBottom.setAttribute("x", center);
        textBottom.setAttribute("y", center + step.r + 20); // 20px below the line (to account for text height)
        textBottom.textContent = `${step.min} mins`;
        textBottom.setAttribute("fill", step.color);
        svg.appendChild(textBottom);
    });
}

// Auto-format input
document.getElementById('postal-code-input').addEventListener('input', function (e) {
    let val = e.target.value.toUpperCase();
    if (val.length > 7) e.target.value = val.substring(0,7);
});


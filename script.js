function startSurvey() {
    var province = document.getElementById('province-select').value;
    var postalInput = document.getElementById('postal-code-input').value;
    var errorMsg = document.getElementById('error-message');

    // 1. Validate Province
    if (!province) {
        errorMsg.innerText = "Please select a province.";
        return;
    }

    // 2. Validate Postal Code (Strict Canadian Regex)
    // Rules: Alpha-Numeric-Alpha [space] Numeric-Alpha-Numeric
    // Example: M4K 1J9 or M4K1J9
    var cleanCode = postalInput.trim().toUpperCase();
    var regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

    if (!regex.test(cleanCode)) {
        errorMsg.innerText = "Invalid format. Use A1A 1A1.";
        return;
    }

    // If valid, format it nicely (M4K 1J9)
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
    var center = 400; // SVG is 800x800, so center is 400
    
    // Radii for 5, 10, 15, 20, 25 mins
    // We scale them to fit nicely in the 800px box
    // Max radius = 350px (leaving some margin)
    // Step = 70px
    var steps = [
        { min: 25, r: 350, color: 'black' },
        { min: 20, r: 280, color: 'purple' },
        { min: 15, r: 210, color: 'red' },
        { min: 10, r: 140, color: 'green' },
        { min: 5,  r: 70,  color: 'blue' }
    ];

    // Create Circles dynamically
    steps.forEach(step => {
        // Create the circle
        var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", center);
        circle.setAttribute("cy", center);
        circle.setAttribute("r", step.r);
        circle.setAttribute("stroke", step.color);
        
        // Add label (Text on top of the ring)
        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", center);
        text.setAttribute("y", center - step.r - 5); // 5px above the line
        text.textContent = `${step.min} mins`;
        text.setAttribute("fill", step.color);

        // Append to SVG
        svg.appendChild(circle);
        svg.appendChild(text);
    });
}

// Optional: Auto-format input as user types
document.getElementById('postal-code-input').addEventListener('input', function (e) {
    let val = e.target.value.toUpperCase();
    // Simply limit length for now
    if (val.length > 7) e.target.value = val.substring(0,7);
});


// --- PART 1: THE START BUTTON LOGIC ---
function startSurvey() {
    var province = document.getElementById('province-select').value;
    var postalInput = document.getElementById('postal-code-input').value;
    var errorMsg = document.getElementById('error-message');

    // 1. Validate Province
    if (!province) {
        errorMsg.innerText = "Please select a province.";
        return;
    }

    // 2. Validate Postal Code (Allows "M5V 2H1", "M5V2H1", or "M5V-2H1")
    var cleanCode = postalInput.trim().toUpperCase();
    var regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

    if (!regex.test(cleanCode)) {
        errorMsg.innerText = "Invalid format. Please use format like A1A 1A1.";
        return;
    }

    // Standardize format (add space if missing for consistency)
    if (cleanCode.length === 6) {
        cleanCode = cleanCode.substring(0, 3) + " " + cleanCode.substring(3);
    }
    
    // 3. Switch Screens (Hide Form -> Show Rings)
    document.getElementById('landing-screen').classList.add('hidden');
    document.getElementById('visualization-screen').classList.remove('hidden');

    // 4. Draw the Visualization
    drawBuffers();
}

// --- PART 2: THE VISUALIZATION LOGIC ---
function drawBuffers() {
    var svg = document.getElementById('buffer-svg');
    
    // 1. Setup Canvas
    svg.setAttribute("viewBox", "0 0 1200 1200");
    svg.innerHTML = ''; // Clear previous
    var center = 600; 

    // 2. Define Radii
    var steps = [
        { min: 25, r: 550, color: 'black' },
        { min: 20, r: 440, color: 'purple' },
        { min: 15, r: 330, color: 'red' },
        { min: 10, r: 220, color: 'green' },
        { min: 5,  r: 110,  color: 'blue' }
    ];

    // --- LAYER 1: The Concentric Circles ---
    steps.forEach(step => {
        var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", center);
        circle.setAttribute("cy", center);
        circle.setAttribute("r", step.r);
        circle.setAttribute("stroke", step.color);
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("fill", "none");
        svg.appendChild(circle);
    });

    // --- LAYER 2: The Vertical Dashed Line (Black) ---
    var vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    vLine.setAttribute("x1", center);
    vLine.setAttribute("y1", 0);
    vLine.setAttribute("x2", center);
    vLine.setAttribute("y2", 1200);
    vLine.setAttribute("stroke", "black"); 
    vLine.setAttribute("stroke-width", "4");
    vLine.setAttribute("stroke-dasharray", "15, 15"); // Dashed effect
    svg.appendChild(vLine);

    // --- LAYER 3: The Horizontal Labels ---
    
    // Helper function to create text with a white "Halo" background
    function createHaloLabel(x, y, textContent, color) {
        var group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // Halo (Eraser) - Makes text readable over lines
        var halo = document.createElementNS("http://www.w3.org/2000/svg", "text");
        halo.setAttribute("x", x);
        halo.setAttribute("y", y);
        halo.textContent = textContent;
        halo.setAttribute("fill", "white");
        halo.setAttribute("stroke", "white");
        halo.setAttribute("stroke-width", "8"); 
        halo.setAttribute("stroke-linejoin", "round");
        halo.setAttribute("dominant-baseline", "middle");
        halo.setAttribute("text-anchor", "middle");
        halo.setAttribute("font-weight", "bold");
        halo.setAttribute("font-size", "14px");

        // Actual Text
        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.textContent = textContent;
        text.setAttribute("fill", color);
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-weight", "bold");
        text.setAttribute("font-size", "14px");

        group.appendChild(halo);
        group.appendChild(text);
        return group;
    }

    steps.forEach(step => {
        var labelText = `${step.min}-mins walk`;
        
        // Label on the LEFT
        var leftLabel = createHaloLabel(center - step.r, center, labelText, step.color);
        svg.appendChild(leftLabel);

        // Label on the RIGHT
        var rightLabel = createHaloLabel(center + step.r, center, labelText, step.color);
        svg.appendChild(rightLabel);
    });
}

// Optional: Auto-limit input length to 7 characters
document.getElementById('postal-code-input').addEventListener('input', function (e) {
    let val = e.target.value.toUpperCase();
    if (val.length > 7) e.target.value = val.substring(0,7);
});

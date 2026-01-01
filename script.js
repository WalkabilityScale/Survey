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
    
    // Set ViewBox large enough for wide circles
    svg.setAttribute("viewBox", "0 0 1200 1200");
    var center = 600; 
    
    // Clear any previous drawings
    svg.innerHTML = ''; 

    // Define Radii and Colors
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
        circle.setAttribute("stroke-width", "2"); // Standard line thickness
        svg.appendChild(circle);
        
        // --- HELPER FUNCTION FOR "HALO" TEXT ---
        // This creates text with a thick white border (halo) so it stands out OVER the line
        function createHaloLabel(yPos, textContent) {
            var group = document.createElementNS("http://www.w3.org/2000/svg", "g");

            // A. The Halo (Thick white background text)
            var halo = document.createElementNS("http://www.w3.org/2000/svg", "text");
            halo.setAttribute("x", center);
            halo.setAttribute("y", yPos);
            halo.textContent = textContent;
            halo.setAttribute("fill", "white");
            halo.setAttribute("stroke", "white");
            halo.setAttribute("stroke-width", "8"); // Width of the "Eraser" effect
            halo.setAttribute("stroke-linejoin", "round");
            halo.setAttribute("dominant-baseline", "middle"); // Vertically centered
            halo.setAttribute("text-anchor", "middle");       // Horizontally centered
            halo.setAttribute("font-weight", "bold");
            halo.setAttribute("font-size", "14px");

            // B. The Actual Text (Colored text on top)
            var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", center);
            text.setAttribute("y", yPos);
            text.textContent = textContent;
            text.setAttribute("fill", step.color);
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("font-weight", "bold");
            text.setAttribute("font-size", "14px");

            group.appendChild(halo);
            group.appendChild(text);
            return group;
        }

        // The Text Content
        var labelText = `${step.min}-mins walk`;

        // 2. Add Top Label (Positioned exactly on the top line)
        var topLabel = createHaloLabel(center - step.r, labelText);
        svg.appendChild(topLabel);

        // 3. Add Bottom Label (Positioned exactly on the bottom line)
        var bottomLabel = createHaloLabel(center + step.r, labelText);
        svg.appendChild(bottomLabel);
    });
}

// Auto-format input
document.getElementById('postal-code-input').addEventListener('input', function (e) {
    let val = e.target.value.toUpperCase();
    if (val.length > 7) e.target.value = val.substring(0,7);
});

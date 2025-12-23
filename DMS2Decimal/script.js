// DOM Elements
const dmsDirectionSlider = document.getElementById('dms-direction');
const directionDisplay = document.getElementById('direction-display');
const dmsDegreesInput = document.getElementById('dms-degrees');
const dmsMinutesInput = document.getElementById('dms-minutes');
const dmsSecondsInput = document.getElementById('dms-seconds');
const formattedDmsOutput = document.getElementById('formatted-dms');
const decimalResultOutput = document.getElementById('decimal-result');

// Direction mapping for slider values
const directionMap = [
    { value: 'N', label: 'North (N)' },
    { value: 'E', label: 'East (E)' },
    { value: 'S', label: 'South (S)' },
    { value: 'W', label: 'West (W)' }
];

const decimalInput = document.getElementById('decimal-input');
const dmsResultOutput = document.getElementById('dms-result');
const copyButtons = document.querySelectorAll('.copy-btn');

// Helper function to validate numeric input
function validateNumericInput(inputElement) {
    const value = inputElement.value.trim();
    const isValid = value === '' || !isNaN(value) && isFinite(value);
    
    if (!isValid && value !== '') {
        inputElement.classList.add('error');
    } else {
        inputElement.classList.remove('error');
    }
    
    return isValid || value === '';
}

// Helper function to validate DMS inputs with direction
function validateDmsInputs(direction, degrees, minutes, seconds) {
    // Check if direction is valid
    const validDirections = ['N', 'S', 'E', 'W'];
    if (!direction || !validDirections.includes(direction)) {
        return false;
    }
    
    // Check if all values are numbers
    if (typeof degrees !== 'number' || typeof minutes !== 'number' || typeof seconds !== 'number' ||
        isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
        return false;
    }
    
    // Check valid ranges
    const maxDegrees = (direction === 'N' || direction === 'S') ? 90 : 180;
    if (degrees < 0 || degrees > maxDegrees || minutes < 0 || minutes > 59.99 || seconds < 0 || seconds > 59.99) {
        return false;
    }
    
    return true;
}

// Helper function to get parsed numeric value from input
// Treats empty or non-numeric inputs as 0
function getNumericValue(inputElement) {
    const value = inputElement.value.trim();
    // If empty, non-numeric, or NaN, return 0
    if (value === '' || isNaN(value) || !isFinite(value)) {
        return 0;
    }
    return parseFloat(value);
}

// DMS to Decimal Conversion Function
function dmsToDecimal(direction, degrees, minutes, seconds) {
    // Validate inputs
    if (!direction || typeof degrees !== 'number' || typeof minutes !== 'number' || typeof seconds !== 'number') {
        return NaN;
    }
    
    // Calculate decimal degrees
    let decimalDegrees = Math.abs(degrees) + minutes / 60 + seconds / 3600;
    
    // Apply negative sign based on direction
    if (direction === 'S' || direction === 'W') {
        decimalDegrees = -decimalDegrees;
    }
    
    return decimalDegrees;
}

// Format DMS values with appropriate symbols
function formatDMS(degrees, minutes, seconds) {
    // 移除负号，因为方向已经表示了正负
    const absDegrees = Math.abs(degrees);
    return `${absDegrees}° ${Math.abs(minutes)}' ${Math.abs(seconds).toFixed(2)}"`;
}

// Decimal to DMS Conversion Function
function decimalToDMS(decimalDegrees) {
    const absDecimal = Math.abs(decimalDegrees);
    
    // Calculate absolute value and determine direction
    let direction;
    
    // For demonstration purposes, assume lat/long based on value range
    // In a real application, you would have separate inputs for lat and long
    if (absDecimal <= 90) {
        // Latitude
        direction = decimalDegrees < 0 ? 'S' : 'N';
    } else {
        // Longitude
        direction = decimalDegrees < 0 ? 'W' : 'E';
    }
    
    // Extract degrees
    const degrees = Math.floor(absDecimal);
    
    // Extract minutes from remaining decimal
    const minutesDecimal = (absDecimal - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    
    // Extract seconds from remaining decimal
    const seconds = (minutesDecimal - minutes) * 60;
    
    return {
        direction,
        degrees: Math.abs(degrees),
        minutes: minutes,
        seconds: seconds
    };
}

// Function to update direction display based on slider value
function updateDirectionDisplay() {
    const sliderValue = parseInt(dmsDirectionSlider.value);
    if (sliderValue >= 0 && sliderValue < directionMap.length) {
        directionDisplay.textContent = directionMap[sliderValue].label;
    }
}

// Function to get current direction value from slider
function getCurrentDirectionValue() {
    const sliderValue = parseInt(dmsDirectionSlider.value);
    if (sliderValue >= 0 && sliderValue < directionMap.length) {
        return directionMap[sliderValue].value;
    }
    return 'N'; // Default to North if invalid
}

// DMS to Decimal Conversion Event Handler
function handleDmsToDecimalConversion() {
    // Validate all inputs
    const isDegreesValid = validateNumericInput(dmsDegreesInput);
    const isMinutesValid = validateNumericInput(dmsMinutesInput);
    const isSecondsValid = validateNumericInput(dmsSecondsInput);
    
    // Only proceed if all inputs are valid
    if (!isDegreesValid || !isMinutesValid || !isSecondsValid) {
        formattedDmsOutput.textContent = 'Please enter valid numeric values';
        decimalResultOutput.textContent = '';
        return;
    }
    
    // Get values from inputs
    const direction = getCurrentDirectionValue();
    const degrees = getNumericValue(dmsDegreesInput);
    const minutes = getNumericValue(dmsMinutesInput);
    const seconds = getNumericValue(dmsSecondsInput);
    
    // Validate ranges for minutes and seconds
    if (minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
        formattedDmsOutput.textContent = 'Minutes and seconds must be between 0 and 59.99';
        decimalResultOutput.textContent = '';
        return;
    }
    
    // Perform conversion
    const decimalValue = dmsToDecimal(direction, degrees, minutes, seconds);
    
    // Format and display results
    formattedDmsOutput.textContent = direction + formatDMS(degrees, minutes, seconds);
    decimalResultOutput.textContent = `${decimalValue.toFixed(6)}° (${direction})`;
}

// Decimal to DMS Conversion Event Handler
function handleDecimalToDmsConversion() {
    // Validate decimal input
    const isValid = validateNumericInput(decimalInput);
    
    if (!isValid) {
        dmsResultOutput.textContent = 'Please enter a valid decimal value';
        return;
    }
    
    // Get value from input
    const decimalDegrees = getNumericValue(decimalInput);
    
    // Perform conversion
    const dms = decimalToDMS(decimalDegrees);
    
    // Format and display result
    dmsResultOutput.textContent = dms.direction + formatDMS(dms.degrees, dms.minutes, dms.seconds);
}

// Add event listeners to input fields for real-time validation and calculation
function addInputValidationListeners() {
    const dmsInputs = [dmsDegreesInput, dmsMinutesInput, dmsSecondsInput];
    
    // Add validation and real-time calculation to DMS inputs
    dmsInputs.forEach(input => {
        input.addEventListener('input', () => {
            validateNumericInput(input);
            handleDmsToDecimalConversion(); // Real-time calculation
        });
        input.addEventListener('blur', () => validateNumericInput(input));
    });
    
    // Add validation and real-time calculation to decimal input
    decimalInput.addEventListener('input', () => {
        validateNumericInput(decimalInput);
        handleDecimalToDmsConversion(); // Real-time calculation
    });
    decimalInput.addEventListener('blur', () => validateNumericInput(decimalInput));
}

// Copy to clipboard function
function copyToClipboard(text, button) {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
        // Execute the copy command
        document.execCommand('copy');
        
        // Change button state to indicate successful copy
        button.classList.add('copied');
        const originalTitle = button.title;
        button.title = 'Copied!';
        
        // Restore button state after a delay
        setTimeout(() => {
            button.classList.remove('copied');
            button.title = originalTitle;
        }, 2000);
        
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    } finally {
        // Clean up the temporary textarea
        document.body.removeChild(textarea);
    }
}

// Handle copy button click
function handleCopyButtonClick(event) {
    const button = event.currentTarget;
    const targetId = button.getAttribute('data-target');
    const targetElement = document.getElementById(targetId);
    
    if (targetElement && targetElement.textContent.trim() !== '') {
        copyToClipboard(targetElement.textContent.trim(), button);
    } else {
        // Optional: Provide feedback if there's no content to copy
        button.title = 'Nothing to copy!';
        setTimeout(() => {
            button.title = 'Copy to clipboard';
        }, 2000);
    }
}

// Initialize the application
function init() {
    // Add event listener to direction slider for real-time updates
    dmsDirectionSlider.addEventListener('input', () => {
        updateDirectionDisplay();
        handleDmsToDecimalConversion(); // Real-time calculation when direction changes
    });
    
    // No button event listeners needed as we're using real-time calculation
    
    // Add event listener to back button
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.history.back();
        });
    }
    
    // Add event listeners to copy buttons
    copyButtons.forEach(button => {
        button.addEventListener('click', handleCopyButtonClick);
    });
    
    // Add input validation listeners with real-time calculation
    addInputValidationListeners();
    
    // Initialize direction display
    updateDirectionDisplay();
    
    // Perform initial calculation on page load
    handleDmsToDecimalConversion();
    handleDecimalToDmsConversion();
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
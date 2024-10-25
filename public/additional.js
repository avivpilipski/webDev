// additional.js

// Function to apply filter effects on images
function addImageEffects() {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    galleryItems.forEach(item => {
        item.addEventListener('mouseover', () => {
            item.style.filter = 'brightness(1.1) contrast(1.2)';
        });
        item.addEventListener('mouseout', () => {
            item.style.filter = 'none';
        });
    });
}

// Function to change background color randomly
function changeBackgroundColor() {
    const colors = [
        '#E6F3F7', '#C2E5ED', '#89CFF0', '#5DA9E9',
        '#F9E79F', '#FAD7A1', '#EAB8B1', '#D5DBDB'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.backgroundColor = randomColor;
}

// Function to create pulsing text shadows
function animateTextShadows() {
    const letters = document.querySelectorAll('.letter');
    setInterval(() => {
        letters.forEach(letter => {
            const currentShadow = getComputedStyle(letter).textShadow;
            if (currentShadow === 'none') {
                letter.style.textShadow = '2px 2px 10px rgba(255, 255, 255, 0.5)';
            } else {
                letter.style.textShadow = 'none';
            }
        });
    }, 800); // Toggle every 800ms
}

// Initialize the additional features
function initAdditionalFeatures() {
    addImageEffects();
    animateTextShadows();
    document.querySelector('.gallery-container').addEventListener('click', changeBackgroundColor);
}

// Call the initialization function
initAdditionalFeatures();

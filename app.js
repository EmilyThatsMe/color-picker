//variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range]');
const currentHexes = document.querySelectorAll('.color h2');
let initialColors;

//color generator
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    // add color to background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    // Adjust contrast
    checkTextContrast(randomColor, hexText);
  });
}

//Check if text is properly contrasted against background color
function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = 'black';
  } else {
    text.style.color = 'white';
  }
}

randomColors();

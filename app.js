//variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustButton = document.querySelectorAll('.adjust');
const lockButton = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
let initialColors;
// for local storage
let savedPalettes = [];

//Add our Event Listeners
generateBtn.addEventListener('click', randomColors);
sliders.forEach((slider) => {
  slider.addEventListener('input', hslControls);
});
colorDivs.forEach((div, index) => {
  div.addEventListener('change', () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener('click', () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener('transitionend', () => {
  const popupBox = popup.children[0];
  popup.classList.remove('active');
  popupBox.classList.remove('active');
});

adjustButton.forEach((button, index) => {
  button.addEventListener('click', () => {
    openAdjustmentPanel(index);
  });
});
closeAdjustments.forEach((button, index) => {
  button.addEventListener('click', () => {
    closeAdjustmentPanel(index);
  });
});
lockButton.forEach((button, index) => {
  button.addEventListener('click', () => {
    toggleLockButton(index);
  });
});
//functions
//color generator
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    // add it to the array
    if (div.classList.contains('locked')) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }
    initialColors.push(chroma(randomColor).hex());
    // add color to background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    // Adjust text contrast
    checkTextContrast(randomColor, hexText);
    // Initial colorize sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll('.sliders input');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  //Reset inputs
  resetInputs();
  //Check for button contrast
  adjustButton.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButton);
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

//Slider scales
function colorizeSliders(color, hue, brightness, saturation) {
  //Scale Saturation
  const noSat = color.set('hsl.s', 0);
  const fullSat = color.set('hsl.s', 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  // Scale Brightness
  const midBright = color.set('hsl.l', 0.5);
  const scaleBright = chroma.scale(['black', midBright, 'white']);
  //Update input colors saturation
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  //update input colors brightness
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
  //update input colors hue
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75,204,75), rgb(75,204,204), rgb(75,75,204), rgb(204,75,204), rgb(204,75,75))`;
}

// Drag sliders to change bright, sat, and hue
function hslControls(e) {
  const index =
    e.target.getAttribute('data-bright') ||
    e.target.getAttribute('data-sat') ||
    e.target.getAttribute('data-hue');

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set('hsl.s', saturation.value)
    .set('hsl.l', brightness.value)
    .set('hsl.h', hue.value);
  // add color to background
  colorDivs[index].style.backgroundColor = color;
  // Colorize sliders/inputs
  colorizeSliders(color, hue, brightness, saturation);
}

// update color text
function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector('h2');
  const icons = activeDiv.querySelectorAll('.controls button');
  textHex.innerText = color.hex();
  //check contrast
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll('.sliders input');
  sliders.forEach((slider) => {
    if (slider.name === 'hue') {
      const hueColor = initialColors[slider.getAttribute('data-hue')];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === 'brightness') {
      const brightColor = initialColors[slider.getAttribute('data-bright')];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === 'saturation') {
      const satColor = initialColors[slider.getAttribute('data-sat')];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement('textarea');
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  //popup animation
  const popupBox = popup.children[0];
  popup.classList.add('active');
  popupBox.classList.add('active');
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle('active');
}
function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove('active');
}
function toggleLockButton(index) {
  const div = lockButton[index].parentElement.parentElement;
  const icon = lockButton[index].firstChild;
  icon.classList.toggle('fa-lock-open');
  icon.classList.toggle('fa-lock');
  div.classList.toggle('locked');
}

//implement save to palette and local storage
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

// event listeners for local storage
saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);

//function for local storage
function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add('active');
  popup.classList.add('active');
}
function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove('active');
  popup.classList.remove('active');
}

function savePalette(e) {
  saveContainer.classList.remove('active');
  popup.classList.remove('active');
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  // generate object
  let paletteNr;
  const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
  if (paletteObjects) {
    paletteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalettes.length;
  }

  const paletteObj = { name, colors, nr: paletteNr };
  savedPalettes.push(paletteObj);
  console.log(savedPalettes);
  //save to localStorage
  saveToLocal(paletteObj);
  saveInput.value = '';
  //Generate palette for library
  const palette = document.createElement('div');
  palette.classList.add('custom-palette');
  const title = document.createElement('h4');
  title.innerText = paletteObj.name;
  const preview = document.createElement('div');
  preview.classList.add('small-preview');
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement('div');
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement('button');
  paletteBtn.classList.add('pick-palette-btn');
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = 'select';

  //attach event to btn
  paletteBtn.addEventListener('click', (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
  });

  //append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem('palettes') === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem('palettes'));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

//pop open library
function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add('active');
  popup.classList.add('active');
}
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove('active');
  popup.classList.remove('active');
}

function getLocal() {
  if (localStorage.getItem('palettes') === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    savedPalettes = [...paletteObjects];
    paletteObjects.forEach((paletteObj) => {
      //Generate palette for library
      const palette = document.createElement('div');
      palette.classList.add('custom-palette');
      const title = document.createElement('h4');
      title.innerText = paletteObj.name;
      const preview = document.createElement('div');
      preview.classList.add('small-preview');
      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement('button');
      paletteBtn.classList.add('pick-palette-btn');
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = 'select';

      //attach event to btn
      paletteBtn.addEventListener('click', (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });

      //append to library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(palette);
    });
  }
}

getLocal();
randomColors();

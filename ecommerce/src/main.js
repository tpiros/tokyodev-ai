import './style.css';

function getBirdRemovalParam() {
  return document.getElementById('removeBird').checked
    ? '/e_gen_remove:prompt_bird'
    : '';
}

function getBackgroundRemovalParam() {
  return document.getElementById('removeBackground').checked
    ? '/e_background_removal'
    : '';
}

const colourMap = {
  coral: 'FF7F50',
  '#A67B5B': 'A67B5B',
  teal: '008080',
  black: '000000',
  burlywood: 'DEB887',
};

const originalColour = '#f4a7b9';

function renderColourOptions() {
  const colourOptionsDiv = document.querySelector('.colour-options');
  colourOptionsDiv.innerHTML = ''; // Clear existing colour divs

  // Add the original colour option
  const originalColourDiv = document.createElement('div');
  originalColourDiv.classList.add('colour', 'original');
  originalColourDiv.style.backgroundColor = originalColour;
  originalColourDiv.onclick = function () {
    selectColour(this, true);
  };
  colourOptionsDiv.appendChild(originalColourDiv);

  // Add the colours from the colourMap
  for (const colourName in colourMap) {
    const hexValue = colourMap[colourName];
    const backgroundColour = colourName === '#A67B5B' ? colourName : colourName; // Use hex directly if it's the key
    const colourDiv = document.createElement('div');
    colourDiv.classList.add('colour');
    colourDiv.style.backgroundColor = backgroundColour;
    colourDiv.onclick = function () {
      selectColour(this, false);
    };
    colourOptionsDiv.appendChild(colourDiv);
  }
}

export function selectColour(element, isOriginal = false) {
  document
    .querySelectorAll('.colour')
    .forEach((colour) => colour.classList.remove('selected'));
  element.classList.add('selected');

  const imageElement = document.querySelector('.image img');
  const modalImage = document.querySelector('#imageModal img');
  const birdRemoval = getBirdRemovalParam();
  const backgroundRemoval = getBackgroundRemovalParam();

  let transformations = `${birdRemoval}`;
  let cloudinaryBaseURL = `https://res.cloudinary.com/tamas-demo/image/upload${transformations}`;
  let imageName = '/model4.jpg';

  if (!isOriginal) {
    let selectedColour = element.style.backgroundColor;
    if (selectedColour === 'rgb(166, 123, 91)') {
      selectedColour = '#A67B5B';
    }
    const hexColour = colourMap[selectedColour] || 'FF7F50';
    cloudinaryBaseURL += `/e_gen_recolor:prompt_dress;to-color_${hexColour}`;
  }

  if (backgroundRemoval) {
    cloudinaryBaseURL += `${backgroundRemoval}`;
  }

  const finalTransformations = `/f_auto,q_auto,w_390${imageName}`;
  const finalImageUrl = `${cloudinaryBaseURL}${finalTransformations}`;

  imageElement.src = finalImageUrl;
  modalImage.dataset.baseUrl = finalImageUrl.replace(`/w_390`, ''); // Store base URL without width constraint

  if (!document.getElementById('removeBackground').checked) {
    modalImage.src = `${finalImageUrl.replace(
      '/model4.jpg',
      '/c_pad,w_3413,ar_16:9,b_gen_fill/model4.jpg'
    )}`;
  } else {
    modalImage.src = modalImage.dataset.baseUrl; // Use the base URL for modal when background is removed
  }
}

export function openModal() {
  const modalImage = document.getElementById('imageModal').querySelector('img');
  const baseUrl =
    modalImage.dataset.baseUrl ||
    `https://res.cloudinary.com/tamas-demo/image/upload${getBirdRemovalParam()}${getBackgroundRemovalParam()}/f_auto,q_auto/model4.jpg`;
  if (!document.getElementById('removeBackground').checked) {
    modalImage.src = `${baseUrl.replace(
      '/model4.jpg',
      '/c_pad,w_3413,ar_16:9,b_gen_fill/model4.jpg'
    )}`;
  } else {
    modalImage.src = baseUrl; // Just show the base URL image without padding for background removal
  }
  document.getElementById('imageModal').classList.add('show');
}

export function closeModal() {
  document.getElementById('imageModal').classList.remove('show');
}

// Call renderColourOptions when the script loads to generate the colour divs
renderColourOptions();

document.querySelectorAll('.colour').forEach((colour) => {
  colour.addEventListener('click', function () {
    selectColour(this, this.classList.contains('original'));
  });
});

document.getElementById('removeBird').addEventListener('change', () => {
  const selectedElement = document.querySelector('.colour.selected');
  if (selectedElement) {
    selectColour(
      selectedElement,
      selectedElement.classList.contains('original')
    );
  } else {
    // Fallback to original if no colour is selected (shouldn't happen on initial load)
    const originalColourElement = document.querySelector('.colour.original');
    if (originalColourElement) {
      selectColour(originalColourElement, true);
    }
  }
});

let originalEnlargeIconDisplay;

document.addEventListener('DOMContentLoaded', () => {
  const enlargeIcon = document.querySelector('.image .enlarge-icon');
  if (enlargeIcon) {
    originalEnlargeIconDisplay = window.getComputedStyle(enlargeIcon).display;
  }
});

document.getElementById('removeBackground').addEventListener('change', () => {
  const enlargeIcon = document.querySelector('.image .enlarge-icon');
  if (document.getElementById('removeBackground').checked) {
    document.getElementById('removeBird').disabled = true;
    if (enlargeIcon) {
      enlargeIcon.style.display = 'none';
    }
  } else {
    document.getElementById('removeBird').disabled = false;
    if (enlargeIcon) {
      enlargeIcon.style.display = originalEnlargeIconDisplay || 'block'; // Fallback to 'block' if not found
    }
  }
  const selectedElement = document.querySelector('.colour.selected');
  if (selectedElement) {
    selectColour(
      selectedElement,
      selectedElement.classList.contains('original')
    );
  } else {
    // Fallback to original if no colour is selected
    const originalColourElement = document.querySelector('.colour.original');
    if (originalColourElement) {
      selectColour(originalColourElement, true);
    }
  }
});

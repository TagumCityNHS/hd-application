const { ipcRenderer } = require('electron');

// Toggle for alternating between default images
let imageToggle = true;

// Function to get profile image based on LRN (Learner Reference Number)
function getProfileImage(lrn) {
  return lrn ? `../pictures/${lrn}.png` : getRandomProfileImage();
}

// Function to return a random default profile image (alternates between male and female)
function getRandomProfileImage() {
  const images = ['male-default.png', 'female-default.png'];
  imageToggle = !imageToggle;
  return images[imageToggle ? 0 : 1];
}

// Function to process and crop image to a square format
function processImage(imageUrl, callback) {
  const img = new Image();
  img.crossOrigin = 'Anonymous'; // Allow cross-origin image processing

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const aspectRatio = img.width / img.height;
    let newWidth, newHeight, offsetX = 0, offsetY = 0;
    
    if (aspectRatio > 1) { // Landscape image
      newWidth = img.height;
      newHeight = img.height;
      offsetX = (img.width - img.height) / 5;
    } else if (aspectRatio < 1) { // Portrait image
      newWidth = img.width;
      newHeight = img.width;
      offsetY = (img.height - img.width) / 5;
    } else { // Square image
      newWidth = img.width;
      newHeight = img.height;
    }
    
    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.drawImage(
      img,
      offsetX, offsetY, img.width - offsetX * 5, img.height - offsetY * 5,
      0, 0, newWidth, newHeight
    );

    // Convert canvas to image blob and pass to callback
    canvas.toBlob(blob => {
      const newImageUrl = URL.createObjectURL(blob);
      callback(newImageUrl);
    }, 'image/png');
  };
  
  img.onerror = () => {
    console.error('Failed to load image:', imageUrl);
    callback(null);
  };
  
  img.src = imageUrl;
}

// Function to update profile image of a scanner element
function updateProfileImage(imageElement, lrn) {
  const imageUrl = getProfileImage(lrn);
  
  processImage(imageUrl, processedImageUrl => {
    if (processedImageUrl) {
      imageElement.src = processedImageUrl;
      imageElement.style.display = 'block';
    } else {
      console.error('Failed to process image');
    }
  });
}

// Function to highlight scanner based on status
function highlightScanner(scannerElement, status) {
  let highlightClass;
  switch (status) {
    case 'success':
      highlightClass = 'highlight-success';
      break;
    case 'error':
      highlightClass = 'highlight-error';
      break;
    default:
      highlightClass = 'highlight-waiting';
  }
  scannerElement.classList.add(highlightClass);
  setTimeout(() => {
    scannerElement.classList.remove(highlightClass);
  }, 1000);
}

// When the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  const scanners = document.querySelectorAll('.scanner');
  
  // Initialize profile images for all scanners
  scanners.forEach(scanner => {
    const profileImage = scanner.querySelector('.profile-image');
    profileImage.src = getRandomProfileImage();
    profileImage.style.display = 'block';
  });

  // Focus on scanner-5 input field
  const scanner5Input = document.querySelector('#scanner-5 .scanner-input-professional');
  if (scanner5Input) {
    scanner5Input.focus();
    
    // Listen for input changes
    scanner5Input.addEventListener('input', async () => {
      if (scanner5Input.value.length === 12) {
        const lrn = scanner5Input.value;
        scanner5Input.value = ''; // Clear input field

        // Send LRN to backend for validation
        ipcRenderer.send('validate-lrn', lrn);
      }
    });
  }

  // Handle IPC messages for updating scanner display
  ipcRenderer.on('update-text', (event, message) => {
    console.log('Message received in renderer:', message);
    try {
      const data = JSON.parse(message);
      let scannerId, status = 'waiting', lrn = '';

      if (!data.student) {
        scannerId = data.scanner;
        status = data.status || 'waiting';
      } else {
        scannerId = data.student.scanner;
        status = data.student.status || 'waiting';
        lrn = data.student.lrn;
      }

      const scannerElement = document.getElementById(`scanner-${scannerId}`);
      if (!scannerElement) {
        console.error(`No element found for scanner ID ${scannerId}`);
        return;
      }

      highlightScanner(scannerElement, status);

      const contentElement = scannerElement.querySelector('.scanner-content');
      const profileImage = scannerElement.querySelector('.profile-image');
      if (!contentElement) {
        console.error(`No content element found for scanner ID ${scannerId}`);
        return;
      }

      scannerElement.classList.remove('waiting', 'error', 'success');

      if ([
        'Student not found', 'Internal Server Error', 'SHA-256 hash not found in the data',
        'No student found. Read operation failed.', 'Scan failed. Cooldown.'
      ].includes(data.message)) {
        contentElement.innerHTML = `<p><strong>ERROR:</strong> ${data.message}</p>`;
        profileImage.src = getRandomProfileImage();
        profileImage.style.display = 'block';
        scannerElement.classList.add('error');
      } else {
        const { fname, lname, grade, section } = data.student;
        contentElement.innerHTML = `
        <p style="font-size:40px; margin-top:25px">${fname.toUpperCase()} ${lname.toUpperCase()}</p>
        <p>Grade ${grade}</p>
        <p>Class ${section}</p>
        `;
        updateProfileImage(profileImage, lrn);
        scannerElement.classList.add('success');
      }
    } catch (err) {
      console.error('Error parsing or updating:', err);
    }
  });

  // Handle validation result for scanner 5
  ipcRenderer.on('scanner5-validation-result', (event, result) => {
    console.log('Scanner 5 validation result:', result);
    const scannerElement = document.getElementById('scanner-5');
    if (!scannerElement) {
      console.error('No element found for scanner ID 5');
      return;
    }

    const profileImage = scannerElement.querySelector('.profile-image');
    const contentElement = scannerElement.querySelector('.scanner-content');
    
    if (result.message === 'Scan recorded successfully') {
      const { fname, lname, grade, section } = result.student;
      contentElement.innerHTML = `
        <p style="font-size:40px; margin-top:25px">${fname.toUpperCase()} ${lname.toUpperCase()}</p>
        <p>Grade ${grade}</p>
        <p>Class ${section}</p>
      `;
      updateProfileImage(profileImage, result.student.lrn);
      highlightScanner(scannerElement, 'success');
    } else {
      contentElement.innerHTML = `<p><strong>ERROR:</strong> ${result.message.toUpperCase()}</p>`;
      profileImage.src = getRandomProfileImage();
      highlightScanner(scannerElement, 'error');
    }
  });
});

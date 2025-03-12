/*

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RFID Scanner</title>
  <style>
    @font-face {
      font-family: 'octarine-bold';
      src: url('./octarine-bold.otf') format('opentype');
      font-weight: bold;
      font-style: normal;
    }

    body {
      font-family: Helvetica, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #f0f0f0;
      user-select: none;
    }
    h1 {
      margin-bottom: 20px;
    }
    #scanners {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 15px;
      width: 95%;
      height: 95%;
    }
    .name-container {
      max-width: 100%; 
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .scanner {
      background: linear-gradient(to right, #4A90E2 55%, rgba(255, 255, 255, 1) 30%);
      border: 5px solid #ccc;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 1.5em;
      position: relative;
      overflow: hidden;
      transition: border-color 0.3s ease;
    }
    .category {
      font-size: 0.8em;
      color: gray;
      margin: 0;
      margin-top: 20%;
    }
    .scanner.waiting {
      border-color: #318CE7;
    }
    .scanner.error {
      background-color: #e69595;
      border-color: #e23636;
    }
    .scanner.success {
      border-color: #6cc070;
    }
    .scanner::before {
      content: "";
      background-image: url('./tcnhs.png'); 
      background-size: 50%;
      background-repeat: no-repeat;
      background-position: center;
      opacity: 0.1; 
      position: absolute;
      top: 50%;
      left: 25%;
      transform: translate(-25%, -50%);
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    .scanner-number {
      position: absolute;
      top: 10px;
      left: 10px; 
      color: #fff;
      font-size: 1.2em;
      font-weight: bold;
      font-family: 'octarine-bold';
      z-index: 2;
    }
    .scanner-content {
      position: absolute;
      z-index: 2;
      width: 50%;
      top: 10%;
      height: 50%;
      right: 5%; 
      text-align: right; 
    }
    .scanner-input {
      width: 80%; 
      height: 30%;
      padding: 8px;
      margin-bottom: 10px;
      font-size: 1em;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    .scanner-input-professional {
      width: 38%; 
      padding: 8px;
      margin-bottom: 20px;
      font-size: 1em;
      border: 2px solid #007FFF;
      border-radius: 8px;
      box-sizing: border-box;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      position: absolute;
      top: 40px; 
      left: 78%;
      transform: translateX(-50%);
      z-index: 2;
    }

    .scanner-input-professional:focus {
      border-color: #0056b3;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      outline: none;
    }
    .scanner-content p {
      font-weight: 600;
      margin-top: 3px; 
    }
    .profile-image {
      width: 55%;
      height: 100%;
      left: 0%; 
      object-fit: cover;
      position: absolute;
      bottom: 0;
      z-index: 1;
      display: none;
      opacity: 1;
    }
    @keyframes scan-highlight-waiting {
      0% {
        border-color: #ffeb3b;
        background-color: #fffde7;
      }
      100% {
        border-color: #4a90e2;
        background-color: #fff;
      }
    }
    @keyframes scan-highlight-success {
      0% {
        border-color: #6cc070;
        background-color: #e8f5e9;
      }
      100% {
        border-color: #4a90e2;
        background-color: #fff;
      }
    }
    @keyframes scan-highlight-error {
      0% {
        border-color: #e23636;
        background-color: #f04962;
      }
      100% {
        border-color: #4a90e2;
        background-color: #fff;
      }
    }
    .scanner.highlight-waiting {
      animation: scan-highlight-waiting 1s ease;
    }
    .scanner.highlight-success {
      animation: scan-highlight-success 1s ease;
    }
    .scanner.highlight-error {
      animation: scan-highlight-error 1s ease;
    }
    .waiting-text {
      position: absolute;
      top: 80%;
      left: 70%;
      transform: translate(-50%, -50%);
      text-align: center;
      margin: 0; 
    }
    .scanner.error {
      background: linear-gradient(to right, #e23636 55%, rgba(255, 255, 255, 1) 30%); 
      border-color: #e23636;
    }
    .error-text {
      position: absolute;
      top: 80%;
      left: 70%;
      transform: translate(-50%, -50%);
      text-align: center;
      margin: 0; 
      font-size: 1.5em; 
      color: red; 
    }
  </style>
</head>
<body>
  <div id="scanners">
    <div id="scanner-0" class="scanner waiting">
      <div class="scanner-number">1</div>
      <div class="scanner-content">
        <p class="waiting-text">Waiting for Scan</p>
      </div>
      <img class="profile-image" src="" alt="Profile Image">
    </div>
    <div id="scanner-1" class="scanner waiting">
      <div class="scanner-number">2</div>
      <div class="scanner-content">
        <p class="waiting-text">Waiting for Scan</p>
      </div>
      <img class="profile-image" src="" alt="Profile Image">
    </div>
    <div id="scanner-2" class="scanner waiting">
      <div class="scanner-number">3</div>
      <div class="scanner-content">
        <p class="waiting-text">Waiting for Scan</p>
      </div>
      <img class="profile-image" src="" alt="Profile Image">
    </div>
    <div id="scanner-3" class="scanner waiting">
      <div class="scanner-number">4</div>
      <div class="scanner-content">
        <p class="waiting-text">Waiting for Scan</p>
      </div>
      <img class="profile-image" src="" alt="Profile Image">
    </div>
    <div id="scanner-4" class="scanner waiting">
      <div class="scanner-number">5</div>
      <div class="scanner-content">
        <p class="waiting-text">Waiting for Scan</p>
      </div>
      <img class="profile-image" src="" alt="Profile Image">
    </div>
    <div id="scanner-5" class="scanner waiting">
      <div class="scanner-number">6</div>
      <div class="scanner-content2">
        <input type="text" class="scanner-input-professional" placeholder="Enter ID" maxlength="12">
      </div>
        <div class="scanner-content">
        <p class="waiting-text">Waiting for Scan</p>
      </div>
      <img class="profile-image" src="" alt="Profile Image">
    </div>
  </div>
  <script src="renderer.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const waitingTexts = document.querySelectorAll('.waiting-text');
      waitingTexts.forEach(text => {
        let dotCount = 0;
        let increasing = true;
        setInterval(() => {
          if (increasing) {
            dotCount++;
            if (dotCount === 3) increasing = false;
          } else {
            dotCount--;
            if (dotCount === 0) increasing = true;
          }
          text.textContent = 'Waiting for Scan' + '.'.repeat(dotCount);
        }, 500);
      });
    });
  </script>
</body>
</html>

    CODE ABOVE IS THE CODE FOR THE HTML
    WHILE THE CODE BELOW IS THE BACKBONE CODE FOR IT!
*/

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

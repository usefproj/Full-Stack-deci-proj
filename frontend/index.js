const uploadForm = document.getElementById('upload-form');
const uploadResult = document.getElementById('upload-result');
const imgContainer = document.querySelector('#img-container');
const preview = document.querySelector('#resized-image');
const resizedContainer = document.querySelector('#resized-container');

let lastObjectURL = null;
const LOCAL_STORAGE_KEY = 'resizedImagesData';
const MAX_STORED_IMAGES = 5;

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  uploadResult.textContent = 'Uploading...';

  const formData = new FormData(uploadForm);
  try {
    const resp = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!resp.ok) throw new Error(resp.statusText);
    const body = await resp.json();

    const apiURL = body.url;

    uploadResult.innerHTML = `
      <p class="text-green-600">Upload successful!</p>
      <p>Access your uploaded image here:</p>
      <a href="${apiURL}" target="_blank" class="text-teal-600 underline">
        ${apiURL}
      </a>
    `;

    loadGallery();
  } catch (err) {
    console.error(err);
    uploadResult.innerHTML = `<p class="text-red-600">Upload failed: ${err.message}</p>`;
  }
});

async function loadGallery() {
  imgContainer.innerHTML = '';
  try {
    const response = await fetch('http://localhost:3000/api/images/list');
    if (!response.ok) throw new Error('Failed to fetch image list');
    const data = await response.json();

    if (data.length === 0) {
      imgContainer.innerHTML = '<p>No images found on the server.</p>';
      return;
    }

    data.forEach((imgName) => {
      const card = document.createElement('div');
      card.className =
        'cards rounded-md bg-white/50 backdrop-blur-md md:w-1/4 min-h-20 w-full flex justify-center items-center';

      const img = document.createElement('img');
      img.className = 'rounded-md cursor-pointer object-cover max-h-48';
      img.src = `http://localhost:3000/api/images/${imgName}`;
      img.alt = imgName;

      img.addEventListener('click', async (event) => {
        event.preventDefault();
        const w = parseInt(
          prompt(`Enter new width (px) for ${imgName}:`, '300'),
          10,
        );
        const h = parseInt(
          prompt(`Enter new height (px) for ${imgName}:`, '100'),
          10,
        );
        if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
          alert('Invalid dimensions.');
          return;
        }

        if (lastObjectURL) {
          URL.revokeObjectURL(lastObjectURL);
          lastObjectURL = null;
        }

        const storedImages = getStoredResizedImages();
        const storedMatch = storedImages.find(
          (item) =>
            item.name === imgName && item.width === w && item.height === h,
        );

        if (storedMatch) {
          console.log('Loading resized image from local storage.');
          displayResizedImage(storedMatch.dataUrl, imgName, w, h);
        } else {
          console.log('Resizing image on server and storing.');
          try {
            const resp = await fetch(
              `http://localhost:3000/api/resize/${imgName}?width=${w}&height=${h}`,
            );
            if (!resp.ok) {
              const errorText = await resp.text();
              throw new Error(
                `Resize failed: ${resp.status} ${resp.statusText} - ${errorText}`,
              );
            }
            const blob = await resp.blob();

            const reader = new FileReader();
            reader.onloadend = () => {
              const dataUrl = reader.result;
              storeResizedImage({
                name: imgName,
                width: w,
                height: h,
                dataUrl: dataUrl,
                timestamp: Date.now(),
              });
              displayResizedImage(dataUrl, imgName, w, h);
            };
            reader.onerror = (err) => {
              console.error('Error reading blob:', err);
              alert('Failed to read image data.');
            };
            reader.readAsDataURL(blob);
          } catch (err) {
            console.error('Resize or fetch failed:', err);
            alert(`Failed to resize image: ${err.message}`);
          }
        }
      });

      card.appendChild(img);
      imgContainer.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load gallery:', err);
    imgContainer.innerHTML = `<p class="text-red-600">Failed to load images: ${err.message}</p>`;
  }
}

function getStoredResizedImages() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error retrieving data from localStorage', e);
    return [];
  }
}

function storeResizedImage(imageData) {
  const storedImages = getStoredResizedImages();

  const filteredImages = storedImages.filter(
    (item) =>
      !(
        item.name === imageData.name &&
        item.width === imageData.width &&
        item.height === imageData.height
      ),
  );

  filteredImages.push(imageData);

  while (filteredImages.length > MAX_STORED_IMAGES) {
    filteredImages.shift();
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filteredImages));
  } catch (e) {
    console.error('Error saving data to localStorage', e);
    alert(
      'Could not save resized image to local storage. Storage might be full.',
    );
  }
}

function displayResizedImage(dataUrl, originalName, width, height) {
  resizedContainer.querySelectorAll('p').forEach((p) => p.remove());

  preview.src = dataUrl;
  preview.alt = `Resized ${originalName} (${width}x${height})`;
  preview.classList.remove('hidden');

  const infoText = document.createElement('p');
  infoText.textContent = `Displaying: ${originalName} (${width}x${height})`;
  infoText.className = 'text-sm text-gray-700 mt-2';
  resizedContainer.appendChild(infoText);
}

loadGallery();

function loadLatestStoredImage() {
  const storedImages = getStoredResizedImages();
  if (storedImages.length > 0) {
    const latestImage = storedImages[storedImages.length - 1];
    console.log('Loading latest stored image on page load.');
    displayResizedImage(
      latestImage.dataUrl,
      latestImage.name,
      latestImage.width,
      latestImage.height,
    );
  } else {
    preview.classList.add('hidden');
    if (!resizedContainer.querySelector('p')) {
      const message = document.createElement('p');
      message.textContent =
        'Click an image to resize it and see the preview here.';
      message.className = 'text-gray-500 italic';
      resizedContainer.appendChild(message);
    }
  }
}

loadLatestStoredImage();

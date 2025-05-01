const uploadForm = document.getElementById('upload-form');
const uploadResult = document.getElementById('upload-result');
const imgContainer = document.querySelector('#img-container');
const preview = document.querySelector('#resized-image');

let lastObjectURL = null;

// Handle upload form submission via Fetch
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

    // Server should return { filename: 'foo.jpg', url: '/api/images/foo.jpg' }
    const apiURL = body.url;

    uploadResult.innerHTML = `
      <p class="text-green-600">Upload successful!</p>
      <p>Access your uploaded image here:</p>
      <a href="${apiURL}" target="_blank" class="text-teal-600 underline">
        ${apiURL}
      </a>
    `;

    // Optionally refresh gallery
    loadGallery();
  } catch (err) {
    console.error(err);
    uploadResult.innerHTML = `<p class="text-red-600">Upload failed: ${err.message}</p>`;
  }
});

// Existing code to fetch thumbnail list and handle resize
async function loadGallery() {
  imgContainer.innerHTML = '';
  const response = await fetch('http://localhost:3000/api/images/list');
  const data = await response.json();

  data.forEach((imgName) => {
    const card = document.createElement('div');
    card.className =
      'cards rounded-md bg-white/50 backdrop-blur-md md:w-1/4 min-h-20 w-full flex justify-center items-center';

    const img = document.createElement('img');
    img.className = 'rounded-md cursor-pointer';
    img.src = `http://localhost:3000/api/images/${imgName}`;
    img.alt = imgName;

    img.addEventListener('click', async (event) => {
      event.preventDefault();
      const w = parseInt(prompt('Enter new width (px):', '300'), 10);
      const h = parseInt(prompt('Enter new height (px):', '100'), 10);
      if (!w || !h) {
        alert('Invalid dimensions.');
        return;
      }

      if (lastObjectURL) URL.revokeObjectURL(lastObjectURL);
      const resp = await fetch(
        `http://localhost:3000/api/resize/${imgName}?width=${w}&height=${h}`,
      );
      if (!resp.ok) {
        console.error('Resize failed');
        return;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      lastObjectURL = url;

      preview.src = url;
      preview.classList.remove('hidden');
      document.querySelector('#resized-container p')?.remove();
    });

    card.appendChild(img);
    imgContainer.appendChild(card);
  });
}

// Initial gallery load
loadGallery();

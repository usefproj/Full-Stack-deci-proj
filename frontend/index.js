const imgContainer = document.querySelector('#img-container');

const images = async () => {
  const response = await fetch('http://localhost:3000/api/images/list');
  const data = await response.json();
  data.forEach(async (img) => {
    imgContainer.innerHTML += `<div
          class="cards rounded-md bg-white/50 backdrop-blur-md md:w-1/4 min-h-20 w-full flex justify-center items-center"
        >
          <img
            class="rounded-md"
            src="http://localhost:3000/api/images/${img}"
            alt="${img}"
            onClick="select(this)"
          />
        </div>`;
  });
};
images();
async function select(e) {
  const fileName = e.alt;
  const response = await fetch(
    `http://localhost:3000/api/resize/${fileName}/?width=300&height=100`,
  );
  const data = await response.json();
}

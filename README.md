# Image Processing Full-Stack Application

This project is a full-stack web application that allows users to upload, view, and resize images. The backend is built with Node.js and Express, utilizing Multer for file uploads and Sharp for image processing. The frontend is a simple HTML page with JavaScript for interacting with the backend API.

## Features

- Upload JPG images.
- View a gallery of uploaded images.
- Resize images to specified dimensions.
- Client-side caching of resized images using Local Storage.

## Technologies Used

**Backend:**

- Node.js
- Express.js
- Multer (for handling file uploads)
- Sharp (for image resizing)
- TypeScript

**Frontend:**

- HTML5
- CSS (Tailwind CSS)
- JavaScript

**Development Tools:**

- TypeScript
- ESLint (for linting)
- Prettier (for code formatting)
- Jasmine (for testing)
- Nodemon (for development server)
- Supertest (for API testing)
- Mock-fs (for file system mocking in tests)

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Build the TypeScript code:**
    ```bash
    npm run build
    ```

## Running the Application

1.  **Start the development server:**
    ```bash
    npm run serve
    ```
    This will start the server using `nodemon`, which automatically restarts the server when code changes are detected.
2.  Open `index.html` in your web browser to access the frontend.

The backend server runs on `http://localhost:3000`.

## API Endpoints

- `POST /api/upload`: Upload a JPG image. Requires `multipart/form-data` with a field named `image`.
- `GET /api/images/list`: Get a JSON array of available image filenames in the `images` directory.
- `GET /api/images/:filename`: Serve an original image from the `images` directory.
- `GET /api/resize/:filename?width=<width>&height=<height>`: Resize the specified image to the given width and height. Returns the resized image file. Resized images are cached in the `output-images` directory.

## Usage

1.  **Upload Images:** Use the form on the `index.html` page to select a JPG image and click "Upload". The uploaded image will appear in the gallery.
2.  **View Gallery:** The gallery section displays all uploaded images.
3.  **Resize Images:** Click on an image in the gallery. You will be prompted to enter the desired width and height. After entering valid dimensions, the resized image will be displayed below the gallery. Resized images are cached in your browser's Local Storage for quicker access on subsequent resizes of the same image to the same dimensions.

## Development Scripts

- `npm run build`: Compiles TypeScript files to JavaScript.
- `npm run test`: Runs the Jasmine test suite.
- `npm run serve`: Starts the development server with Nodemon.
- `npm run lint`: Runs ESLint to check for code style issues and automatically fixes them.
- `npm run format`: Runs Prettier to format code files.

## Testing

The project includes unit tests using Jasmine and Supertest.

- `npm run test` will execute the tests located in the `spec` directory.

## Linting and Formatting

ESLint and Prettier are configured to maintain code quality and consistency.

- `npm run lint`
- `npm run format`

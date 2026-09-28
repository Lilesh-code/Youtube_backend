# YouTube Twitter Backend

A Node.js + Express + MongoDB backend project inspired by a YouTube-style social video platform. The API supports user registration, login/logout, JWT-based authentication, profile updates, avatar and cover image uploads, channel profile lookup, watch history management, and subscription relationships.

This project is built as a backend foundation for a content-sharing application where users can manage accounts and interact with channel data.

## Project Overview

This server exposes a REST API under the `/api/v1/users` base path and uses:

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for media uploads
- Multer for file handling
- Cookie-based access and refresh tokens
- CORS support for frontend integration

## Features

- User registration with avatar and optional cover image
- User login with username or email
- JWT access token and refresh token generation
- Secure logout with token invalidation
- Password hashing using bcrypt
- Authenticated profile access and account updates
- Avatar and cover image update endpoints
- Channel profile retrieval
- Watch history tracking
- Subscription schema for subscriber/channel relationships
- Cloudinary media upload and cleanup utilities
- Standardized API response and error handling

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication & Security
- JWT
- bcrypt
- cookie-parser
- CORS

### File Uploads
- Multer
- Cloudinary

### Utilities
- Async wrapper for controller error handling
- Custom API response and error classes
- Environment-based configuration with `dotenv`

## Project Structure

```bash
youtube_twitter/
├── public/
│   └── temp/
├── postman/
│   ├── collections/
│   ├── documents/
│   ├── environments/
│   ├── flows/
│   ├── globals/
│   ├── mocks/
│   └── specs/
├── src/
│   ├── controllers/
│   │   └── user.controllers.js
│   ├── db/
│   │   └── index.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   ├── models/
│   │   ├── subscription.models.js
│   │   ├── user.models.js
│   │   └── video.models.js
│   ├── routes/
│   │   └── user.routes.js
│   ├── utils/
│   │   ├── apierror.js
│   │   ├── apiresponse.js
│   │   ├── asynchandler.js
│   │   └── cloudinary.js
│   ├── app.js
│   ├── constant.js
│   └── index.js
├── .env.example
├── package.json
├── Readme.md
├── postman.json
└── .gitignore
```

> Note: The project currently does not include a `.env.example` file in the repository, but the required variables are described below.

## Installation

1. Clone the repository:

```bash
git clone <repo-url>
cd youtube_twitter
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root and add the required environment variables.

4. Start the development server:

```bash
npm run dev
```

The server will run with Nodemon and automatically restart on code changes.

## Environment Variables

Create a `.env` file with the following values:

```env
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=my_database

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Explanation

- `PORT`: Port used by the Express server
- `NODE_ENV`: Environment mode for cookies and app behavior
- `CORS_ORIGIN`: Allowed frontend origin
- `MONGODB_URI`: MongoDB connection URL
- `DB_NAME`: Database name used by the project
- `ACCESS_TOKEN_SECRET`: Secret for signing access tokens
- `REFRESH_TOKEN_SECRET`: Secret for signing refresh tokens
- `ACCESS_TOKEN_EXPIRY`: Access token lifetime
- `REFRESH_TOKEN_EXPIRY`: Refresh token lifetime
- `CLOUDINARY_*`: Credentials for uploading media files

## Database Connection

The application connects to MongoDB in `src/db/index.js` using Mongoose. The database name is defined in `src/constant.js`:

```js
export const DB_NAME = "my_database";
```

Connection is established when the app boots in `src/index.js`.

## Server Setup

The Express app is created in `src/app.js` and includes:

- CORS configuration
- JSON body parsing
- URL-encoded form parsing
- Static file hosting from `public/`
- Cookie parsing
- User route mounting at `/api/v1/users`

```js
app.use("/api/v1/users", userRouter);
```

## API Endpoints

Base URL:

```text
http://localhost:8000/api/v1/users
```

### Authentication & User Routes

#### 1. Register User

```http
POST /api/v1/users/register
```

Request body:

- `fullname`
- `email`
- `username`
- `password`
- `avatar` file (required)
- `coverimage` file (optional)

This route uses `multer` to accept uploaded files and Cloudinary to store media.

#### 2. Login User

```http
POST /api/v1/users/login
```

Request body:

```json
{
  "email": "user@example.com",
  "username": "johnsmith",
  "password": "YourPassword123"
}
```

Either `email` or `username` is accepted, but password is required.

#### 3. Logout User

```http
POST /api/v1/users/logout
```

Requires JWT authentication via `verifyJwt` middleware.

#### 4. Refresh Access Token

```http
POST /api/v1/users/refresh-token
```

Uses refresh token from cookies or request body.

#### 5. Change Password

```http
POST /api/v1/users/change-password
```

Protected route.

#### 6. Get Current User

```http
GET /api/v1/users/current-user1
```

Protected route.

#### 7. Update Account Details

```http
PATCH /api/v1/users/update-account
```

Protected route.

#### 8. Update Avatar

```http
PATCH /api/v1/users/avatar
```

Protected route with `upload.single("avatar")`.

#### 9. Update Cover Image

```http
PATCH /api/v1/users/coverImage
```

This route is defined in the code but currently has a path inconsistency (`coverImage` is missing a leading slash). It should be reviewed when integrating with the frontend.

#### 10. Get Channel Profile

```http
GET /api/v1/users/c/:username
```

Protected route; used to fetch a specific channel profile.

#### 11. Get Watch History

```http
GET /api/v1/users/History
```

Protected route.

## Authentication Flow

The project uses JWT-based authentication with two tokens:

- Access token: used for most protected API routes
- Refresh token: used to generate a new access token when needed

The middleware in `src/middlewares/auth.middleware.js` reads the access token from:

- the `accessToken` cookie, or
- the `Authorization` header (`Bearer <token>`)

It then validates the token and attaches the authenticated user to `req.user1`.

## Models

### User Model

File: `src/models/user.models.js`

Fields include:

- `username`
- `email`
- `fullname`
- `avatar`
- `coverImage`
- `watchHistory`
- `password`
- `refreshToken`
- timestamps

The user schema includes:

- password hashing before save
- `ispasswordcorrect()` method for validating login attempts
- `GenerateAccessToken()` method
- `GenerateRefreshToken()` method

### Video Model

File: `src/models/video.models.js`

Includes the fields:

- `videofile`
- `thumbnail`
- `title`
- `description`
- `duration`
- `views`
- `published`
- `owner`

This model is prepared for a video platform workflow and includes aggregate pagination support.

### Subscription Model

File: `src/models/subscription.models.js`

Tracks relationships between:

- `subscriber`
- `channel`

This supports a YouTube-style subscription mechanism.

## Middleware

### Authentication Middleware

`src/middlewares/auth.middleware.js`

Validates incoming JWT tokens and ensures the user is authenticated before allowing access to protected endpoints.

### Multer Middleware

`src/middlewares/multer.middleware.js`

Handles multi-part form uploads and saves files to `public/temp` before uploading to Cloudinary.

## Utilities

### `asyncHandler`

`src/utils/asynchandler.js`

Wraps async route handlers so promise rejections are passed to Express error middleware.

### `APIRESPONSE`

`src/utils/apiresponse.js`

Standardizes successful response data.

### `APIERROR`

`src/utils/apierror.js`

Standardizes error responses and HTTP status usage.

### Cloudinary

`src/utils/cloudinary.js`

Uploads files to Cloudinary and removes local temp files after upload. It also contains a delete utility for removing Cloudinary resources.

## Run the Project

Development mode:

```bash
npm run dev
```

This uses:

```bash
nodemon -r dotenv/config src/index.js
```

## Expected Startup Behavior

When the database is connected successfully, the app logs a MongoDB connection message and starts the server on the configured port.

Example:

```bash
server is running on port 8000
```

## Notes & Caveats

This project is a solid backend starter, but a few implementation details should be reviewed before production use:

- Some route paths are inconsistent, such as `/coverImage` missing a leading `/`
- Some controller variable names are inconsistent (`req.user1` vs `req.user`)
- The JWT payload includes objects rather than plain values in some places
- The `userSchema` lowercases `fullname`, which may not always be desirable for display names
- `video.models.js` seems to define `thumbnail` twice; this should be cleaned up
- The `routes/user.routes.js` and controller logic may require frontend integration testing to confirm exact behavior

## Future Improvements

Possible enhancements for this project:

- Add video upload and video management APIs
- Add comments, likes, and dislikes
- Add subscription endpoints for follow/unfollow actions
- Implement CRUD for videos and channel content
- Add validation schemas with Joi or Zod
- Add pagination and filtering for user feeds
- Improve file upload validation and error messaging
- Add unit and integration testing

## Useful Links

- Model design reference: https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj
- Express documentation: https://expressjs.com/
- Mongoose documentation: https://mongoosejs.com/
- Cloudinary documentation: https://cloudinary.com/documentation
- JWT docs: https://jwt.io/

## Summary

This project is a backend-driven social and video platform built around user authentication, profile management, media uploads, and subscription data. It is a good starting point for building a YouTube-style application and can be expanded with complete content, video upload, and social features.

If you want, I can also create a more polished version of this README in a specific style such as:

- startup-friendly for GitHub
- technical architecture documentation
- frontend integration guide
- production-ready project README with badges and screenshots
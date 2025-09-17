# Social Network Platform

A modern social networking platform built with React.js, Node.js/Express, and PostgreSQL. This is a complete rebuild of HumHub with the same core features and functionality.

## Features

- **User Management**: Registration, authentication, profiles, and user following
- **Spaces/Communities**: Create and join spaces with different visibility and join policies
- **Posts & Comments**: Create posts, comment on posts, like posts and comments
- **Activity Feed**: Real-time feed of posts from followed users and joined spaces
- **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

### Frontend
- **React.js 19** (JavaScript, not TypeScript)
- **React Router** for navigation
- **Axios** for API communication
- **Vite** for fast development and building

### Backend
- **Node.js** with **Express.js**
- **PostgreSQL** database
- **Sequelize** ORM
- **JWT** for authentication
- **bcryptjs** for password hashing

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## Installation & Setup

### 1. Clone and Navigate

```bash
# If you cloned from GitHub
git clone <repository-url>
cd humhub-clone

# Or if you're in the existing directory
cd HumHub
```

### 2. Database Setup

#### Option A: Create Database Manually
1. Open PostgreSQL command line or pgAdmin
2. Create a new database:
```sql
CREATE DATABASE humhub_clone;
```

#### Option B: Use the Automated Script
```bash
cd server
npm run db:create
```

### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Edit the .env file with your database credentials
# Update these values in server/.env:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=humhub_clone
# DB_USER=your_postgres_username
# DB_PASSWORD=your_postgres_password
# JWT_SECRET=your_secure_jwt_secret_here

# Create database tables and seed with demo data
npm run db:seed

# Start the development server
npm run dev
```

The backend will be available at: `http://localhost:5000`

### 4. Frontend Setup

Open a new terminal window:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create environment file (optional)
copy .env.example .env

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## Demo Accounts

After running the seed script, you can use these demo accounts:

- **Admin**: `admin@humhub.test` / `password123`
- **John Doe**: `john@humhub.test` / `password123`
- **Jane Smith**: `jane@humhub.test` / `password123`
- **Mike Johnson**: `mike@humhub.test` / `password123`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### User Endpoints
- `GET /api/users` - Get list of users
- `GET /api/users/:identifier` - Get user by ID or username
- `PUT /api/users/profile` - Update current user profile
- `POST /api/users/:userId/follow` - Follow/unfollow user

### Space Endpoints
- `GET /api/spaces` - Get list of spaces
- `GET /api/spaces/:identifier` - Get space by ID or URL
- `POST /api/spaces` - Create new space
- `POST /api/spaces/:spaceId/join` - Join space
- `POST /api/spaces/:spaceId/leave` - Leave space
- `POST /api/spaces/:spaceId/follow` - Follow/unfollow space

### Post Endpoints
- `GET /api/posts` - Get posts feed
- `GET /api/posts/:postId` - Get single post
- `POST /api/posts` - Create new post
- `POST /api/posts/:postId/comments` - Add comment to post
- `POST /api/posts/:objectModel/:objectId/like` - Like/unlike post or comment

## Environment Variables

### Server (.env)
```bash
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=humhub_clone
DB_USER=postgres
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_jwt_secret_here

# CORS
CLIENT_URL=http://localhost:3000
```

### Client (.env)
```bash
VITE_API_URL=http://localhost:5000/api
```

## Database Schema

The application uses the following main tables:

- **users** - User accounts and profiles
- **spaces** - Communities/groups
- **posts** - User posts
- **comments** - Post comments
- **memberships** - User-space relationships
- **follows** - User and space following
- **likes** - Post and comment likes

## Development Scripts

### Backend (server/)
- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run db:create` - Create PostgreSQL database
- `npm run db:seed` - Create tables and seed with demo data

### Frontend (client/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm start` - Alias for dev

## Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Use a production PostgreSQL database
3. Set a secure `JWT_SECRET`
4. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start app.js --name "humhub-api"
```

### Frontend Deployment
1. Build the React app:
```bash
npm run build
```
2. Serve the `dist` folder using a web server (Nginx, Apache, or static hosting)

### Environment-specific Configuration
- Update `CLIENT_URL` in backend .env to match your domain
- Update `VITE_API_URL` in frontend .env to match your API domain

## Troubleshooting

### Common Issues

**Database Connection Error**
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

**CORS Errors**
- Ensure `CLIENT_URL` in server `.env` matches your frontend URL
- Check that both servers are running

**Module Not Found Errors**
- Run `npm install` in both client and server directories
- Delete `node_modules` and `package-lock.json`, then reinstall

**Port Already in Use**
- Change PORT in server `.env` to an available port
- Kill existing processes: `npx kill-port 5000`

### Database Reset
To completely reset the database:
```bash
cd server
npm run db:seed
```
This will drop all tables and recreate them with fresh demo data.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Original HumHub project for inspiration
- React.js and Node.js communities
- All contributors and testers

# SaaS Platform - Social Network & Membership Management

A comprehensive SaaS platform built with React.js, Node.js/Express, and PostgreSQL. Features include social networking, membership management, career center, and payment processing.

## Features

### Core Social Features
- **User Management**: Registration, authentication, profiles, and user following
- **Spaces/Communities**: Create and join spaces with different visibility and join policies
- **Posts & Comments**: Create posts, comment on posts, like posts and comments
- **Activity Feed**: Real-time feed of posts from followed users and joined spaces

### Membership Management
- **Membership Plans**: Create and manage subscription plans with different pricing tiers
- **Application Forms**: Customizable membership application forms with dynamic fields
- **Payment Processing**: Integrated payment system with scheduled payments and debt tracking
- **Digital Cards**: Generate and manage digital membership cards
- **Coupons & Discounts**: Create and manage discount coupons for memberships

### Career Center
- **Job Board**: Post and browse job opportunities
- **Company Profiles**: Company-specific dashboards and analytics
- **Individual Profiles**: Job seeker profiles with resume management
- **Application Tracking**: Track job applications and manage hiring process

### Additional Features
- **Responsive Design**: Modern, mobile-friendly interface
- **File Uploads**: Support for profile images, documents, and attachments
- **Email Notifications**: Automated email system for various events
- **Crypto Payments**: Support for cryptocurrency payments

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

## Getting Started

This section explains exactly how someone can clone the project from GitHub and run it on their machine.

You have **two options**:
- **Option 1 (Recommended)**: Run everything with Docker (single command, minimal manual setup)
- **Option 2**: Run backend and frontend manually without Docker

### Option 1 – Run with Docker (Recommended)

#### 1. Install prerequisites
- **Docker Desktop** (includes Docker & Docker Compose)
- **Git**

#### 2. Clone the repository

```bash
git clone <your-github-repo-url>   # e.g. https://github.com/your-user/saas_platform.git
cd saas_platform
```

#### 3. Start the full stack with one command

On **Windows PowerShell** (from the project root):

```powershell
.\start-dev.ps1
```

This will:
- Build and start the **PostgreSQL** database
- Build and start the **backend API**
- Build and start the **React frontend**

#### 4. Open the app in your browser
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Database**: `localhost:5432`

At this point you can log in with the demo accounts listed below and use the system.

### Option 2 – Run Without Docker (Manual Setup)

Use this if you prefer to run Node.js and PostgreSQL directly on your machine.

#### 1. Install prerequisites
- **Node.js** v20 or higher
- **npm** (comes with Node) or **yarn**
- **PostgreSQL** v12 or higher
- **Git**

#### 2. Clone the repository

```bash
git clone <your-github-repo-url>
cd saas_platform
```

#### 3. Create the PostgreSQL database

**Option A – Manually via psql / pgAdmin**

```sql
CREATE DATABASE saas_platform;
```

**Option B – Via script (from `server` folder)**

```bash
cd server
npm install
npm run db:create
cd ..
```

#### 4. Configure and run the backend (server)

```bash
cd server

# Install dependencies (if you didn't already)
npm install

# Create environment file
copy .env.example .env   # On Windows (PowerShell or cmd)
# OR
cp .env.example .env     # On macOS / Linux
```

Edit `server/.env` and make sure at least these values are set correctly:
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=saas_platform`
- `DB_USER=<your_postgres_username>`
- `DB_PASSWORD=<your_postgres_password>`
- `JWT_SECRET=<a-long-random-secret>`

Then run database migrations/seed data and start the API:

```bash
npm run db:seed   # creates tables and demo data
npm run dev       # start backend on http://localhost:5000
```

#### 5. Configure and run the frontend (client)

Open a **new terminal** in the project root and run:

```bash
cd client

# Install dependencies
npm install

# Create frontend environment file (optional but recommended)
copy .env.example .env   # Windows
# OR
cp .env.example .env     # macOS / Linux
```

Make sure `client/.env` points to your local API:

```bash
VITE_API_URL=http://localhost:5000/api
```

Then start the React dev server:

```bash
npm run dev
```

The frontend will be available at: `http://localhost:3000`

---

## Development Features

### Docker Development Mode
- **Live Code Updates**: Changes to source code are immediately reflected in containers
- **Hot Module Replacement**: Frontend updates without page refresh
- **Auto-restart**: Backend automatically restarts on code changes
- **Volume Mounts**: Source code is mounted for instant synchronization

### Available Scripts
- `.\start-dev.ps1` - Start development environment with Docker (full stack)
- `.\start-prod.ps1` - Start production environment with Docker
- `docker-compose up --build` - Manual Docker startup
- `docker-compose -f docker-compose.prod.yml up --build -d` - Production mode

## Demo Accounts

After running the seed script, you can use these demo accounts:

- **Admin**: `admin@saas.test` / `password123`
- **John Doe**: `john@saas.test` / `password123`
- **Jane Smith**: `jane@saas.test` / `password123`
- **Mike Johnson**: `mike@saas.test` / `password123`

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

### Membership Endpoints
- `GET /api/membership/plans` - Get membership plans
- `POST /api/membership/plans` - Create membership plan
- `GET /api/membership/applications` - Get membership applications
- `POST /api/membership/applications` - Submit membership application
- `GET /api/membership/payments` - Get payment history
- `POST /api/membership/payments` - Process payment

### Career Center Endpoints
- `GET /api/career/jobs` - Get job listings
- `POST /api/career/jobs` - Create job posting
- `GET /api/career/applications` - Get job applications
- `POST /api/career/applications` - Submit job application

## Environment Variables

### Server (.env)
```bash
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_platform
DB_USER=postgres
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_jwt_secret_here

# CORS
CLIENT_URL=http://localhost:3000

# Email (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### Client (.env)
```bash
VITE_API_URL=http://localhost:5000/api
```

## Database Schema

The application uses the following main tables:

### Core Social Tables
- **users** - User accounts and profiles
- **spaces** - Communities/groups
- **posts** - User posts
- **comments** - Post comments
- **memberships** - User-space relationships
- **follows** - User and space following
- **likes** - Post and comment likes

### Membership System Tables
- **plans** - Membership subscription plans
- **subscriptions** - User subscriptions to plans
- **payments** - Payment records
- **applications** - Membership applications
- **application_forms** - Customizable application forms
- **coupons** - Discount coupons
- **digital_cards** - Digital membership cards
- **debts** - Outstanding payment debts
- **reminders** - Payment reminders

### Career Center Tables
- **jobs** - Job postings
- **job_applications** - Job applications
- **saved_jobs** - User-saved job listings
- **user_profiles** - Extended user profiles
- **company_profiles** - Company information
- **individual_profiles** - Individual user profiles

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

### Docker Production Deployment (Recommended)
```bash
# Start production environment
.\start-prod.ps1

# Or manually
docker-compose -f docker-compose.prod.yml up --build -d
```

### Manual Production Deployment

#### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Use a production PostgreSQL database
3. Set a secure `JWT_SECRET`
4. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start app.js --name "saas-api"
```

#### Frontend Deployment
1. Build the React app:
```bash
npm run build
```
2. Serve the `dist` folder using a web server (Nginx, Apache, or static hosting)

### Environment-specific Configuration
- Update `CLIENT_URL` in backend .env to match your domain
- Update `VITE_API_URL` in frontend .env to match your API domain
- Configure email settings for production notifications

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

### Docker Issues
- **Container won't start**: Check logs with `docker-compose logs`
- **Port conflicts**: Ensure ports 3000, 5000, and 5432 are available
- **Volume mount issues**: Ensure Docker has access to the project directory
- **Node version issues**: The project uses Node 20 for compatibility with Vite 7

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

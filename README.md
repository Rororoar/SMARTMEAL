# SmartMeal

SmartMeal is a web-based intelligent meal planning assistant for an FYP project. It helps users create personalized weekly meal plans, search recipes, generate grocery lists, and track simple meal-prep tasks.

The implementation follows the report scope:

- React frontend
- Node.js and Express backend
- MongoDB Atlas database
- Spoonacular recipe API
- JWT authentication
- Backend-side recipe caching
- Vercel frontend deployment
- Railway or Render backend deployment

## Production Folder Structure

```text
SMARTMEAL/
  frontend/                 React app for users
    src/
      api/                  API client and endpoint helpers
      components/           Shared UI components
      context/              Authentication state
      pages/                Main screens
    vercel.json             Vercel SPA routing config
    vite.config.js          Vite dev/build config

  backend/                  Express API server
    src/
      config/               MongoDB connection
      controllers/          Request handlers
      middleware/           Auth and error handling
      models/               MongoDB/Mongoose schemas
      routes/               REST API routes
      services/             Spoonacular, planner, grocery logic
      utils/                Shared helpers
    render.yaml             Render deployment config
    railway.json            Railway deployment config

  package.json              Workspace scripts
  .env.example              Main environment variable reference
```

This structure separates the presentation layer, application layer, and data layer. That matches the three-tier design described in the report and keeps the project easier to maintain.

## Main Features

- Register and log in with JWT.
- Save dietary preferences, allergies, disliked ingredients, nutrition targets, and time limits.
- Generate a weekly meal plan using profile filters.
- Search Spoonacular recipes through the backend.
- Cache Spoonacular responses in MongoDB to reduce repeated API calls.
- Generate grocery items by combining ingredients from all planned recipes.
- Mark grocery items as purchased.
- Create prep tasks for each meal.
- Save recipes and view recent meal plan history.

## REST API Endpoints

All private routes require:

```http
Authorization: Bearer <token>
```

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Profile

```http
GET /api/profile
PUT /api/profile
```

### Recipes

```http
GET    /api/recipes/search?query=chicken&diet=vegetarian
GET    /api/recipes/:id
GET    /api/recipes/saved
POST   /api/recipes/saved
DELETE /api/recipes/saved/:id
```

### Meal Plans

```http
POST  /api/meal-plans/generate
POST  /api/meal-plans/current/meals
GET   /api/meal-plans/current
GET   /api/meal-plans/history
GET   /api/meal-plans/:id
DELETE /api/meal-plans/:id/meals/:mealId
DELETE /api/meal-plans/:id/days
DELETE /api/meal-plans/:id
PATCH /api/meal-plans/:id/grocery/:itemId
PATCH /api/meal-plans/:id/prep/:taskId
```

### Grocery

```http
GET /api/grocery/:planId
```

## Database Models

### User

Stores account details and saved recipes.

Key fields:

- `name`
- `email`
- `passwordHash`
- `savedRecipes`

### Profile

Stores meal planning rules.

Key fields:

- `dietaryPreferences`
- `allergies`
- `dislikedIngredients`
- `preferredIngredients`
- `targetCalories`
- `targetProtein`
- `maxReadyTime`
- `mealsPerDay`

### MealPlan

Stores generated weekly plans.

Key fields:

- `weekStart`
- `weekEnd`
- `meals`
- `groceryItems`
- `prepTasks`

### RecipeCache

Stores Spoonacular API responses temporarily.

Key fields:

- `cacheKey`
- `data`
- `expiresAt`

MongoDB automatically removes expired cache documents through the TTL index.

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartmeal
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
SPOONACULAR_API_KEY=your-spoonacular-api-key
SPOONACULAR_CACHE_TTL_MINUTES=720
CLIENT_URL=http://localhost:5173
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

If `SPOONACULAR_API_KEY` is empty, the backend uses a small fallback recipe list so the app can still be demonstrated.

## Getting The Missing Values

### JWT Secret

The JWT secret is just a long random private string used by the backend to sign login tokens. It is not an account password and you do not get it from a website.

Generate one locally:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Put the generated value in:

```env
JWT_SECRET=your-generated-secret
```

Keep it private. If someone gets this value, they may be able to forge login tokens.

### MongoDB Atlas URI

MongoDB needs the full Atlas connection string, not only the username and password.

To get it:

1. Open MongoDB Atlas.
2. Go to your project.
3. Open your cluster.
4. Click `Connect`.
5. Choose `Drivers`.
6. Copy the connection string.
7. Replace `<password>` with your database user password.
8. Add the database name `smartmeal` before the query string.

It should look like this:

```env
MONGODB_URI=mongodb+srv://your_db_user:your_password@your-cluster-host.mongodb.net/smartmeal?retryWrites=true&w=majority
```

Also check Atlas Network Access:

- For quick testing, allow `0.0.0.0/0`.
- For production, restrict access where possible.

### Spoonacular API Key

The Spoonacular key belongs only in `backend/.env` and backend hosting environment variables. Do not put it in `frontend/.env`, because frontend variables are visible in the browser.

## Local Setup

1. Install Node.js 20 or newer.
2. Create a MongoDB Atlas cluster.
3. Copy the environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

4. Add your MongoDB Atlas URI, JWT secret, and Spoonacular API key.
5. Install dependencies:

```bash
npm install
```

6. Run both apps:

```bash
npm run dev
```

7. Open:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:5000/api/health
```

## Deployment

### Frontend on Vercel

1. Deploy the `frontend` folder.
2. Set this environment variable in Vercel:

```env
VITE_API_URL=https://your-backend-url/api
```

3. Build command:

```bash
npm run build
```

4. Output directory:

```text
dist
```

### Backend on Railway

1. Deploy the `backend` folder.
2. Add these variables:

```env
NODE_ENV=production
MONGODB_URI=...
JWT_SECRET=...
SPOONACULAR_API_KEY=...
CLIENT_URL=https://your-vercel-frontend-url
```

3. Start command:

```bash
npm start
```

### Backend on Render

The file `backend/render.yaml` contains a ready web service definition. Add the same environment variables in the Render dashboard.

## Launch Checklist

Use this order:

1. Finish `backend/.env` by replacing `YOUR_CLUSTER_HOST` in `MONGODB_URI`.
2. Run the backend:

```bash
npm run dev --workspace backend
```

3. Check the backend:

```text
http://localhost:5000/api/health
```

4. Run the frontend:

```bash
npm run dev --workspace frontend
```

5. Open the website:

```text
http://localhost:5173
```

6. Register a test account.
7. Save your profile.
8. Click `Generate week`.
9. Deploy backend to Railway or Render.
10. Deploy frontend to Vercel.
11. Set `VITE_API_URL` on Vercel to your live backend URL plus `/api`.
12. Set `CLIENT_URL` on the backend host to your live Vercel frontend URL.

## Render Deployment Fixes

If Render logs show:

```text
Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"
```

the `MONGODB_URI` environment variable was entered incorrectly in Render.

In Render, the environment variable must be:

```text
Key:   MONGODB_URI
Value: mongodb+srv://your_db_user:your_password@your-cluster-host.mongodb.net/smartmeal?retryWrites=true&w=majority&appName=Cluster0
```

Do not paste `MONGODB_URI=` into the Value box. The Value must start directly with `mongodb+srv://`.

The backend is pinned to Node 22 LTS for Render using `backend/.node-version` and `backend/package.json`.

## Simple Explanation For Viva

SmartMeal uses React for the user interface. Users log in, update their profile, and ask the system to generate a weekly plan.

The React app sends requests to the Express backend. The backend checks the JWT token, reads the user's profile from MongoDB, calls Spoonacular for recipes, and saves the generated meal plan.

The grocery list is created by reading all ingredients from the selected recipes and grouping repeated ingredients. This supports the report goal of ingredient reuse and lower food waste.

Spoonacular is called only from the backend. This protects the API key and allows MongoDB caching, which improves performance and reduces repeated external API usage.

## Practical FYP Scope

This version is intentionally simple and launchable. It avoids complex AI model training and focuses on a working full-stack system:

- Personalization through stored profile filters.
- Recommendation through Spoonacular recipe search.
- Waste reduction through grouped grocery items.
- Meal prep support through generated task lists.
- Security through password hashing and JWT.

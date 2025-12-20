# Frontend Environment Variables

## Required for Vercel Deployment

Add this environment variable in Vercel Dashboard (Project Settings → Environment Variables):

```
VITE_API_URL=https://api.hamarasamachar.co.in/api
```

Replace `api.hamarasamachar.co.in` with your actual backend API domain.

## Local Development

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Notes
- Vite requires environment variables to be prefixed with `VITE_`
- After adding environment variables in Vercel, redeploy the project
- The API URL should point to your backend server deployed on Ubuntu VPS


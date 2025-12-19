# Netlify Deployment Guide

## Admin Pages नहीं खुल रहे हैं? यहाँ Solution है:

### 1. Netlify Dashboard में Settings:

**Build & Deploy Settings:**
- **Base directory:** `frontend` (या खाली छोड़ें)
- **Build command:** `npm install && npm run build`
- **Publish directory:** `frontend/dist`

या root में `netlify.toml` file है, तो Netlify automatically इसे detect करेगा।

### 2. Important Files:

✅ **`netlify.toml`** (root directory में) - Build settings के लिए
✅ **`frontend/public/_redirects`** - Client-side routing के लिए

### 3. _redirects File:

यह file automatically `frontend/dist` में copy हो जाती है build के बाद।

Content:
```
/*    /index.html   200
```

### 4. Netlify में Manual Deploy करने पर:

1. Netlify Dashboard → Site settings → Build & deploy
2. Build command: `cd frontend && npm install && npm run build`
3. Publish directory: `frontend/dist`
4. Save और फिर से deploy करें

### 5. Troubleshooting:

अगर अभी भी `/admin/login` नहीं खुल रहा:

1. **Clear Netlify Cache:**
   - Netlify Dashboard → Deploys → Clear cache and retry deploy

2. **Verify _redirects file:**
   - Deployed site में `/_redirects` file check करें
   - या Netlify Dashboard → Deploys → View details में check करें

3. **Force Rebuild:**
   - Netlify Dashboard → Deploys → Trigger deploy → Clear cache and deploy site

### 6. Verification:

Deploy के बाद check करें:
- `https://your-site.netlify.app/admin/login` - यह काम करना चाहिए
- `https://your-site.netlify.app/notifications` - यह भी काम करना चाहिए

### 7. Common Issues:

**Issue:** 404 Error on `/admin/login`
**Solution:** _redirects file dist folder में होनी चाहिए

**Issue:** Build fails
**Solution:** Check build command और publish directory

**Issue:** Routes work locally but not on Netlify
**Solution:** Clear Netlify cache और rebuild


git init
git config user.name "CloudFlow Developer"
git config user.email "developer@cloudflow.local"

# Step 1: Base Auth & Config
git add package.json package-lock.json tsconfig.json .gitignore next.config.mjs postcss.config.mjs tailwind.config.ts src/app/layout.tsx src/app/globals.css src/middleware.ts src/app/login src/app/api/auth
git commit -m "feat: Initialize Next.js App with Tailwind CSS and JWT Authentication"

# Step 2: Minio SDK
git add src/lib/s3Client.ts setup-cors.js
git commit -m "feat: Integrate Minio/S3 AWS SDK and configure CORS"

# Step 3: Multipart Upload APIs
git add src/app/api/upload
git commit -m "feat: Implement chunked multipart upload for large files"

# Step 4: Core File APIs
git add src/app/api/files src/app/api/delete src/app/api/download src/app/api/rename src/app/api/share
git commit -m "feat: Implement core file management APIs (List, Rename, Delete, Download, Presigned Share Links)"

# Step 5: Folders
git add src/app/api/folder
git commit -m "feat: Introduce virtual folder management with recursive deletion"

# Step 6: Frontend UI
git add src/app/page.tsx CHANGELOG.md README.md .eslintrc.json .env.local.example
git commit -m "feat: Build modern dashboard with grid/list views, folder navigation, optimistic UI, and drag-and-drop uploads"

# Step 7: Everything else
git add .
git commit -m "chore: Final project synchronization"

# Log the history
git log --oneline

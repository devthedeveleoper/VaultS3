# VaultS3

VaultS3 is a modern, minimalist web interface for managing S3-compatible object storage (including self-hosted Minio instances). Built with Next.js App Router and Tailwind CSS, it offers a seamless, fast, and responsive experience for interacting with your cloud files.

## Features

- **Modern Minimalist UI**: Features glassmorphism elements, dynamic micro-animations, and responsive layouts.
- **Flexible Viewing**: Seamlessly toggle between a spacious grid view and a condensed list view for browsing files.
- **Authentication**: Secure access with route-level protection via Next.js Middleware and JWT cookies. Only authorized users with the `APP_PASSWORD` can access the dashboard.
- **S3 & Minio Integration**: Fully integrated with `@aws-sdk/client-s3`, utilizing `forcePathStyle` for robust support with self-hosted Minio instances.
- **Large File Support**: 
  - Implemented 5MB chunked multipart uploads via a custom Next.js backend proxy.
  - Uploads natively bypass Minio CORS limitations.
  - Supports uploading multiple files concurrently using `Promise.all` batching for maximum speed.
- **Virtual Folders**: 
  - Simulated directory trees using S3 Prefixes.
  - Create folders and navigate via dynamic breadcrumbs.
  - Supports recursive folder deletion (wiping all contents in one click).
- **Core File Actions**: 
  - **Rename**: Copies the object to a new key and deletes the old one, cleanly hiding the UUID backend-prefix from the UI.
  - **Delete**: Instant optimistic UI deletion followed by backend synchronization.
  - **Preview**: In-browser preview support for images, videos, and PDFs.
  - **Share**: Generates 7-day presigned S3 URLs for sharing files publicly.
  - **Download**: Direct file downloads via proxy/presigned URLs.
- **Search & Sort**: Real-time client-side filtering and sorting by Newest, Oldest, Largest, and Smallest.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AWS SDK**: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `@aws-sdk/lib-storage`

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

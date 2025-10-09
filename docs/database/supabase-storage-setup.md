# Supabase Storage Setup for Profile Images

## Overview
This guide explains how to set up Supabase Storage for user profile image uploads.

## Steps

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Configure the bucket:
   - **Name**: `profile-images`
   - **Public bucket**: Yes (enable public access)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

### 2. Set Up Storage Policies

After creating the bucket, set up Row Level Security (RLS) policies:

#### Policy 1: Public Read Access
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');
```

#### Policy 2: Authenticated Upload
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: Users Can Update Own Images
```sql
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 4: Users Can Delete Own Images
```sql
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Alternative: Public Bucket Without Auth

If you're using service role key on the backend (as in this project), you can simplify the policies:

```sql
-- Allow public read
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Allow service role to manage all files (automatically handled by service role key)
```

### 4. File Structure

Images will be stored with the following structure:
```
profile-images/
└── avatars/
    ├── <user-id>-<timestamp>.jpg
    ├── <user-id>-<timestamp>.png
    └── ...
```

### 5. Usage

The upload API endpoint handles:
- File validation (type and size)
- Uploading to Supabase Storage
- Generating public URLs
- Updating user profile with avatar URL

### 6. Testing

Test the storage setup:

1. Go to Storage in Supabase Dashboard
2. Click on `profile-images` bucket
3. Try uploading an image manually
4. Verify you can access it via the public URL

### 7. Configuration

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key has full access to storage and bypasses RLS policies.

## File Size Limits

- Maximum file size: 5 MB
- Allowed types: JPEG, PNG, GIF, WebP
- Validation happens on both client and server

## Security Notes

- Images are stored with user ID prefix for easy management
- Public URLs are generated for easy access
- Old avatars are not automatically deleted (manual cleanup needed)
- Consider implementing a cleanup job for orphaned images

## Troubleshooting

**Upload fails with 403 error:**
- Check that bucket is set to public
- Verify RLS policies are configured
- Ensure service role key is correct

**Images not displaying:**
- Verify bucket is public
- Check that public URL is correct format
- Ensure CORS is properly configured in Supabase

**Storage quota exceeded:**
- Free tier: 1 GB storage
- Paid tier: 100 GB storage (expandable)
- Monitor usage in Supabase Dashboard

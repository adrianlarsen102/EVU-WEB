import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import { getSupabaseClient } from '../../../lib/database';
import { rateLimiters } from '../../../lib/rateLimit';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';

const supabase = getSupabaseClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Check authentication
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = sessionId ? await validateSession(sessionId) : null;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting for file uploads
  const rateLimitResult = await rateLimiters.upload(req, res, null);
  if (rateLimitResult !== true) {
    return; // Rate limit response already sent
  }

  try {
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      keepExtensions: true,
    });

    const [, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.avatar?.[0] || files.avatar;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file first for content validation
    const fileBuffer = await fs.promises.readFile(file.filepath);

    // Validate actual file content (magic bytes), not just MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const fileType = await fileTypeFromBuffer(fileBuffer);

    if (!fileType || !allowedTypes.includes(fileType.mime)) {
      // Clean up temp file
      await fs.promises.unlink(file.filepath);
      return res.status(400).json({
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
      });
    }

    // Additional check: verify file size (in case it bypassed formidable limit)
    if (fileBuffer.length > 5 * 1024 * 1024) {
      await fs.promises.unlink(file.filepath);
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }
    const fileExt = path.extname(file.originalFilename || file.newFilename);
    const fileName = `${session.adminId}-${Date.now()}${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, fileBuffer, {
        contentType: fileType.mime,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      await fs.promises.unlink(file.filepath);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('admins')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.adminId);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    // Clean up temp file
    await fs.promises.unlink(file.filepath);

    res.status(200).json({ success: true, avatarUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}

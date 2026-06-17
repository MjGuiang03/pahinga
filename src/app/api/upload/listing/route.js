import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST /api/upload/listing
// Accepts a multipart form with a 'file' field
// Saves to public/uploads/listings/ and returns the public URL
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Validate type — allow images only
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, WebP, and GIF images are accepted.' },
        { status: 400 }
      );
    }

    // Max 5 MB
    const MAX_BYTES = 5 * 1024 * 1024;
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'File must be under 5 MB.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const rand = Math.random().toString(36).slice(2, 8);
    const filename = `listing_${Date.now()}_${rand}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'listings');

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, Buffer.from(bytes));

    const url = `/uploads/listings/${filename}`;
    return NextResponse.json({ url });

  } catch (err) {
    console.error('Listing image upload error:', err);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}

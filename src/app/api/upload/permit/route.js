import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST /api/upload/permit
// Accepts a multipart form with a 'file' field
// Saves to public/uploads/permits/ and returns the public URL
// No auth required — agencies upload before their account is fully created
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }


    // Validate type — allow images and PDFs only
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, WebP images and PDFs are accepted.' },
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
    const filename = `permit_${Date.now()}_${rand}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'permits');

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, Buffer.from(bytes));

    const url = `/uploads/permits/${filename}`;
    return NextResponse.json({ url });

  } catch (err) {
    console.error('Permit upload error:', err);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}

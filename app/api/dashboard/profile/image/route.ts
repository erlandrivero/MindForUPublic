import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import { writeFile, mkdir } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data with image
    const formData = await req.formData();
    const file = formData.get('profileImage') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Create unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Define upload directory and ensure it exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    
    // Ensure the upload directory exists
    try {
      if (!fs.existsSync(path.join(process.cwd(), 'public', 'uploads'))) {
        await mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true });
      }
      if (!fs.existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
    } catch (err) {
      console.error('Error creating upload directory:', err);
      return NextResponse.json({ error: 'Failed to create upload directory' }, { status: 500 });
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save file to disk
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // Generate URL for the uploaded image
    const imageUrl = `/uploads/profiles/${fileName}`;
    
    // Update user in database
    await connectMongo();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update user's image
    user.image = imageUrl;
    await user.save();
    
    return NextResponse.json({ 
      message: 'Profile image uploaded successfully',
      imageUrl
    });
    
  } catch (error) {
    console.error('Profile image upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

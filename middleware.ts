import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Flag to track if initialization has been done
let initialized = false;

export async function middleware(request: NextRequest) {
  // Only run initialization once per server instance
  if (!initialized) {
    try {
      console.log('Initializing system via middleware...');
      
      // Call the init API route to start scheduled tasks
      const initResponse = await fetch(`${request.nextUrl.origin}/api/system/init`);
      const initData = await initResponse.json();
      
      console.log('System initialization response:', initData);
      initialized = true;
    } catch (error) {
      console.error('Failed to initialize system:', error);
    }
  }
  
  return NextResponse.next();
}

// Only run middleware on specific paths to avoid unnecessary execution
export const config = {
  matcher: [
    // Run on homepage and dashboard routes
    '/',
    '/dashboard/:path*',
  ],
};

import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    return token;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

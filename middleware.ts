import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Middleware logic here if needed
    console.log('🔒 Middleware: Protecting route', req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('🔍 Middleware: Checking authorization for', req.nextUrl.pathname);
        console.log('🔑 Token exists:', !!token);
        
        // Vérifier si l'utilisateur est authentifié
        if (!token) {
          console.log('❌ No token found, redirecting to signin');
          return false;
        }
        
        // Vérifier si l'utilisateur appartient au tenant de l'entreprise
        // Vous pouvez ajouter une logique pour vérifier le domaine email ici
        console.log('✅ Token found, access granted');
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/analytics/:path*',
    '/api/protected/:path*'
  ]
};

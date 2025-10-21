import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Vérifier si l'utilisateur est authentifié
        if (!token) {
          return false;
        }
        
        // Vérifier si l'utilisateur appartient au tenant de l'entreprise
        // Vous pouvez ajouter une logique pour vérifier le domaine email ici
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

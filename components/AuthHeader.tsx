'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, Shield } from 'lucide-react';

export default function AuthHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return (
      <Button
        onClick={() => router.push('/auth/signin')}
        variant="outline"
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        <Shield className="w-4 h-4 mr-2" />
        Se connecter
      </Button>
    );
  }

  const userInitials = session.user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  // Debug: Afficher les informations de session (à supprimer en production)
  console.log('Session user:', session.user);
  console.log('User image:', session.user?.image);

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:block text-right">
        <p className="text-sm font-medium text-gray-900">
          {session.user?.name}
        </p>
        <p className="text-xs text-gray-500">
          {session.user?.email}
        </p>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-blue-50 transition-colors">
            <Avatar className="h-10 w-10 border-2 border-blue-200">
              <AvatarImage 
                src={session.user?.image || ''} 
                alt={session.user?.name || ''}
                className="object-cover"
                onError={(e) => {
                  console.log('Erreur de chargement de l\'image:', e);
                  // L'image ne se charge pas, on utilise le fallback
                }}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 z-[9999] bg-white border-2 border-gray-200 shadow-xl" align="end" forceMount>
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-gray-900">
                {session.user?.name}
              </p>
              <p className="text-xs leading-none text-gray-500">
                {session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-200" />
          <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 text-gray-700 hover:text-gray-900 p-3">
            <User className="mr-2 h-4 w-4 text-blue-600" />
            <span>Profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 text-gray-700 hover:text-gray-900 p-3">
            <Settings className="mr-2 h-4 w-4 text-blue-600" />
            <span>Paramètres</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-200" />
          <DropdownMenuItem 
            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 p-3"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Se déconnecter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

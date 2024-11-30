import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useState } from 'react';

const withAuthGuard = (WrappedComponent: React.ComponentType) => {
    return (props: any) => {
        const router = useRouter();
        const [isAuthenticated, setIsAuthenticated] = useState(false);
    
        useEffect(() => {
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('authToken');
              const isTokenValid = () => {
                if (!token) return false;
                try {
                  const decodedToken = JSON.parse(atob(token.split('.')[1]));
                  return decodedToken.exp * 1000 > Date.now();
                } catch (err) {
                  return false;
                }
              };
          
              if (isTokenValid()) {
                setIsAuthenticated(true);
              } else {
                localStorage.removeItem('authToken');
                router.replace('/'); // Ovde ruter funkcioniše
              }
            }
          }, [router]);
    
        if (!isAuthenticated) {
          return null;
        }
    
        return <WrappedComponent {...props} />;
    };
};

export default withAuthGuard;

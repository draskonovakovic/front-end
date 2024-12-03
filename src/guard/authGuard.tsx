import { clearAuthToken, getAuthToken, isTokenValid } from '@/utilis/authHelpers';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const withAuthGuard = (WrappedComponent: React.ComponentType) => {
    return (props: any) => {
        const router = useRouter();
        const [isAuthenticated, setIsAuthenticated] = useState(false);

        useEffect(() => {
            if (typeof window !== 'undefined') {
                const token = getAuthToken();

                if (isTokenValid(token)) {
                    setIsAuthenticated(true);
                } else {
                    clearAuthToken();
                    router.replace('/'); 
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

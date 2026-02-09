import 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string;
            jobTitle?: string | null;
            settings?: any;
            customRole?: {
                id?: string;
                name: string;
                permissions: string[];
            };
        };
    }

    interface User {
        id: string;
        role?: string;
        jobTitle?: string | null;
    }
}

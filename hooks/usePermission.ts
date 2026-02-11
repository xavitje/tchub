import { useSession } from 'next-auth/react';

export function usePermission() {
    const { data: session } = useSession();

    const hasPermission = (permission: string) => {
        if (!session?.user) return false;

        // Dynamic RBAC check
        const permissions = (session.user as any)?.customRole?.permissions || [];
        if (permissions.includes(permission)) return true;

        // Legacy fallback (optional)
        const legacyRole = (session.user as any)?.role;
        if (legacyRole === 'ADMIN' || legacyRole === 'HQ_ADMIN') return true;

        return false;
    };

    const hasAnyPermission = (perms: string[]) => {
        return perms.some((p: string) => hasPermission(p));
    };

    return {
        hasPermission,
        hasAnyPermission,
        role: (session?.user as any)?.customRole?.name || (session?.user as any)?.role
    };
}

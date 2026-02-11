import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID,
            profile(profile: any) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email || profile.preferred_username || profile.upn,
                    image: null,
                }
            },
        }),
    ],
    pages: {
        signIn: '/login',
        error: '/auth/error', // Custom error page
    },
    callbacks: {
        async signIn({ user, account, profile }: any) {
            if (!user.email) {
                console.error("No email provided during sign in");
                return false;
            }

            try {
                // Upsert user in our database when they sign in
                const dbUser = await prisma.user.upsert({
                    where: { email: user.email },
                    update: {
                        displayName: user.name || user.email.split('@')[0],
                        profileImage: user.image,
                        azureAdId: account?.providerAccountId || user.id,
                    },
                    create: {
                        email: user.email,
                        azureAdId: account?.providerAccountId || user.id,
                        displayName: user.name || user.email.split('@')[0],
                        profileImage: user.image,
                        role: "EMPLOYEE", // Default role
                        settings: {
                            create: {} // Create default settings
                        }
                    },
                    include: {
                        settings: true
                    }
                });

                console.log("User signed in successfully:", dbUser.email);
                return true;
            } catch (error) {
                console.error("Error during sign in:", error);
                return false;
            }
        },
        async session({ session, token }: any) {
            if (session.user && session.user.email) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: session.user.email },
                        include: {
                            settings: true,
                            customRole: {
                                include: {
                                    permissions: true
                                }
                            }
                        }
                    });

                    if (dbUser) {
                        session.user.id = dbUser.id;
                        session.user.role = dbUser.role; // Legacy
                        session.user.jobTitle = dbUser.jobTitle;
                        session.user.settings = dbUser.settings;

                        // New dynamic RBAC data
                        if (dbUser.customRole) {
                            session.user.customRole = {
                                id: dbUser.customRole.id,
                                name: dbUser.customRole.name,
                                permissions: dbUser.customRole.permissions.map((p: any) => p.name)
                            };
                        } else {
                            // Fallback for non-migrated users
                            session.user.customRole = {
                                name: dbUser.role,
                                permissions: []
                            };
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user in session callback:", error);
                }
            }
            return session;
        },
        async jwt({ token, user, account }: any) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true, // Enable debug mode to see detailed logs
};

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/settings
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let settings = await prisma.userSettings.findUnique({
            where: { userId: session.user.id }
        });

        // Create default settings if they don't exist
        if (!settings) {
            settings = await prisma.userSettings.create({
                data: {
                    userId: session.user.id
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PATCH /api/settings
export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { theme, headerOrder, emailNotifications, pushNotifications } = body;

        const settings = await prisma.userSettings.upsert({
            where: { userId: session.user.id },
            update: {
                ...(theme && { theme }),
                ...(headerOrder && { headerOrder }),
                ...(emailNotifications !== undefined && { emailNotifications }),
                ...(pushNotifications !== undefined && { pushNotifications })
            },
            create: {
                userId: session.user.id,
                theme: theme || 'SYSTEM',
                headerOrder: headerOrder || ['home', 'discussions', 'training', 'hubs', 'support'],
                emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
                pushNotifications: pushNotifications !== undefined ? pushNotifications : true
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}

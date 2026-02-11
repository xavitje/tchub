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

        // Convert string back to array for frontend
        let headerOrder = settings.headerOrder;
        if (typeof headerOrder === 'string') {
            try {
                headerOrder = JSON.parse(headerOrder);
            } catch (e) {
                console.error('Error parsing headerOrder:', e);
                headerOrder = ['home', 'discussions', 'training', 'hubs', 'support'];
            }
        }

        const formattedSettings = {
            ...settings,
            headerOrder: Array.isArray(headerOrder)
                ? headerOrder
                : ['home', 'discussions', 'training', 'hubs', 'support']
        };

        return NextResponse.json(formattedSettings);
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

        // Convert array to string for SQLite storage
        const headerOrderString = Array.isArray(headerOrder) ? JSON.stringify(headerOrder) : headerOrder;

        const settings = await prisma.userSettings.upsert({
            where: { userId: session.user.id },
            update: {
                ...(theme && { theme }),
                ...(headerOrder && { headerOrder: headerOrderString }),
                ...(emailNotifications !== undefined && { emailNotifications }),
                ...(pushNotifications !== undefined && { pushNotifications })
            },
            create: {
                userId: session.user.id,
                theme: theme || 'SYSTEM',
                headerOrder: headerOrderString || JSON.stringify(['home', 'discussions', 'training', 'hubs', 'support']),
                emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
                pushNotifications: pushNotifications !== undefined ? pushNotifications : true
            }
        });

        // Convert back for response
        const formattedSettings = {
            ...settings,
            headerOrder: typeof settings.headerOrder === 'string'
                ? JSON.parse(settings.headerOrder)
                : settings.headerOrder
        };

        return NextResponse.json(formattedSettings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}

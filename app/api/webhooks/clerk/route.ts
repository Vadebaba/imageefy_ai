import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { clerkClient, WebhookEvent } from '@clerk/nextjs/server'
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    // Get the headers
    const headerPayload = headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400,
        })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET)

    let evt: WebhookEvent

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error occured', {
            status: 400,
        })
    }

    // Do something with the payload
    // For this guide, you simply log the payload to the console
    const { id } = evt.data
    const eventType = evt.type

    // CREATE
        if (eventType === "user.created") {
            const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;
        
            // Safely access email and username, providing fallback values
            const email = email_addresses.length > 0 ? email_addresses[0].email_address : 'no-email@example.com';
            const safeUsername = username || 'Anonymous';  // Provide default 'Anonymous' if username is missing
        
            // Create the user object
            const user = {
                clerkId: id,
                email: email,
                username: safeUsername,
                firstName: first_name || 'Unknown',  // Provide default 'Unknown' if first_name is missing
                lastName: last_name || 'Unknown',    // Provide default 'Unknown' if last_name is missing
                photo: image_url || '',              // Default to an empty string if image_url is missing
            };
        
            try {
                const newUser = await createUser(user);
        
                // Set public metadata if user creation succeeds
                if (newUser) {
                    await clerkClient.users.updateUserMetadata(id, {
                        publicMetadata: {
                            userId: newUser._id,
                        },
                    });
                }
        
                return NextResponse.json({ message: "OK", user: newUser });
            } catch (error) {
                console.error('Error creating user:', error);
                return NextResponse.json({ message: "Error creating user" }, { status: 500 });
            }
        }
        



    // UPDATE
    if (eventType === "user.updated") {
        const { id, image_url, first_name, last_name, username } = evt.data;
    
        // Safely handle potentially undefined fields by providing defaults
        const user = {
            firstName: first_name || 'Unknown',  // Default to 'Unknown' if first_name is missing
            lastName: last_name || 'Unknown',    // Default to 'Unknown' if last_name is missing
            username: username || 'Anonymous',  // Default to 'Anonymous' if username is missing
            photo: image_url || '',              // Default to empty string if image_url is missing
        };
    
        try {
            // Attempt to update the user
            const updatedUser = await updateUser(id, user);
            return NextResponse.json({ message: "OK", user: updatedUser });
        } catch (error) {
            console.error('Error updating user:', error);
            return NextResponse.json({ message: "Error updating user" }, { status: 500 });
        }
    }
    


    // DELETE
    if (eventType === "user.deleted") {
        const { id } = evt.data;

        const deletedUser = await deleteUser(id!);

        return NextResponse.json({ message: "OK", user: deletedUser });
    }


    console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
    console.log('Webhook body:', body)

    return new Response('', { status: 200 })
}
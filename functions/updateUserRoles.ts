import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Keep these as admin
    const keepAdmins = [
      'brooke stonebanks',
      'hassan soliman',
      'liselle'
    ];

    // Fetch all users
    const allUsers = await base44.asServiceRole.entities.User.list();

    let updatedCount = 0;

    // Update users to 'user' role except the ones in keepAdmins list
    for (const targetUser of allUsers) {
      const fullNameLower = (targetUser.full_name || '').toLowerCase();
      const emailLower = (targetUser.email || '').toLowerCase();
      
      // Check if this user should remain admin
      const shouldKeepAdmin = keepAdmins.some(name => 
        fullNameLower.includes(name.toLowerCase()) || emailLower.includes(name.toLowerCase())
      );

      // If not in keep list and currently admin, change to user
      if (!shouldKeepAdmin && targetUser.role === 'admin') {
        await base44.asServiceRole.entities.User.update(targetUser.id, { role: 'user' });
        updatedCount++;
      }
    }

    return Response.json({ 
      success: true, 
      message: `Updated ${updatedCount} users from admin to user role`,
      kept_admins: keepAdmins
    });
  } catch (error) {
    console.error('Update Roles Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
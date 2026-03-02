<?php

namespace Database\Seeders;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AdminUser;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use App\Models\Permission;
use Database\Seeders\PermissionSeeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure PermissionSeeder is run first if not already
        $this->call([
            PermissionSeeder::class
        ]);

        // Create Admin Role
        $adminRole = Role::firstOrCreate(['name' => 'Admin']); 
        
        // Give all permissions to Admin Role
        $permissions = Permission::all();
        $adminRole->permissions()->sync($permissions->pluck('id'));

        // Create or update Super Admin
        AdminUser::updateOrCreate(
            ['email' => 'admin@mrc.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin123'),
                'role_id' => $adminRole->id
            ]
        );
    }
}

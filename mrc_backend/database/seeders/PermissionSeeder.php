<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'Dashboard' => 'admin.dashboard',
            'Users' => 'user.index',
            'Role Master' => 'role_master.index',
            'Products' => 'product.index',
            'Categories' => 'category.index',
            'Brands' => 'brand.index',
            'Attributes' => 'attribute.index',
        ];

        // Clean up other permissions if they exist (optional but keeps DB clean)
        \App\Models\Permission::whereNotIn('name', array_values($permissions))->delete();

        foreach ($permissions as $display => $slug) {
            \App\Models\Permission::updateOrCreate(
                ['name' => $slug]
            );
        }
    }
}

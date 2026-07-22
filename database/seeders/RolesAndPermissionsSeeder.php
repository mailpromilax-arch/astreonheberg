<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'access client dashboard',
            'manage own services',
            'manage own invoices',
            'manage own tickets',

            'access support dashboard',
            'manage support tickets',
            'view customers',

            'access admin dashboard',
            'manage customers',
            'manage products',
            'manage orders',
            'manage services',
            'manage invoices',
            'manage infrastructure',
            'manage settings',
            'view activity logs',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $client = Role::findOrCreate('client', 'web');
        $client->syncPermissions([
            'access client dashboard',
            'manage own services',
            'manage own invoices',
            'manage own tickets',
        ]);

        $support = Role::findOrCreate('support', 'web');
        $support->syncPermissions([
            'access client dashboard',
            'access support dashboard',
            'manage support tickets',
            'view customers',
        ]);

        $admin = Role::findOrCreate('admin', 'web');
        $admin->syncPermissions(Permission::all());
    }
}
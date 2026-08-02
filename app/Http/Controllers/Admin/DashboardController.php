<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Service;
use App\Models\Invoice;
use App\Models\Ticket;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Statistiques globales en temps réel
        $totalClients = User::where('role', 'client')->count();
        $activeServices = Service::where('status', 'active')->count();
        $pendingTickets = Ticket::where('status', 'open')->orWhere('status', 'pending')->count();
        $totalRevenue = Invoice::where('status', 'paid')->sum('amount');

        // Derniers utilisateurs inscrits
        $latestUsers = User::latest()->take(5)->get();

        // Dernières activités de l'admin
        $latestActivities = ActivityLog::latest()->take(5)->get();

        return Inertia::render('admin/dashboard/index', [
            'stats' => [
                'clients' => $totalClients,
                'services' => $activeServices,
                'tickets' => $pendingTickets,
                'revenue' => $totalRevenue,
            ],
            'latestUsers' => $latestUsers,
            'latestActivities' => $latestActivities,
        ]);
    }
}
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Client\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class EmailHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $emails = DB::table('sent_emails')
            ->where('user_id', $request->user()->id)
            ->latest('sent_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('client/account/emails/index', [
            'emails' => $emails,
        ]);
    }

    public function show(Request $request, int $email): Response
    {
        $message = DB::table('sent_emails')
            ->where('id', $email)
            ->where('user_id', $request->user()->id)
            ->first();

        abort_if($message === null, 404);

        return Inertia::render('client/account/emails/show', [
            'email' => $message,
        ]);
    }
}

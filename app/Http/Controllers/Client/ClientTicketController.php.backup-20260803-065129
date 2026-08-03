<?php

declare(strict_types=1);

namespace App\Http\Controllers\Client;

use App\Services\Mail\AstreonMailer;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class ClientTicketController extends Controller
{
    public function index(Request $request): Response
    {
        $tickets = DB::table('tickets')
            ->where('user_id', $request->user()->id)
            ->latest('updated_at')
            ->paginate(15)
            ->through(fn (object $ticket): array => [
                'id' => $ticket->id,
                'subject' => $ticket->subject,
                'priority' => $ticket->priority,
                'status' => $ticket->status,
                'waiting_for' => $ticket->waiting_for,
                'assigned_to' => $ticket->assigned_to,
                'created_at' => $ticket->created_at,
                'updated_at' => $ticket->updated_at,
            ]);

        $counts = [
            'open' => DB::table('tickets')
                ->where('user_id', $request->user()->id)
                ->whereNotIn('status', ['closed'])
                ->count(),
            'waiting_admin' => DB::table('tickets')
                ->where('user_id', $request->user()->id)
                ->where('waiting_for', 'admin')
                ->whereNotIn('status', ['closed'])
                ->count(),
            'waiting_client' => DB::table('tickets')
                ->where('user_id', $request->user()->id)
                ->where('waiting_for', 'client')
                ->whereNotIn('status', ['closed'])
                ->count(),
            'closed' => DB::table('tickets')
                ->where('user_id', $request->user()->id)
                ->where('status', 'closed')
                ->count(),
        ];

        return Inertia::render('client/support/index', [
            'tickets' => $tickets,
            'counts' => $counts,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('client/support/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'priority' => [
                'required',
                Rule::in(['low', 'medium', 'high']),
            ],
            'message' => ['required', 'string', 'max:20000'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => [
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,gif,webp,pdf,txt,log,zip,rar,7z,doc,docx,xls,xlsx',
            ],
        ]);

        $ticketId = DB::table('tickets')->insertGetId([
            'user_id' => $request->user()->id,
            'assigned_to' => null,
            'subject' => $validated['subject'],
            'priority' => $validated['priority'],
            'status' => 'open',
            'waiting_for' => 'admin',
            'last_reply_by' => $request->user()->id,
            'last_replied_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $replyId = DB::table('ticket_replies')->insertGetId([
            'ticket_id' => $ticketId,
            'user_id' => $request->user()->id,
            'is_admin' => false,
            'message' => $validated['message'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->storeAttachments(
            $request,
            $ticketId,
            $replyId,
        );

        app(AstreonMailer::class)->user(
            $request->user(),
            "Ticket #{$ticketId} créé",
            'ASSISTANCE ASTREON',
            'Votre ticket a bien été créé',
            "Notre équipe a reçu votre demande.",
            ['Vous recevrez un e-mail dès qu’un membre du support vous répondra.'],
            'Suivre mon ticket',
            url("/client/support/{$ticketId}"),
            null,
            'success',
            ['Ticket' => "#{$ticketId}"],
        );

        app(AstreonMailer::class)->admins(
            "Nouveau ticket #{$ticketId}",
            'NOUVEAU TICKET CLIENT',
            'Un ticket attend une réponse',
            "{$request->user()->name} vient d’ouvrir un ticket.",
            [],
            'Ouvrir le ticket',
            url("/admin/tickets/{$ticketId}"),
            null,
            'warning',
            ['Ticket' => "#{$ticketId}", 'Client' => $request->user()->email],
        );

        return redirect()
            ->route('client.support.show', $ticketId)
            ->with('success', 'Votre ticket a bien été créé.');
    }

    public function show(Request $request, int $ticket): Response
    {
        $record = DB::table('tickets')
            ->where('id', $ticket)
            ->where('user_id', $request->user()->id)
            ->first();

        abort_if($record === null, 404);

        $assignee = $record->assigned_to
            ? DB::table('users')
                ->where('id', $record->assigned_to)
                ->first(['id', 'name'])
            : null;

        $replies = DB::table('ticket_replies')
            ->where('ticket_id', $ticket)
            ->orderBy('created_at')
            ->get();

        $userIds = $replies
            ->pluck('user_id')
            ->filter()
            ->unique()
            ->values();

        $authors = DB::table('users')
            ->whereIn('id', $userIds)
            ->get(['id', 'name', 'email'])
            ->keyBy('id');

        $attachments = DB::table('ticket_attachments')
            ->where('ticket_id', $ticket)
            ->get()
            ->groupBy('ticket_reply_id');

        $messages = $replies->map(function (object $reply) use ($authors, $attachments): array {
            $author = $reply->user_id
                ? $authors->get($reply->user_id)
                : null;

            return [
                'id' => $reply->id,
                'message' => $reply->message,
                'is_admin' => (bool) $reply->is_admin,
                'created_at' => $reply->created_at,
                'author' => $author
                    ? [
                        'id' => $author->id,
                        'name' => $author->name,
                        'email' => $author->email,
                    ]
                    : null,
                'attachments' => $attachments
                    ->get($reply->id, collect())
                    ->map(fn (object $file): array => [
                        'id' => $file->id,
                        'name' => $file->original_name,
                        'mime_type' => $file->mime_type,
                        'size' => $file->size,
                    ])
                    ->values()
                    ->all(),
            ];
        })->all();

        $lastReply = $replies->last();

        $canReply =
            $record->status !== 'closed'
            && $record->waiting_for === 'client'
            && $lastReply !== null
            && (bool) $lastReply->is_admin;

        return Inertia::render('client/support/show', [
            'ticket' => [
                'id' => $record->id,
                'subject' => $record->subject,
                'priority' => $record->priority,
                'status' => $record->status,
                'waiting_for' => $record->waiting_for,
                'created_at' => $record->created_at,
                'updated_at' => $record->updated_at,
                'closed_at' => $record->closed_at,
            ],
            'assignee' => $assignee,
            'messages' => $messages,
            'canReply' => $canReply,
        ]);
    }

    public function reply(
        Request $request,
        int $ticket,
    ): RedirectResponse {
        $record = DB::table('tickets')
            ->where('id', $ticket)
            ->where('user_id', $request->user()->id)
            ->first();

        abort_if($record === null, 404);
        abort_if($record->status === 'closed', 422, 'Ticket fermé.');
        abort_if(
            $record->waiting_for !== 'client',
            422,
            'Vous devez attendre la réponse d’un administrateur.',
        );

        $lastReply = DB::table('ticket_replies')
            ->where('ticket_id', $ticket)
            ->latest('created_at')
            ->first();

        abort_if(
            $lastReply === null || ! (bool) $lastReply->is_admin,
            422,
            'Vous devez attendre la réponse d’un administrateur.',
        );

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:20000'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => [
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,gif,webp,pdf,txt,log,zip,rar,7z,doc,docx,xls,xlsx',
            ],
        ]);

        $replyId = DB::table('ticket_replies')->insertGetId([
            'ticket_id' => $ticket,
            'user_id' => $request->user()->id,
            'is_admin' => false,
            'message' => $validated['message'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->storeAttachments(
            $request,
            $ticket,
            $replyId,
        );

        DB::table('tickets')->where('id', $ticket)->update([
            'status' => $record->assigned_to
                ? 'waiting_admin'
                : 'open',
            'waiting_for' => 'admin',
            'last_reply_by' => $request->user()->id,
            'last_replied_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Votre réponse a été envoyée.');
    }

    public function attachment(
        Request $request,
        int $attachment,
    ): StreamedResponse {
        $file = DB::table('ticket_attachments')
            ->join(
                'tickets',
                'tickets.id',
                '=',
                'ticket_attachments.ticket_id',
            )
            ->where('ticket_attachments.id', $attachment)
            ->where('tickets.user_id', $request->user()->id)
            ->select('ticket_attachments.*')
            ->first();

        abort_if($file === null, 404);
        abort_unless(
            Storage::disk($file->disk)->exists($file->path),
            404,
        );

        return Storage::disk($file->disk)->download(
            $file->path,
            $file->original_name,
        );
    }

    private function storeAttachments(
        Request $request,
        int $ticketId,
        int $replyId,
    ): void {
        foreach ($request->file('attachments', []) as $file) {
            $path = $file->store(
                "tickets/{$ticketId}",
                'public',
            );

            DB::table('ticket_attachments')->insert([
                'ticket_id' => $ticketId,
                'ticket_reply_id' => $replyId,
                'user_id' => $request->user()->id,
                'disk' => 'public',
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

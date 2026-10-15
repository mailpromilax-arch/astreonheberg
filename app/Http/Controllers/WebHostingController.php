<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

final class WebHostingController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('store/WebHosting');
    }
}

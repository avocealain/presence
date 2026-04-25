<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        $redirect = route($request->user()->dashboardRouteName(), absolute: false);

        return $request->user()->hasVerifiedEmail()
                    ? redirect()->intended($redirect)
                    : Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
    }
}

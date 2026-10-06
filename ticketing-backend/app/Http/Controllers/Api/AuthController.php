<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        try {
            $response = Http::withBasicAuth(env('HRIS_username'), env('HRIS_password'))
                ->asForm()
                ->acceptJson()
                ->timeout(10)
                ->post(env('HRIS_LOGIN_URL'), [
                    'IBSW_KEY' => env('HRIS_IBSW_KEY'),
                    'datauser' => $request->email,
                    'passcode' => $request->password
                ]);
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                $e->getMessage()
            ]);
        }

        if ($response->successful() && $response->json('status') === true) {
            $hrisData = $response->json('data');

            $email      = strtoupper(trim($hrisData['user_email'] ?? $request->email));
            $name       = $hrisData['name'];
            $nik        = (string) ($hrisData['nik'] ?? $hrisData['employee_id'] ?? '');
            $position   = $hrisData['position']    ?? null;
            $division   = $hrisData['division']    ?? null;
            $department = $hrisData['department']  ?? null;
            $divhead    = $hrisData['divhead']     ?? null;
            $telephone  = $hrisData['telephone']   ?? null;

            if ($nik === '') {
                $nik = $hrisData['employee_id'] ?? 'TMP-' . strtoupper(explode('@', $email)[0]);
            }

            $user = User::where('email', $email)->first()
                ?? User::where('nik', $nik)->first();

            if ($user) {
                $user->update([
                    'name'       => $name,
                    'email'      => $email,
                    'nik'        => $nik,
                    'position'   => $position,
                    'division'   => $division,
                    'department' => $department,
                    'divhead'    => $divhead,
                    'telephone'  => $telephone,
                ]);
            } else {
                $user = User::create([
                    'name'       => $name,
                    'email'      => $email,
                    'nik'        => $nik,
                    'position'   => $position,
                    'division'   => $division,
                    'department' => $department,
                    'divhead'    => $divhead,
                    'telephone'  => $telephone,
                    'password'   => null,
                ]);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'message' => 'Login berhasil',
                'user'    => [
                    'id'         => $user->id,
                    'name'       => $user->name,
                    'email'      => $user->email,
                    'nik'        => $user->nik,
                    'position'   => $user->position,
                    'division'   => $user->division,
                    'department' => $user->department,
                    'divhead'    => $user->divhead,
                ],
                'token' => $token,
            ]);
        }

        throw ValidationException::withMessages([
            'message' => 'Email atau password salah.',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}

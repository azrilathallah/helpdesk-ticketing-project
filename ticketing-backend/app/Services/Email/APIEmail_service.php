<?php

namespace App\Services\Email;

class APIEmail_service
{
    public function posting_email($data)
    {
        // 1. Tambahkan metadata & konversi attachment file ke Base64
        $data['ip_address'] = $this->get_client_ip();

        if (!empty($data['email_attachments']) && is_array($data['email_attachments'])) {
            foreach ($data['email_attachments'] as $i => $attachment) {
                if (isset($attachment['path']) && file_exists($attachment['path'])) {
                    $fileData = file_get_contents($attachment['path']);
                    $data['email_attachments'][$i]['content'] = base64_encode($fileData);
                }
            }
        }

        // 2. Ambil kredensial dari config / environment
        $username = config('services.api_email.username') ?? $_ENV['USER_EMAIL_API_AUTH'] ?? '';
        $password = config('services.api_email.password') ?? $_ENV['PASS_EMAIL_API_AUTH'] ?? '';

        // Pastikan URL diawali http:// (cURL PHP wajib menyertakan protokol)
        $endpoint = trim((string) (config('services.api_email.endpoint') ?? $_ENV['ENDPOINT_API_POST_EMAIL'] ?? ''));
        if (!preg_match("~^(?:f|ht)tps?://~i", $endpoint)) {
            $endpoint = "http://" . $endpoint;
        }

        // 3. Konfigurasi cURL persis dari Postman
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL            => $endpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING       => '',
            CURLOPT_MAXREDIRS      => 10,
            CURLOPT_TIMEOUT        => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_POSTREDIR      => CURL_REDIR_POST_ALL, // Mencegah POST berubah jadi GET saat redirect
            CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST  => 'POST',
            CURLOPT_POSTFIELDS     => json_encode($data),

            // Basic Authentication
            CURLOPT_HTTPAUTH       => CURLAUTH_BASIC,
            CURLOPT_USERPWD        => $username . ":" . $password,

            CURLOPT_HTTPHEADER     => array(
                'Content-Type: application/json',
                'User-Agent: PostmanRuntime/7.32.3'
            ),

            // Bypass SSL jika testing di localhost
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ));

        // 4. Eksekusi cURL
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        if (curl_errno($curl)) {
            $error = curl_error($curl);
            curl_close($curl);
            // Kembalikan dalam bentuk struktur array/json yang seragam
            return json_encode([
                'status' => false,
                'message' => 'Error Curl: ' . $error
            ]);
        }

        curl_close($curl);

        // Langsung kembalikan respons mentah dari server API (karena server API sudah format JSON)
        // Berapapun status code-nya (200, 401, 500), biarkan JSON-nya lolos ke controller.
        return $response;
    }

    function get_client_ip()
    {
        $ip_keys = array(
            'HTTP_CF_CONNECTING_IP', // Cloudflare
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CLIENT_IP',
            'REMOTE_ADDR'
        );

        foreach ($ip_keys as $key) {
            if (!empty($_SERVER[$key])) {

                $ip_list = explode(',', $_SERVER[$key]);

                foreach ($ip_list as $ip) {
                    $ip = trim($ip);

                    if (filter_var($ip, FILTER_VALIDATE_IP)) {
                        return $ip;
                    }
                }
            }
        }

        return 'UNKNOWN';
    }
}

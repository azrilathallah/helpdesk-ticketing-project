# Dokumentasi Penggunaan: `APIEmail_service`

Modul ini berfungsi sebagai jembatan (*library/helper*) untuk melakukan pengiriman email melalui layanan terpusat (**API Email Service**). Modul ini mendukung pengiriman email kepada penerima utama (`To`), tembusan (`CC` & `BCC`), isi pesan berformat HTML, serta lampiran file (*attachments*) baik tunggal maupun ganda.

---

## 📋 Prasyarat

Pastikan file `APIEmail_service.php` sudah dikonfigurasi dan dimuat (*loaded*) ke dalam *project* Anda sebagai *library* atau *helper* (misalnya melalui *autoload* atau pemanggilan manual seperti `$this->load->library('APIEmail_service');` pada CodeIgniter).

---

## 🚀 Cara Penggunaan

### 1. Menyiapkan Payload & Memanggil Service

Susun data yang akan dikirimkan ke dalam array asosiatif (`$data`), kemudian panggil method `posting_email($data)` dari instance `apiemail_service`.

```php
// 1. Siapkan struktur data (payload)
$data = [
    'app_name'          => 'FPS APPS',
    'email_to'          => $email_to,
    'created_by'        => $data['header']->email ?: ($this->email ?: ""),
    'email_cc'          => $email_cc,
    'email_bcc'         => $email_bcc,
    'email_subject'     => $email_subject,
    'email_body'        => $html,
    'email_attachments' => [
        [
            'filename' => $data['header']->documents_attachment,
            'path'     => $absoluteDir . $data['header']->documents_attachment 
        ],
        [
            'filename' => $data['header']->documents_attachment,
            'path'     => $absoluteDir . $data['header']->documents_attachment 
        ]
    ]
];

// 2. Eksekusi pengiriman email melalui service
$response = $this->apiemail_service->posting_email($data);
```

### 2. Penanganan Respons (Response Handling)

Method `posting_email()` akan mengembalikan data dalam format **string JSON**. Lakukan proses `json_decode` dan validasi status pengiriman seperti contoh di bawah ini:

```php
// Ubah string JSON dari service menjadi array associative
$dataRes = json_decode($response, true);

// Validasi apakah format respons valid dan memiliki key 'status'
if (is_array($dataRes) && isset($dataRes['status'])) {
    
    // Kondisi 1: Pengiriman Berhasil (status === true)
    if ($dataRes['status'] === true) {
        return [
            'status'  => true, 
            'message' => 'Success, data berhasil disimpan.'
        ];
    } 
    // Kondisi 2: Pengiriman Gagal / Unauthorized / Error 401 (status === false)
    else {
        return [
            'status'  => false, 
            'message' => $dataRes['message'] ?? 'Terjadi kesalahan'
        ];
    }
}

// Fallback: Jika respons dari service kosong atau format JSON rusak
return [
    'status'  => false, 
    'message' => 'Format respons dari service API EMAIL SERVICES tidak valid.'
];
```

---

## 📖 Referensi Parameter Payload

Berikut adalah detail parameter yang digunakan pada variabel `$data`:

| Parameter | Tipe Data | Wajib | Keterangan |
| :--- | :--- | :---: | :--- |
| `app_name` | `string` | Ya | Nama identitas aplikasi pengirim (Contoh: `'FPS APPS'`). |
| `email_to` | `string` / `array` | Ya | Alamat email tujuan utama penerima. |
| `created_by` | `string` | Ya | Alamat email pemohon (*requestor*) atau penginisiasi proses. |
| `email_cc` | `string` / `array` | Tidak | Alamat email penerima tembusan (*Carbon Copy*). |
| `email_bcc` | `string` / `array` | Tidak | Alamat email penerima tembusan tersembunyi (*Blind Carbon Copy*). |
| `email_subject` | `string` | Ya | Judul atau subjek dari email yang dikirimkan. |
| `email_body` | `string` (HTML) | Ya | Konten utama isi email (mendukung tag HTML). |
| `email_attachments` | `array` | Tidak | Daftar lampiran dokumen. Setiap item wajib berisi key `filename` dan `path` (lokasi direktori absolut file di server). |

---

## ⚠️ Catatan Penting

* **Path Lampiran (`path`)**: Pastikan variabel `$absoluteDir` mengarah ke *path* absolut server yang valid (contoh: `/var/www/html/project/uploads/`), bukan URL publik (`http://...`), agar file dapat dibaca dengan baik oleh sistem.
* **Kredensial API**: Jika muncul pesan error `Unauthorized: Invalid credentials...`, periksa kembali konfigurasi *API Key* atau *Token* di dalam file konfigurasi `APIEmail_service.php`.
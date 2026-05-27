<?php

namespace App\Services;

use App\Models\Otp;
use Carbon\Carbon;
use Twilio\Rest\Client;

class OtpService
{
    protected $client;
    protected $from;

    public function __construct()
    {
        $this->client = new Client(
            env('TWILIO_SID'),
            env('TWILIO_TOKEN')
        );

        $this->from = env('TWILIO_FROM');
    }

    // 🔹 Generate OTP
    public function generateOtp($phone)
    {
    $otp = rand(100000, 999999);

    Otp::updateOrCreate(
        ['phone_number' => $phone],
        [
            'otp' => $otp,
            'expires_at' => Carbon::now()->addMinutes(5)
        ]
    );

    $this->sendSms($phone, "Your OTP code is: $otp");

    logger("OTP for $phone is $otp");

    return $otp;
    }
    // 🔹 Send SMS
    public function sendSms($to, $message)
{
    try {
        logger("Sending SMS to $to: $message");

        return $this->client->messages->create($to, [
            'from' => $this->from,
            'body' => $message
        ]);

    } catch (\Exception $e) {
        logger("Twilio Error: " . $e->getMessage());

        // ❗ prevent crash
        return false;
    }
}

    // 🔹 Verify OTP
    public function verifyOtp($phone, $otp)
    {
        $phone = $this->formatPhone($phone);

        $record = Otp::where('phone_number', $phone)->first();

        if (!$record) {
            return false;
        }

        if ($record->otp != $otp) {
            return false;
        }

        if (now()->greaterThan($record->expires_at)) {
            return false;
        }

        return true;
    }

    // 🔹 Format phone (Malaysia)
    public function formatPhone($phone)
    {
        $phone = trim($phone);

        if (str_starts_with($phone, '0')) {
            $phone = '+60' . substr($phone, 1);
        }

        return $phone;
    }
}
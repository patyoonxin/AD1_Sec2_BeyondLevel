<?php

namespace App\Services;

use App\Models\Otp;
use Carbon\Carbon;
use Twilio\Rest\Client;

class OtpService
{
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

        // SEND SMS HERE 👇
        $this->sendSms($phone, $otp);


        return $otp;
    }

    // 🔹 Send OTP
    public function sendSms($phone, $otp)
    {
        logger("Sending OTP $otp to $phone");

        $sid = env('TWILIO_SID');
        $token = env('TWILIO_TOKEN');
        $from = env('TWILIO_FROM');

        $client = new Client($sid, $token);

        $client->messages->create(
            $phone,
            [
                'from' => $from,
                'body' => "Your OTP code is: $otp"
            ]
        );

    }

    // 🔹 Verify OTP
    public function verifyOtp($phone, $otp)
    {
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

    
    public function formatPhone($phone)
    {
    $phone = trim($phone);

    if (str_starts_with($phone, '0')) {
        $phone = '+60' . substr($phone, 1);
    }

    return $phone;
    }

   
}
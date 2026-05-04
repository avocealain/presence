<?php

namespace App\Services;

use App\Models\QRSession;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Writer\SvgWriter;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Exception;

class QRCodeService
{
    /**
     * Generate QR code image from QRSession
     *
     * @param QRSession $session
     * @return string Public URL to the QR code image
     * @throws Exception
     */
    public function generate(QRSession $session): string
    {
        try {
            // Create directory if it doesn't exist
            $storagePath = config('attendance.qr.storage_path');
            if (!Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->makeDirectory($storagePath);
            }

            // Generate QR code
            $qrCode = new QrCode(
                data: $session->token,
                encoding: new Encoding('UTF-8'),
                errorCorrectionLevel: $this->getErrorCorrectionLevel(),
                size: config('attendance.qr.size'),
                margin: config('attendance.qr.margin'),
                roundBlockSizeMode: RoundBlockSizeMode::Margin,
            );

            // Create writer based on format
            $format = config('attendance.qr.image_format', 'png');
            $writer = $format === 'svg' ? new SvgWriter() : new PngWriter();

            // Generate image
            $result = $writer->write($qrCode);
            $imageData = $result->getString();

            // Create unique filename
            $filename = sprintf(
                '%s/%s.%s',
                $storagePath,
                $session->id . '_' . time(),
                $format
            );

            // Store image to public disk
            Storage::disk('public')->put($filename, $imageData);

            // Update QRSession with path
            $session->update([
                'qr_code_path' => $filename,
            ]);

            // Return public URL - ensure it's absolute and HTTPS
            $url = Storage::disk('public')->url($filename);
            return $this->ensureAbsoluteHttpsUrl($url);
        } catch (Exception $e) {
            Log::error('QR code generation failed', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);
            throw new Exception('Failed to generate QR code: ' . $e->getMessage());
        }
    }

    /**
     * Ensure URL is absolute and HTTPS
     */
    private function ensureAbsoluteHttpsUrl(string $url): string
    {
        if (empty($url)) {
            return '';
        }

        if (str_starts_with($url, 'https://')) {
            return $url;
        }

        if (str_starts_with($url, 'http://')) {
            return str_replace('http://', 'https://', $url);
        }

        if (str_starts_with($url, '//')) {
            return 'https:' . $url;
        }

        if (str_starts_with($url, '/')) {
            $appUrl = rtrim(config('app.url', 'https://localhost'), '/');
            return $appUrl . $url;
        }

        return $url;
    }

    /**
     * Get error correction level from config
     *
     * @return ErrorCorrectionLevel
     */
    private function getErrorCorrectionLevel(): ErrorCorrectionLevel
    {
        $level = config('attendance.qr.error_correction', 'high');

        return match ($level) {
            'low' => ErrorCorrectionLevel::Low,
            'medium' => ErrorCorrectionLevel::Medium,
            'quartile' => ErrorCorrectionLevel::Quartile,
            'high' => ErrorCorrectionLevel::High,
            default => ErrorCorrectionLevel::High,
        };
    }

    /**
     * Delete QR code image
     *
     * @param QRSession $session
     * @return bool
     */
    public function delete(QRSession $session): bool
    {
        try {
            if ($session->qr_code_path && Storage::disk('public')->exists($session->qr_code_path)) {
                Storage::disk('public')->delete($session->qr_code_path);
                return true;
            }
            return false;
        } catch (Exception $e) {
            Log::error('QR code deletion failed', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Cleanup expired QR code images
     *
     * @return int Number of files deleted
     */
    public function cleanup(): int
    {
        try {
            $storageDir = config('attendance.qr.storage_path');
            $files = Storage::disk('public')->files($storageDir);

            $deleted = 0;
            $cutoffDays = config('attendance.cleanup.delete_expired_after_days', 7);
            $cutoffTime = now()->subDays($cutoffDays)->timestamp;

            foreach ($files as $file) {
                $lastModified = Storage::disk('public')->lastModified($file);
                if ($lastModified < $cutoffTime) {
                    Storage::disk('public')->delete($file);
                    $deleted++;
                }
            }

            Log::info('QR code cleanup completed', [
                'deleted_count' => $deleted,
            ]);

            return $deleted;
        } catch (Exception $e) {
            Log::error('QR code cleanup failed', [
                'error' => $e->getMessage(),
            ]);
            return 0;
        }
    }

    /**
     * Generate test QR code URL for development
     *
     * @param string $token
     * @return string
     */
    public function generateTest(string $token): string
    {
        try {
            $qrCode = new QrCode(
                data: $token,
                encoding: new Encoding('UTF-8'),
                errorCorrectionLevel: ErrorCorrectionLevel::High,
                size: config('attendance.qr.size'),
                margin: config('attendance.qr.margin'),
            );

            $writer = new PngWriter();
            $result = $writer->write($qrCode);
            $imageData = $result->getString();

            // Return as data URI for development
            return 'data:image/png;base64,' . base64_encode($imageData);
        } catch (Exception $e) {
            Log::error('Test QR code generation failed', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}

<?php
// Intelligent Auto-Unzip & Diagnostic Script for Hostinger
header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html><html><head><title>Hostinger Unzip Helper</title>";
echo "<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; max-width: 800px; margin: 0 auto; }
.card { background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
h1 { color: #38bdf8; font-size: 24px; margin-top: 0; }
.success { background: #064e3b; border: 1px solid #059669; color: #a7f3d0; padding: 16px; border-radius: 8px; margin: 16px 0; }
.danger { background: #7f1d1d; border: 1px solid #dc2626; color: #fecaca; padding: 16px; border-radius: 8px; margin: 16px 0; }
.info { background: #1e3a8a; border: 1px solid #2563eb; color: #bfdbfe; padding: 16px; border-radius: 8px; margin: 16px 0; }
ul { margin: 8px 0; padding-left: 20px; }
code { background: #0f172a; color: #f43f5e; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
.btn { display: inline-block; background: #0284c7; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px; }
</style></head><body><div class='card'>";

echo "<h1>🚀 Hostinger Website Unzip Tool (TrustPro)</h1>";

// 1. Scan for zip files in current directory
$zipFiles = glob("*.zip");

if (empty($zipFiles)) {
    echo "<div class='danger'>";
    echo "<h3>❌ No ZIP File Found in <code>public_html</code>!</h3>";
    echo "<p>Please ensure you have uploaded <code>dist.zip</code> or <code>hostinger-upload.zip</code> into your Hostinger <strong>public_html</strong> folder.</p>";
    echo "<p><strong>Current files found in this folder:</strong></p><ul>";
    $allFiles = array_diff(scandir('.'), array('.', '..'));
    foreach ($allFiles as $f) {
        echo "<li>" . htmlspecialchars($f) . "</li>";
    }
    echo "</ul></div>";
    echo "</div></body></html>";
    exit;
}

// 2. Select target zip file
$targetZip = $zipFiles[0];
if (isset($_GET['file']) && in_array($_GET['file'], $zipFiles)) {
    $targetZip = $_GET['file'];
}

echo "<div class='info'>";
echo "<p>🔍 Found ZIP file: <strong>" . htmlspecialchars($targetZip) . "</strong> (" . round(filesize($targetZip) / 1024, 1) . " KB)</p>";
if (count($zipFiles) > 1) {
    echo "<p>Other ZIP files found: ";
    foreach ($zipFiles as $zf) {
        echo "<a style='color:#38bdf8; margin-right:10px;' href='?file=" . urlencode($zf) . "'>" . htmlspecialchars($zf) . "</a> ";
    }
    echo "</p>";
}
echo "</div>";

// 3. Attempt Extraction
$extracted = false;
$errorMsg = "";

// Method A: ZipArchive
if (class_exists('ZipArchive')) {
    $zip = new ZipArchive;
    $res = $zip->open($targetZip);
    if ($res === TRUE) {
        if ($zip->extractTo('./')) {
            $zip->close();
            $extracted = true;
        } else {
            $errorMsg = "ZipArchive extractTo() failed. Check folder write permissions.";
            $zip->close();
        }
    } else {
        $errorMsg = "ZipArchive open failed with error code: " . $res . ". ";
        switch ($res) {
            case ZipArchive::ER_NOENT: $errorMsg .= "No such file."; break;
            case ZipArchive::ER_EXISTS: $errorMsg .= "File already exists."; break;
            case ZipArchive::ER_READ: $errorMsg .= "Read error or file truncated/incomplete upload."; break;
            case ZipArchive::ER_INVAL: $errorMsg .= "Invalid argument."; break;
            case ZipArchive::ER_MEMORY: $errorMsg .= "Memory failure."; break;
            case ZipArchive::ER_NOZIP: $errorMsg .= "Not a valid zip archive (file corrupted during upload)."; break;
            case ZipArchive::ER_OPEN: $errorMsg .= "Can't open file."; break;
            default: $errorMsg .= "Unknown zip error."; break;
        }
    }
} else {
    $errorMsg = "PHP ZipArchive extension is disabled on this server.";
}

// Method B: Fallback to exec("unzip") if Method A failed
if (!$extracted && function_exists('exec')) {
    @exec("unzip -o " . escapeshellarg($targetZip) . " 2>&1", $output, $returnVar);
    if ($returnVar === 0) {
        $extracted = true;
    } else {
        $errorMsg .= " | Shell unzip fallback failed: " . implode(" ", $output);
    }
}

// 4. Output Result
if ($extracted) {
    echo "<div class='success'>";
    echo "<h2>🎉 Extractions Successful / Unzip Ho Gaya!</h2>";
    echo "<p>Your website files are now extracted and live in <code>public_html</code>!</p>";
    echo "<p><strong>Next Step:</strong> Open your domain <a style='color:#a7f3d0; text-decoration:underline;' href='https://" . $_SERVER['HTTP_HOST'] . "' target='_blank'>https://" . $_SERVER['HTTP_HOST'] . "</a> to see your live website.</p>";
    echo "<p style='margin-top:15px; color:#fecaca;'>⚠️ <strong>Security Warning:</strong> Please delete <code>unzip.php</code> and <code>" . htmlspecialchars($targetZip) . "</code> from Hostinger File Manager now!</p>";
    echo "</div>";
} else {
    echo "<div class='danger'>";
    echo "<h2>❌ Extraction Failed</h2>";
    echo "<p><strong>Reason:</strong> " . htmlspecialchars($errorMsg) . "</p>";
    echo "<hr style='border: 0; border-top: 1px solid #dc2626; margin: 15px 0;' />";
    echo "<h3>💡 How to extract directly in Hostinger File Manager (Alternative 100% Working Method):</h3>";
    echo "<ol>";
    echo "<li>Go to <strong>Hostinger hPanel</strong> -> <strong>File Manager</strong> -> <strong>public_html</strong>.</li>";
    echo "<li>Right click on <code>" . htmlspecialchars($targetZip) . "</code> file.</li>";
    echo "<li>Click <strong>Extract</strong> or <strong>Uncompress</strong>.</li>";
    echo "<li>Select current directory (<code>.</code> or <code>public_html</code>).</li>";
    echo "</ol>";
    echo "</div>";
}

echo "</div></body></html>";
?>

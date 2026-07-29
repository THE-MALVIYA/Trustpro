import os
import zipfile
import base64

build_dir = 'dist'
zip_filename = 'dist.zip'

# 1. Clean up previous archives
old_files = [
    'dist.zip', 'hostinger-upload.zip', 'trustpro-build.zip', 
    'trustpro-hostinger.zip', 'hostinger-installer.php', 'install.php'
]
for f in old_files:
    if os.path.exists(f):
        try:
            os.remove(f)
        except Exception:
            pass

# 2. Build dist.zip containing ONLY static production files
# Exclude server files and php scripts from the pure static archive
excluded_files = {'server.cjs', 'server.cjs.map', 'unzip.php', 'install.php'}

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(build_dir):
        for file in files:
            if file in excluded_files:
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, build_dir)
            
            # Standard unix file permissions (0644)
            zinfo = zipfile.ZipInfo.from_file(file_path, arcname)
            zinfo.external_attr = 0o644 << 16
            with open(file_path, 'rb') as f:
                zf.writestr(zinfo, f.read())

print("=== Created dist.zip successfully ===")

# Verify dist.zip integrity
with zipfile.ZipFile(zip_filename, 'r') as zf:
    test_res = zf.testzip()
    print("Integrity Check:", "PASSED (100% valid)" if test_res is None else f"FAILED on {test_res}")
    print("Files included in dist.zip:")
    for name in zf.namelist():
        print(f"  - {name}")

# 3. Read dist.zip bytes and encode to base64
with open(zip_filename, 'rb') as f:
    zip_bytes = f.read()

b64_zip = base64.b64encode(zip_bytes).decode('utf-8')

# 4. Create install.php (Single-file PHP Installer containing embedded base64 zip)
php_installer_content = f"""<?php
// Hostinger One-Click Website Installer for TrustPro
header('Content-Type: text/html; charset=utf-8');

$b64Data = "{b64_zip}";

?>
<!DOCTYPE html>
<html>
<head>
    <title>TrustPro Hostinger Installer</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; max-width: 700px; margin: 0 auto; }}
        .card {{ background: #1e293b; border-radius: 12px; padding: 28px; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }}
        h1 {{ color: #38bdf8; font-size: 24px; margin-top: 0; }}
        .success {{ background: #064e3b; border: 1px solid #059669; color: #a7f3d0; padding: 18px; border-radius: 8px; margin: 20px 0; }}
        .danger {{ background: #7f1d1d; border: 1px solid #dc2626; color: #fecaca; padding: 18px; border-radius: 8px; margin: 20px 0; }}
        code {{ background: #0f172a; color: #f43f5e; padding: 2px 6px; border-radius: 4px; font-family: monospace; }}
        ul {{ margin: 10px 0; padding-left: 20px; }}
        a.btn {{ display: inline-block; background: #0284c7; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }}
    </style>
</head>
<body>
<div class="card">
    <h1>🚀 TrustPro Hostinger One-Click Installer</h1>
<?php
$zipFile = 'dist.zip';
$zipContent = base64_decode($b64Data);

if (file_put_contents($zipFile, $zipContent) === false) {{
    echo "<div class='danger'><h3>❌ File Write Error</h3><p>Could not write <code>dist.zip</code> to disk. Check folder permissions of <code>public_html</code>.</p></div></div></body></html>";
    exit;
}}

$extracted = false;
$errorMsg = "";

if (class_exists('ZipArchive')) {{
    $zip = new ZipArchive;
    if ($zip->open($zipFile) === TRUE) {{
        if ($zip->extractTo('./')) {{
            $zip->close();
            $extracted = true;
        }} else {{
            $errorMsg = "Could not extract files. Check folder permissions.";
            $zip->close();
        }}
    }} else {{
        $errorMsg = "ZipArchive failed to open generated zip.";
    }}
}} else {{
    if (function_exists('exec')) {{
        @exec("unzip -o dist.zip 2>&1", $out, $ret);
        if ($ret === 0) {{ $extracted = true; }}
    }}
}}

if ($extracted) {{
    echo "<div class='success'>";
    echo "<h2>🎉 Website Successfully Installed & Live!</h2>";
    echo "<p>All production files (<code>index.html</code>, <code>.htaccess</code>, <code>assets/</code>) have been extracted into <code>public_html</code>.</p>";
    echo "<p>Click below to test your live website:</p>";
    echo "<a class='btn' href='https://" . $_SERVER['HTTP_HOST'] . "' target='_blank'>🌐 Open Live Website</a>";
    echo "<br/><br/><p style='color:#fecaca;'>⚠️ <strong>Security Step:</strong> Delete <code>install.php</code> from Hostinger File Manager now!</p>";
    echo "</div>";
}} else {{
    echo "<div class='danger'>";
    echo "<h2>⚠️ ZIP File Created</h2>";
    echo "<p>Created fresh uncorrupted <code>dist.zip</code> (" . round(strlen($zipContent)/1024, 1) . " KB) in <code>public_html</code>.</p>";
    echo "<p>Now in Hostinger File Manager, right-click <code>dist.zip</code> -> click <strong>Extract</strong>.</p>";
    echo "</div>";
}}
?>
</div>
</body>
</html>
"""

os.makedirs('public', exist_ok=True)
with open('public/install.php', 'w') as f:
    f.write(php_installer_content)

os.makedirs('dist', exist_ok=True)
with open('dist/install.php', 'w') as f:
    f.write(php_installer_content)

# Re-build dist.zip including install.php as well
with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(build_dir):
        for file in files:
            if file in {'server.cjs', 'server.cjs.map', 'unzip.php'}:
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, build_dir)
            
            zinfo = zipfile.ZipInfo.from_file(file_path, arcname)
            zinfo.external_attr = 0o644 << 16
            with open(file_path, 'rb') as f:
                zf.writestr(zinfo, f.read())

print("=== Updated dist.zip containing production files + install.php ===")

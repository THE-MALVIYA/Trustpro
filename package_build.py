import os
import zipfile

build_dir = 'dist'
zip_filename = 'dist.zip'

# 1. Clean up old archive files
old_files = [
    'dist.zip', 'hostinger-upload.zip', 'trustpro-build.zip', 
    'trustpro-hostinger.zip', 'hostinger-installer.php', 'install.php', 'unzip.php',
    os.path.join('public', 'install.php'), os.path.join('public', 'unzip.php'),
    os.path.join('dist', 'install.php'), os.path.join('dist', 'unzip.php')
]

for f in old_files:
    if os.path.exists(f):
        try:
            os.remove(f)
            print(f"Removed old file: {f}")
        except Exception as e:
            print(f"Could not remove {f}: {e}")

# 2. Files to strictly exclude from static hosting ZIP
excluded_files = {'server.cjs', 'server.cjs.map', 'unzip.php', 'install.php'}

# 3. Create clean compressed dist.zip using standard DEFLATED mode
with zipfile.ZipFile(zip_filename, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for root, dirs, files in os.walk(build_dir):
        for file in files:
            if file in excluded_files:
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, build_dir)
            zf.write(file_path, arcname)

print("=== Created clean compressed dist.zip successfully ===")

# 4. Verify dist.zip integrity
with zipfile.ZipFile(zip_filename, 'r') as zf:
    test_res = zf.testzip()
    if test_res is None:
        print("Integrity Check: PASSED (100% valid ZIP)")
    else:
        print(f"Integrity Check: FAILED on {test_res}")
        
    print("\nFiles inside dist.zip:")
    total_uncompressed = 0
    total_compressed = 0
    for info in zf.infolist():
        total_uncompressed += info.file_size
        total_compressed += info.compress_size
        print(f"  - {info.filename} ({info.file_size} bytes -> compressed: {info.compress_size} bytes)")
        
    print(f"\nTotal ZIP Size: {round(total_compressed/1024, 2)} KB (Uncompressed: {round(total_uncompressed/1024, 2)} KB)")

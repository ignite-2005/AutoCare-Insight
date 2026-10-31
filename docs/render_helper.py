import os
import subprocess
from PIL import Image

# Output paths
docs_dir = os.path.dirname(__file__) if '__file__' in locals() else os.path.abspath('docs')
root_dir = os.path.dirname(docs_dir)
db_dir = os.path.join(root_dir, 'database')

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def render_html_to_jpeg(html_path, output_jpeg_paths, width=3600, height=2400):
    temp_png = html_path.replace('.html', '_temp.png')
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--window-size={width},{height}",
        f"--screenshot={temp_png}",
        html_path
    ]
    print(f"Rendering {html_path} via Chrome headless ({width}x{height})...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Chrome error: {res.stderr}")
        return False

    if not os.path.exists(temp_png):
        print(f"Error: Screenshot file not created at {temp_png}")
        return False

    print(f"Screenshot captured ({os.path.getsize(temp_png)} bytes). Converting to optimized JPEG...")
    img = Image.open(temp_png)
    rgb_img = img.convert('RGB')
    for out_path in output_jpeg_paths:
        rgb_img.save(out_path, 'JPEG', quality=98, optimize=True)
        print(f"Saved: {out_path} ({os.path.getsize(out_path):,} bytes)")

    if os.path.exists(temp_png):
        os.remove(temp_png)
    return True

print("Helper loaded successfully.")


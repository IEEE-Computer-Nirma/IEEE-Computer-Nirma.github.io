import http.server
import socketserver
import threading
import time
from playwright.sync_api import sync_playwright

PORT = 8089

class QuietHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def start_server():
    with socketserver.TCPServer(("", PORT), QuietHTTPRequestHandler) as httpd:
        httpd.serve_forever()

def main():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(1)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 1800})

        url = f"http://localhost:{PORT}/embed/test-embed.html"
        print(f"Navigating to {url}...")
        page.goto(url, wait_until="networkidle")

        # Wait for widget container
        page.wait_for_selector(".ieee-cs-nirma-widget__guest-card")
        time.sleep(1)

        page.screenshot(path="widget_updated_verification.png", full_page=True)
        print("Saved screenshot to widget_updated_verification.png")

        browser.close()

if __name__ == "__main__":
    main()

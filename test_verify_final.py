import os
from playwright.sync_api import sync_playwright

def run():
    os.makedirs('/home/jules/verification', exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1000, 'height': 1200})
        page.goto('http://localhost:8080/embed/index.html')
        page.wait_for_selector('.ieee-cs-nirma-widget h2')
        page.wait_for_timeout(1000)
        page.screenshot(path='/home/jules/verification/widget_final_clean.png', full_page=True)
        browser.close()

if __name__ == '__main__':
    run()

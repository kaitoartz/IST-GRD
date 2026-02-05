from playwright.sync_api import sync_playwright

def verify_game_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Load Page
        print("Loading page...")
        page.goto("http://localhost:5001/grd-bag-game/")
        page.wait_for_load_state("networkidle")

        # Screenshot Intro
        print("Screenshotting Intro...")
        page.screenshot(path="verification_intro.png")

        # 2. Select Challenge Mode
        print("Selecting Challenge Mode...")
        # Find the radio button or label. The input has value="challenge"
        # We can click the label containing "Modo Desafío"
        page.locator("label").filter(has_text="Modo Desafío").click()

        # 3. Click Start
        print("Clicking Start...")
        page.click("#btn-start")

        # 4. Check Briefing (Briefing lasts 3s)
        # It should be visible immediately after start
        page.wait_for_selector("#screen-briefing", state="visible")
        print("Screenshotting Briefing...")
        page.screenshot(path="verification_briefing.png")

        # 5. Wait for Action Phase
        # Briefing is 3s. Wait 4s to be safe.
        print("Waiting for Action Phase...")
        page.wait_for_timeout(4000)

        # Check if Game screen is visible
        if page.is_visible("#screen-game"):
            print("Action phase active.")
            print("Screenshotting Game...")
            page.screenshot(path="verification_game.png")
        else:
            print("Error: Game screen not visible after briefing.")

        # 6. Pause Game
        print("Clicking Pause...")
        page.click("#btn-pause")
        page.wait_for_selector("#screen-pause", state="visible")
        print("Screenshotting Pause...")
        page.screenshot(path="verification_pause.png")

        browser.close()

if __name__ == "__main__":
    try:
        verify_game_flow()
        print("Verification script finished successfully.")
    except Exception as e:
        print(f"Verification script failed: {e}")

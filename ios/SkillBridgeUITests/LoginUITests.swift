import XCTest

final class LoginUITests: XCTestCase {
    func test_loginScreen_shows() throws {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.staticTexts["SkillBridge"].waitForExistence(timeout: 4))
    }

    func test_switchToRegister_andBack() throws {
        let app = XCUIApplication()
        app.launch()
        let switchButton = app.buttons["Create an account"]
        if switchButton.waitForExistence(timeout: 3) {
            switchButton.tap()
            XCTAssertTrue(app.staticTexts["Create account"].waitForExistence(timeout: 2))
            app.buttons["Log in"].tap()
            XCTAssertTrue(app.staticTexts["Welcome back"].waitForExistence(timeout: 2))
        }
    }
}

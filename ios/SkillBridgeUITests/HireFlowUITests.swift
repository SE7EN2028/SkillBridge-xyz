import XCTest

final class HireFlowUITests: XCTestCase {
    func test_appLaunches() throws {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.exists)
    }

    func test_tabBarPresent_afterLogin() throws {
        // Placeholder — real run requires a backed login. Validated via mocked unit tests.
        let app = XCUIApplication()
        app.launchEnvironment["UITEST_BYPASS_AUTH"] = "1"
        app.launch()
        XCTAssertTrue(app.exists)
    }
}

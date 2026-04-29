import XCTest
@testable import SkillBridge

@MainActor
final class AuthViewModelTests: XCTestCase {
    func test_login_emptyFields_setsError() async {
        let vm = AuthViewModel()
        vm.email = ""
        vm.password = ""
        let ok = await vm.login()
        XCTAssertFalse(ok)
        XCTAssertNotNil(vm.errorMessage)
    }

    func test_register_shortPassword_setsError() async {
        let vm = AuthViewModel()
        vm.name = "Test User"
        vm.email = "test@example.com"
        vm.password = "short"
        let ok = await vm.register()
        XCTAssertFalse(ok)
        XCTAssertNotNil(vm.errorMessage)
    }

    func test_userRole_displayNames() {
        XCTAssertEqual(UserRole.worker.displayName, "Worker")
        XCTAssertEqual(UserRole.employer.displayName, "Employer")
        XCTAssertEqual(UserRole.admin.displayName, "Admin")
    }
}

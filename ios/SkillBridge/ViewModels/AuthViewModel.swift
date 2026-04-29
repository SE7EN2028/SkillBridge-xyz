import Foundation
import SwiftUI

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var name = ""
    @Published var role: UserRole = .worker
    @Published var errorMessage: String?
    @Published var isLoading = false

    func login() async -> Bool {
        guard !email.isEmpty, !password.isEmpty else {
            errorMessage = "Email and password required"
            return false
        }
        errorMessage = nil
        isLoading = true
        defer { isLoading = false }
        do {
            try await AuthService.shared.login(email: email, password: password)
            return true
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
            return false
        }
    }

    func register() async -> Bool {
        guard name.count >= 2, !email.isEmpty, password.count >= 8 else {
            errorMessage = "Fill all fields. Password must be at least 8 chars."
            return false
        }
        errorMessage = nil
        isLoading = true
        defer { isLoading = false }
        do {
            try await AuthService.shared.register(name: name, email: email, password: password, role: role)
            return true
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
            return false
        }
    }
}

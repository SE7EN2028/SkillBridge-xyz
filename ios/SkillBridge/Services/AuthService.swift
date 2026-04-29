import Foundation

@MainActor
final class AuthService: ObservableObject {
    static let shared = AuthService()

    @Published private(set) var currentUser: User?
    @Published private(set) var isAuthenticating: Bool = false

    private let api = APIService.shared
    private let userDefaultsKey = "sb_current_user"

    init() {
        loadPersistedUser()
        Task { await restoreSession() }
    }

    var isLoggedIn: Bool { currentUser != nil }

    func login(email: String, password: String) async throws {
        isAuthenticating = true
        defer { isAuthenticating = false }
        let res: AuthResponse = try await api.post("auth/login",
                                                  body: LoginRequest(email: email, password: password),
                                                  auth: false)
        await applyAuth(res)
    }

    func register(name: String, email: String, password: String, role: UserRole) async throws {
        isAuthenticating = true
        defer { isAuthenticating = false }
        let res: AuthResponse = try await api.post("auth/register",
                                                  body: RegisterRequest(name: name, email: email, password: password, role: role),
                                                  auth: false)
        await applyAuth(res)
    }

    func logout() async {
        if let refresh = KeychainHelper.shared.get(KeychainKey.refreshToken) {
            _ = try? await api.post("auth/logout",
                                    body: RefreshRequest(refreshToken: refresh),
                                    auth: false) as APIService.EmptyResponse
        }
        KeychainHelper.shared.delete(KeychainKey.refreshToken)
        await api.setAccessToken(nil)
        UserDefaults.standard.removeObject(forKey: userDefaultsKey)
        currentUser = nil
    }

    private func restoreSession() async {
        guard let _ = KeychainHelper.shared.get(KeychainKey.refreshToken) else {
            currentUser = nil
            UserDefaults.standard.removeObject(forKey: userDefaultsKey)
            return
        }
    }

    private func applyAuth(_ res: AuthResponse) async {
        await api.setAccessToken(res.accessToken)
        KeychainHelper.shared.set(res.refreshToken, for: KeychainKey.refreshToken)
        currentUser = res.user
        if let data = try? JSONEncoder().encode(res.user) {
            UserDefaults.standard.set(data, forKey: userDefaultsKey)
        }
    }

    private func loadPersistedUser() {
        if let data = UserDefaults.standard.data(forKey: userDefaultsKey),
           let user = try? JSONDecoder().decode(User.self, from: data) {
            currentUser = user
        }
    }
}

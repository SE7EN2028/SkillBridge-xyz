import Foundation

enum UserRole: String, Codable, CaseIterable, Identifiable {
    case worker = "WORKER"
    case employer = "EMPLOYER"
    case admin = "ADMIN"

    var id: String { rawValue }
    var displayName: String {
        switch self {
        case .worker: return "Worker"
        case .employer: return "Employer"
        case .admin: return "Admin"
        }
    }
}

struct User: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let email: String
    let role: UserRole
}

struct AuthResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let user: User
}

struct RegisterRequest: Codable {
    let name: String
    let email: String
    let password: String
    let role: UserRole
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RefreshRequest: Codable {
    let refreshToken: String
}

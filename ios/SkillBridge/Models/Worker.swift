import Foundation

struct WorkerProfile: Codable, Identifiable, Hashable {
    let id: String
    let userId: String
    let bio: String?
    let city: String
    let hourlyRate: Double
    let isAvailable: Bool
    let isVerified: Bool
    let averageRating: Double
    let reviewCount: Int
    let photoUrl: String?
    let createdAt: String
    let updatedAt: String?
    let user: WorkerUser?
    let skills: [Skill]?

    struct WorkerUser: Codable, Hashable {
        let id: String
        let name: String
        let email: String?
    }
}

struct CreateWorkerRequest: Codable {
    let city: String
    let bio: String?
    let hourlyRate: Double
}

struct UpdateWorkerRequest: Codable {
    let city: String?
    let bio: String?
    let hourlyRate: Double?
    let isAvailable: Bool?
}

import Foundation

struct Review: Codable, Identifiable, Hashable {
    let id: String
    let applicationId: String
    let workerProfileId: String
    let reviewerId: String
    let rating: Int
    let comment: String?
    let createdAt: String
    let reviewer: Reviewer?

    struct Reviewer: Codable, Hashable {
        let id: String
        let name: String
    }
}

struct CreateReviewRequest: Codable {
    let applicationId: String
    let rating: Int
    let comment: String?
}

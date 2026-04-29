import Foundation

enum JobStatus: String, Codable {
    case open = "OPEN"
    case inProgress = "IN_PROGRESS"
    case completed = "COMPLETED"
    case cancelled = "CANCELLED"

    var displayName: String {
        switch self {
        case .open: return "Open"
        case .inProgress: return "In progress"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        }
    }
}

struct Job: Codable, Identifiable, Hashable {
    let id: String
    let employerId: String
    let title: String
    let description: String?
    let skillRequired: String
    let city: String
    let budget: Double
    let status: JobStatus
    let createdAt: String
    let updatedAt: String?
    let employer: Employer?

    struct Employer: Codable, Hashable {
        let id: String
        let name: String
    }
}

struct CreateJobRequest: Codable {
    let title: String
    let description: String?
    let skillRequired: String
    let city: String
    let budget: Double
}

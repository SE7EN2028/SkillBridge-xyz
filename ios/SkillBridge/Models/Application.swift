import Foundation
import SwiftUI

enum ApplicationStatus: String, Codable {
    case pending = "PENDING"
    case accepted = "ACCEPTED"
    case rejected = "REJECTED"
    case completed = "COMPLETED"
    case cancelled = "CANCELLED"

    var displayName: String {
        switch self {
        case .pending: return "Pending"
        case .accepted: return "Accepted"
        case .rejected: return "Rejected"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        }
    }

    var color: Color {
        switch self {
        case .pending: return .orange
        case .accepted: return .appBrand
        case .rejected: return .appDanger
        case .completed: return .appSuccess
        case .cancelled: return .appTextDim
        }
    }
}

struct ApplicationDTO: Codable, Identifiable, Hashable {
    let id: String
    let jobId: String
    let workerProfileId: String
    let status: ApplicationStatus
    let coverNote: String?
    let createdAt: String
    let updatedAt: String?
    let job: Job?
    let workerProfile: WorkerProfile?
}

struct ApplyRequest: Codable {
    let coverNote: String?
}

struct UpdateApplicationStatusRequest: Codable {
    let status: ApplicationStatus
}

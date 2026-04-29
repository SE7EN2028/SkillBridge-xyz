import Foundation

struct APISuccess<T: Codable>: Codable {
    let status: String
    let data: T
}

struct APIPaginated<T: Codable>: Codable {
    let status: String
    let data: [T]
    let meta: PageMeta

    struct PageMeta: Codable {
        let total: Int
        let page: Int
        let limit: Int
        let totalPages: Int
    }
}

struct APIErrorPayload: Codable {
    let status: String
    let message: String
    let errors: [String: String]?
}

enum APIError: LocalizedError {
    case network(Error)
    case decoding(Error)
    case server(status: Int, message: String, fieldErrors: [String: String]?)
    case unauthorized
    case unknown

    var errorDescription: String? {
        switch self {
        case .network(let e): return e.localizedDescription
        case .decoding: return "Failed to read server response."
        case .server(_, let msg, _): return msg
        case .unauthorized: return "Please log in again."
        case .unknown: return "Something went wrong."
        }
    }
}

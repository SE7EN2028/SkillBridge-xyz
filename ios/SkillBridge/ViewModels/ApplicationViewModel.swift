import Foundation

@MainActor
final class MyApplicationsViewModel: ObservableObject {
    @Published var applications: [ApplicationDTO] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let api = APIService.shared

    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            applications = try await api.get("applications/me")
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    func cancel(_ id: String) async {
        do {
            _ = try await api.post("applications/\(id)/cancel",
                                   body: APIService.EmptyBody()) as ApplicationDTO
            await load()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}

@MainActor
final class EmployerJobsViewModel: ObservableObject {
    @Published var jobs: [Job] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let api = APIService.shared

    func load(employerId: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let result: APIPaginated<Job> =
                try await api.getPaginated("jobs", query: ["employerId": employerId, "limit": "50"])
            jobs = result.data
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}

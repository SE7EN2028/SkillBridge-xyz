import Foundation

@MainActor
final class JobListViewModel: ObservableObject {
    @Published var jobs: [Job] = []
    @Published var skill: String = ""
    @Published var city: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let api = APIService.shared

    func search() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            var query: [String: String] = ["status": "OPEN"]
            if !skill.isEmpty { query["skill"] = skill }
            if !city.isEmpty { query["city"] = city }
            let result: APIPaginated<Job> = try await api.getPaginated("jobs", query: query, auth: false)
            jobs = result.data
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}

@MainActor
final class JobDetailViewModel: ObservableObject {
    @Published var job: Job?
    @Published var applications: [ApplicationDTO] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let api = APIService.shared

    func load(id: String, includeApplications: Bool) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            job = try await api.get("jobs/\(id)", auth: false)
            if includeApplications {
                applications = try await api.get("jobs/\(id)/applications")
            }
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    func apply(jobId: String, coverNote: String?) async -> Bool {
        do {
            _ = try await api.post("jobs/\(jobId)/applications",
                                  body: ApplyRequest(coverNote: coverNote)) as ApplicationDTO
            return true
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
            return false
        }
    }

    func setApplicationStatus(_ id: String, status: ApplicationStatus) async {
        do {
            _ = try await api.patch("applications/\(id)/status",
                                    body: UpdateApplicationStatusRequest(status: status)) as ApplicationDTO
            if let jid = job?.id {
                await load(id: jid, includeApplications: true)
            }
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}

@MainActor
final class PostJobViewModel: ObservableObject {
    @Published var title: String = ""
    @Published var description: String = ""
    @Published var skillRequired: String = ""
    @Published var city: String = ""
    @Published var budget: String = ""
    @Published var errorMessage: String?
    @Published var isSubmitting: Bool = false

    private let api = APIService.shared

    func submit() async -> Job? {
        guard let budgetVal = Double(budget), title.count >= 5 else {
            errorMessage = "Title must be at least 5 chars and budget required"
            return nil
        }
        isSubmitting = true
        errorMessage = nil
        defer { isSubmitting = false }
        do {
            return try await api.post("jobs",
                                      body: CreateJobRequest(title: title,
                                                             description: description.isEmpty ? nil : description,
                                                             skillRequired: skillRequired,
                                                             city: city,
                                                             budget: budgetVal))
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
            return nil
        }
    }
}

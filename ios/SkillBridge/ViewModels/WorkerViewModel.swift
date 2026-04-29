import Foundation

@MainActor
final class WorkerSearchViewModel: ObservableObject {
    @Published var workers: [WorkerProfile] = []
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
            var query: [String: String] = [:]
            if !skill.isEmpty { query["skill"] = skill }
            if !city.isEmpty { query["city"] = city }
            let result: APIPaginated<WorkerProfile> =
                try await api.getPaginated("workers", query: query, auth: false)
            workers = result.data
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}

@MainActor
final class WorkerDetailViewModel: ObservableObject {
    @Published var worker: WorkerProfile?
    @Published var reviews: [Review] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let api = APIService.shared

    func load(id: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            async let workerCall: WorkerProfile = api.get("workers/\(id)", auth: false)
            async let reviewsCall: [Review] = api.get("reviews/worker/\(id)", auth: false)
            let (w, r) = try await (workerCall, reviewsCall)
            worker = w
            reviews = r
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}

@MainActor
final class WorkerProfileViewModel: ObservableObject {
    @Published var profile: WorkerProfile?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let api = APIService.shared

    func loadMine() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            profile = try await api.get("workers/me")
        } catch let APIError.server(status, message, _) where status == 404 {
            profile = nil
            errorMessage = message
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    func create(city: String, hourlyRate: Double, bio: String?) async -> Bool {
        do {
            profile = try await api.post("workers",
                                        body: CreateWorkerRequest(city: city, bio: bio, hourlyRate: hourlyRate))
            return true
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
            return false
        }
    }

    func addSkill(_ name: String, years: Int) async {
        do {
            _ = try await api.post("workers/me/skills",
                                  body: AddSkillRequest(skillName: name, yearsExp: years)) as Skill
            await loadMine()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    func removeSkill(_ id: String) async {
        do {
            try await api.delete("workers/me/skills/\(id)")
            await loadMine()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}

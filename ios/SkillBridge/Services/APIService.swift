import Foundation

actor APIService {
    static let shared = APIService()

    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    private var accessToken: String?
    private var refreshTask: Task<String?, Never>?

    init(session: URLSession = .shared) {
        self.session = session
        self.decoder = JSONDecoder()
        self.encoder = JSONEncoder()
    }

    func setAccessToken(_ token: String?) {
        self.accessToken = token
    }

    // MARK: - Public requests

    func get<T: Codable>(_ path: String, query: [String: String] = [:], auth: Bool = true) async throws -> T {
        try await request(path: path, method: "GET", query: query, body: Optional<EmptyBody>.none, auth: auth)
    }

    func getPaginated<T: Codable>(_ path: String, query: [String: String] = [:], auth: Bool = true) async throws -> APIPaginated<T> {
        try await sendPaginated(path: path, query: query, auth: auth)
    }

    func post<B: Codable, T: Codable>(_ path: String, body: B, auth: Bool = true) async throws -> T {
        try await request(path: path, method: "POST", body: body, auth: auth)
    }

    func patch<B: Codable, T: Codable>(_ path: String, body: B, auth: Bool = true) async throws -> T {
        try await request(path: path, method: "PATCH", body: body, auth: auth)
    }

    func delete(_ path: String, auth: Bool = true) async throws {
        let _: EmptyResponse = try await request(path: path, method: "DELETE", body: Optional<EmptyBody>.none, auth: auth)
    }

    // MARK: - Internals

    struct EmptyBody: Codable {}
    struct EmptyResponse: Codable {}

    private func buildURL(path: String, query: [String: String]) -> URL? {
        var comps = URLComponents(url: AppConfig.apiBaseURL.appendingPathComponent(path),
                                  resolvingAgainstBaseURL: false)
        if !query.isEmpty {
            comps?.queryItems = query.map { URLQueryItem(name: $0.key, value: $0.value) }
        }
        return comps?.url
    }

    private func request<B: Codable, T: Codable>(
        path: String,
        method: String,
        query: [String: String] = [:],
        body: B?,
        auth: Bool
    ) async throws -> T {
        guard let url = buildURL(path: path, query: query) else { throw APIError.unknown }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        if body != nil {
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            if let data = try? encoder.encode(body) {
                req.httpBody = data
            }
        }
        if auth, let token = accessToken {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        var (data, response) = try await send(req)

        if let http = response as? HTTPURLResponse, http.statusCode == 401, auth {
            if let newToken = await refreshAccessToken() {
                req.setValue("Bearer \(newToken)", forHTTPHeaderField: "Authorization")
                (data, response) = try await send(req)
            } else {
                throw APIError.unauthorized
            }
        }

        guard let http = response as? HTTPURLResponse else { throw APIError.unknown }

        if http.statusCode == 204 {
            // empty body
            if T.self == EmptyResponse.self {
                return EmptyResponse() as! T
            }
        }

        if !(200...299).contains(http.statusCode) {
            if let payload = try? decoder.decode(APIErrorPayload.self, from: data) {
                throw APIError.server(status: http.statusCode, message: payload.message, fieldErrors: payload.errors)
            }
            throw APIError.server(status: http.statusCode, message: "Request failed", fieldErrors: nil)
        }

        do {
            let envelope = try decoder.decode(APISuccess<T>.self, from: data)
            return envelope.data
        } catch {
            // Some endpoints (like 204) return no body
            if T.self == EmptyResponse.self {
                return EmptyResponse() as! T
            }
            throw APIError.decoding(error)
        }
    }

    private func sendPaginated<T: Codable>(
        path: String,
        query: [String: String],
        auth: Bool
    ) async throws -> APIPaginated<T> {
        guard let url = buildURL(path: path, query: query) else { throw APIError.unknown }
        var req = URLRequest(url: url)
        req.httpMethod = "GET"
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        if auth, let token = accessToken {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        var (data, response) = try await send(req)
        if let http = response as? HTTPURLResponse, http.statusCode == 401, auth {
            if let newToken = await refreshAccessToken() {
                req.setValue("Bearer \(newToken)", forHTTPHeaderField: "Authorization")
                (data, response) = try await send(req)
            } else {
                throw APIError.unauthorized
            }
        }
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            throw APIError.server(status: (response as? HTTPURLResponse)?.statusCode ?? 0,
                                  message: "Request failed", fieldErrors: nil)
        }
        do {
            return try decoder.decode(APIPaginated<T>.self, from: data)
        } catch {
            throw APIError.decoding(error)
        }
    }

    private func send(_ req: URLRequest) async throws -> (Data, URLResponse) {
        do {
            return try await session.data(for: req)
        } catch {
            throw APIError.network(error)
        }
    }

    // MARK: - Refresh

    private func refreshAccessToken() async -> String? {
        if let task = refreshTask {
            return await task.value
        }
        let task = Task<String?, Never> { [weak self] in
            guard let self else { return nil }
            guard let refreshToken = KeychainHelper.shared.get(KeychainKey.refreshToken) else { return nil }
            guard let url = await self.buildURL(path: "auth/refresh", query: [:]) else { return nil }
            var req = URLRequest(url: url)
            req.httpMethod = "POST"
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try? await self.encoder.encode(RefreshRequest(refreshToken: refreshToken))
            do {
                let (data, response) = try await URLSession.shared.data(for: req)
                guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
                    KeychainHelper.shared.delete(KeychainKey.refreshToken)
                    return nil
                }
                struct RefreshTokens: Codable { let accessToken: String; let refreshToken: String }
                let envelope = try await self.decoder.decode(APISuccess<RefreshTokens>.self, from: data)
                await self.setAccessToken(envelope.data.accessToken)
                KeychainHelper.shared.set(envelope.data.refreshToken, for: KeychainKey.refreshToken)
                return envelope.data.accessToken
            } catch {
                return nil
            }
        }
        refreshTask = task
        let result = await task.value
        refreshTask = nil
        return result
    }
}

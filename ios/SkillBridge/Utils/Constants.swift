import Foundation

enum AppConfig {
    static let apiBaseURL: URL = {
        let raw = (Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String) ??
            "http://localhost:4000/api/v1"
        return URL(string: raw)!
    }()

    static let appName = "SkillBridge"
}

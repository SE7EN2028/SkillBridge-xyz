import Foundation

struct Skill: Codable, Identifiable, Hashable {
    let id: String
    let workerProfileId: String?
    let skillName: String
    let yearsExp: Int
    let certificateUrl: String?
    let createdAt: String?
}

struct AddSkillRequest: Codable {
    let skillName: String
    let yearsExp: Int
}

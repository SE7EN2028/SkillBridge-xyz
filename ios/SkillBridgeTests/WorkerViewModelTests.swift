import XCTest
@testable import SkillBridge

final class WorkerModelTests: XCTestCase {
    func test_workerProfile_decodesFromJson() throws {
        let json = """
        {
          "id": "wp-1",
          "userId": "u-1",
          "bio": "Experienced",
          "city": "Mumbai",
          "hourlyRate": 250.0,
          "isAvailable": true,
          "isVerified": true,
          "averageRating": 4.7,
          "reviewCount": 12,
          "photoUrl": null,
          "createdAt": "2025-01-01T00:00:00Z",
          "updatedAt": null,
          "user": { "id": "u-1", "name": "Asha", "email": null },
          "skills": [
            {
              "id": "s-1",
              "workerProfileId": "wp-1",
              "skillName": "plumber",
              "yearsExp": 5,
              "certificateUrl": null,
              "createdAt": null
            }
          ]
        }
        """.data(using: .utf8)!
        let p = try JSONDecoder().decode(WorkerProfile.self, from: json)
        XCTAssertEqual(p.id, "wp-1")
        XCTAssertEqual(p.skills?.count, 1)
        XCTAssertEqual(p.user?.name, "Asha")
        XCTAssertEqual(p.hourlyRate, 250.0, accuracy: 0.01)
    }

    func test_jobStatus_displayNames() {
        XCTAssertEqual(JobStatus.open.displayName, "Open")
        XCTAssertEqual(JobStatus.inProgress.displayName, "In progress")
        XCTAssertEqual(JobStatus.completed.displayName, "Completed")
    }

    func test_applicationStatus_decoding() throws {
        let json = "\"PENDING\"".data(using: .utf8)!
        let s = try JSONDecoder().decode(ApplicationStatus.self, from: json)
        XCTAssertEqual(s, .pending)
    }
}

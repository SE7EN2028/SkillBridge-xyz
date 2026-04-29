import XCTest
@testable import SkillBridge

final class APIResponseTests: XCTestCase {
    func test_apiSuccess_decodesEnvelope() throws {
        let json = """
        {
          "status": "success",
          "data": { "name": "Alice" }
        }
        """.data(using: .utf8)!
        struct Inner: Codable { let name: String }
        let env = try JSONDecoder().decode(APISuccess<Inner>.self, from: json)
        XCTAssertEqual(env.data.name, "Alice")
    }

    func test_apiPaginated_decodesData() throws {
        let json = """
        {
          "status": "success",
          "data": [{"v": 1}, {"v": 2}],
          "meta": { "total": 2, "page": 1, "limit": 20, "totalPages": 1 }
        }
        """.data(using: .utf8)!
        struct V: Codable { let v: Int }
        let env = try JSONDecoder().decode(APIPaginated<V>.self, from: json)
        XCTAssertEqual(env.data.count, 2)
        XCTAssertEqual(env.meta.totalPages, 1)
    }

    func test_apiError_serverHasMessage() {
        let err = APIError.server(status: 422, message: "bad input", fieldErrors: ["email": "invalid"])
        XCTAssertEqual(err.errorDescription, "bad input")
    }
}

import Foundation

// MARK: - Simulation Models

struct Simulation: Codable, Identifiable {
    let id: String
    let title: String
    let description: String?
    let sector: String
    let difficulty: String
    let estimatedDuration: Int
    let steps: [SimulationStep]
    let rubric: Rubric
    let resources: Resources?
    let thumbnailUrl: String?
    let mediaUrls: [String]
    let isPublished: Bool
    let createdAt: Date
    let updatedAt: Date
}

struct SimulationStep: Codable {
    let id: String
    let type: String
    let title: String
    let content: String
    let options: [String]?
    let correctAnswer: String?
}

struct Rubric: Codable {
    let criteria: [RubricCriterion]
}

struct RubricCriterion: Codable {
    let name: String
    let description: String
    let weight: Double
    let maxScore: Int
}

struct Resources: Codable {
    let trainingLinks: [TrainingLink]?
    let documents: [String]?
}

struct TrainingLink: Codable {
    let title: String
    let url: String
    let provider: String
}

struct SimulationsResponse: Codable {
    let data: [Simulation]
    let pagination: Pagination
}

struct Pagination: Codable {
    let total: Int
    let limit: Int
    let offset: Int
    let hasMore: Bool
}

// MARK: - Attempt Models

struct Attempt: Codable, Identifiable {
    let id: String
    let userId: String
    let simulationId: String
    let rubricScores: [String: Double]
    let overallScore: Double
    let feedback: String?
    let responses: [String: AnyCodable]
    let encryptedMedia: [String]
    let status: AttemptStatus
    let startedAt: Date
    let completedAt: Date?
    let duration: Int?
    let createdAt: Date
    let updatedAt: Date
}

enum AttemptStatus: String, Codable {
    case inProgress = "IN_PROGRESS"
    case completed = "COMPLETED"
    case abandoned = "ABANDONED"
}

struct AttemptCreate: Codable {
    let simulationId: String
    let responses: [String: Any]
    let encryptedMedia: [String]

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(simulationId, forKey: .simulationId)
        try container.encode(encryptedMedia, forKey: .encryptedMedia)

        // Encode responses as JSON
        let jsonData = try JSONSerialization.data(withJSONObject: responses)
        let jsonString = String(data: jsonData, encoding: .utf8)
        try container.encode(jsonString, forKey: .responses)
    }

    private enum CodingKeys: String, CodingKey {
        case simulationId, responses, encryptedMedia
    }
}

struct AttemptUpdate: Codable {
    let rubricScores: [String: Double]
    let overallScore: Double
    let feedback: String?
    let responses: [String: AnyCodable]?
    let encryptedMedia: [String]?
    let status: AttemptStatus
    let duration: Int?
}

// MARK: - User Models

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let role: UserRole
    let createdAt: Date
    let updatedAt: Date
}

enum UserRole: String, Codable {
    case user = "USER"
    case admin = "ADMIN"
    case institution = "INSTITUTION"
}

// MARK: - Helper Types

/// Type-erased wrapper for any Codable value
struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) {
        self.value = value
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let string = try? container.decode(String.self) {
            value = string
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array.map { $0.value }
        } else if let dictionary = try? container.decode([String: AnyCodable].self) {
            value = dictionary.mapValues { $0.value }
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unsupported type"
            )
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch value {
        case let bool as Bool:
            try container.encode(bool)
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let string as String:
            try container.encode(string)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        case let dictionary as [String: Any]:
            try container.encode(dictionary.mapValues { AnyCodable($0) })
        default:
            throw EncodingError.invalidValue(
                value,
                EncodingError.Context(
                    codingPath: container.codingPath,
                    debugDescription: "Unsupported type"
                )
            )
        }
    }
}

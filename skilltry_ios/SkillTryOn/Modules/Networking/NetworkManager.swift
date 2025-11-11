import Foundation
import Combine

/// Network manager for API communication
/// Implements OpenAPI client pattern for type-safe API calls
@MainActor
class NetworkManager: ObservableObject {
    static let shared = NetworkManager()

    private let baseURL: URL
    private let session: URLSession

    @Published var isLoading = false
    @Published var error: NetworkError?

    init(baseURL: String = "http://localhost:3000") {
        guard let url = URL(string: baseURL) else {
            fatalError("Invalid base URL")
        }
        self.baseURL = url

        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: configuration)
    }

    // MARK: - Generic Request Method

    func request<T: Decodable>(
        _ endpoint: APIEndpoint,
        method: HTTPMethod = .get,
        body: Encodable? = nil,
        headers: [String: String] = [:]
    ) async throws -> T {
        isLoading = true
        defer { isLoading = false }

        var request = URLRequest(url: baseURL.appendingPathComponent(endpoint.path))
        request.httpMethod = method.rawValue

        // Set headers
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        headers.forEach { key, value in
            request.setValue(value, forHTTPHeaderField: key)
        }

        // Add authentication token if available
        if let token = await getAuthToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Encode body if provided
        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.httpError(statusCode: httpResponse.statusCode)
        }

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(T.self, from: data)
    }

    // MARK: - API Methods

    func fetchSimulations(sector: String? = nil) async throws -> SimulationsResponse {
        var queryItems: [URLQueryItem] = []
        if let sector = sector {
            queryItems.append(URLQueryItem(name: "sector", value: sector))
        }

        return try await request(.simulations(query: queryItems))
    }

    func fetchSimulation(id: String) async throws -> Simulation {
        return try await request(.simulation(id: id))
    }

    func createAttempt(simulationId: String, responses: [String: Any]) async throws -> Attempt {
        let body = AttemptCreate(
            simulationId: simulationId,
            responses: responses,
            encryptedMedia: []
        )
        return try await request(.createAttempt, method: .post, body: body)
    }

    func updateAttempt(id: String, update: AttemptUpdate) async throws -> Attempt {
        return try await request(.updateAttempt(id: id), method: .put, body: update)
    }

    // MARK: - Private Helpers

    private func getAuthToken() async -> String? {
        // TODO: Integrate with authentication manager
        return nil
    }
}

// MARK: - Supporting Types

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
    case patch = "PATCH"
}

enum APIEndpoint {
    case health
    case simulations(query: [URLQueryItem]?)
    case simulation(id: String)
    case createAttempt
    case updateAttempt(id: String)

    var path: String {
        switch self {
        case .health:
            return "/api/health"
        case .simulations(let query):
            var path = "/api/simulations"
            if let query = query, !query.isEmpty {
                let queryString = query
                    .map { "\($0.name)=\($0.value ?? "")" }
                    .joined(separator: "&")
                path += "?" + queryString
            }
            return path
        case .simulation(let id):
            return "/api/simulations/\(id)"
        case .createAttempt:
            return "/api/attempt"
        case .updateAttempt(let id):
            return "/api/attempt?id=\(id)"
        }
    }
}

enum NetworkError: LocalizedError {
    case invalidResponse
    case httpError(statusCode: Int)
    case decodingError(Error)
    case encodingError(Error)
    case unauthorized
    case notFound

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Invalid server response"
        case .httpError(let code):
            return "HTTP error: \(code)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .encodingError(let error):
            return "Failed to encode request: \(error.localizedDescription)"
        case .unauthorized:
            return "Unauthorized access"
        case .notFound:
            return "Resource not found"
        }
    }
}

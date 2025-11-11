import Foundation
import AuthenticationServices
import Combine

/// Manages authentication using WebAuthn/Passkeys
/// Implements passkey-first authentication with magic link fallback
@MainActor
class AuthenticationManager: NSObject, ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var error: AuthError?

    private let domain = "skilltry.example.com"
    private let networkManager = NetworkManager.shared

    // MARK: - Passkey Authentication

    /// Sign in with passkey (WebAuthn)
    func signInWithPasskey() async throws {
        isLoading = true
        defer { isLoading = false }

        // Create passkey request
        let challenge = generateChallenge()
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(
            relyingPartyIdentifier: domain
        )

        let assertionRequest = provider.createCredentialAssertionRequest(
            challenge: challenge
        )

        let authController = ASAuthorizationController(
            authorizationRequests: [assertionRequest]
        )
        authController.delegate = self
        authController.presentationContextProvider = self

        authController.performRequests()
    }

    /// Register new passkey
    func registerPasskey(email: String, name: String) async throws {
        isLoading = true
        defer { isLoading = false }

        let challenge = generateChallenge()
        let userID = Data(UUID().uuidString.utf8)

        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(
            relyingPartyIdentifier: domain
        )

        let registrationRequest = provider.createCredentialRegistrationRequest(
            challenge: challenge,
            name: email,
            userID: userID
        )

        // Require resident key for discoverable credentials
        registrationRequest.userVerificationPreference = .required

        let authController = ASAuthorizationController(
            authorizationRequests: [registrationRequest]
        )
        authController.delegate = self
        authController.presentationContextProvider = self

        authController.performRequests()
    }

    // MARK: - Magic Link Fallback

    /// Send magic link to email
    func sendMagicLink(email: String) async throws {
        isLoading = true
        defer { isLoading = false }

        // TODO: Implement magic link API call
        // await networkManager.sendMagicLink(email: email)
    }

    /// Verify magic link token
    func verifyMagicLink(token: String) async throws {
        isLoading = true
        defer { isLoading = false }

        // TODO: Implement magic link verification
        // let user = try await networkManager.verifyMagicLink(token: token)
        // currentUser = user
        // isAuthenticated = true
    }

    // MARK: - Session Management

    /// Sign out current user
    func signOut() {
        currentUser = nil
        isAuthenticated = false
        clearStoredCredentials()
    }

    /// Check if user is authenticated on app launch
    func checkAuthenticationStatus() async {
        // TODO: Check for stored session token
        // If valid, restore user session
    }

    // MARK: - Private Helpers

    private func generateChallenge() -> Data {
        var bytes = [UInt8](repeating: 0, count: 32)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        return Data(bytes)
    }

    private func clearStoredCredentials() {
        // Clear any stored tokens or credentials
        UserDefaults.standard.removeObject(forKey: "authToken")
    }

    private func storeAuthToken(_ token: String) {
        UserDefaults.standard.set(token, forKey: "authToken")
    }

    private func loadAuthToken() -> String? {
        UserDefaults.standard.string(forKey: "authToken")
    }
}

// MARK: - ASAuthorizationControllerDelegate

extension AuthenticationManager: ASAuthorizationControllerDelegate {
    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        Task {
            do {
                if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialAssertion {
                    // Handle sign in
                    try await handleSignInCredential(credential)
                } else if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialRegistration {
                    // Handle registration
                    try await handleRegistrationCredential(credential)
                }
            } catch {
                self.error = .authenticationFailed(error.localizedDescription)
            }
        }
    }

    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        self.error = .authenticationFailed(error.localizedDescription)
        isLoading = false
    }

    private func handleSignInCredential(
        _ credential: ASAuthorizationPlatformPublicKeyCredentialAssertion
    ) async throws {
        // TODO: Send credential to server for verification
        // let response = try await networkManager.verifyPasskeyAssertion(
        //     credentialId: credential.credentialID,
        //     authenticatorData: credential.rawAuthenticatorData,
        //     signature: credential.signature
        // )
        // currentUser = response.user
        // storeAuthToken(response.token)
        // isAuthenticated = true

        // For now, just mark as authenticated
        isAuthenticated = true
    }

    private func handleRegistrationCredential(
        _ credential: ASAuthorizationPlatformPublicKeyCredentialRegistration
    ) async throws {
        // TODO: Send registration to server
        // let response = try await networkManager.registerPasskey(
        //     credentialId: credential.credentialID,
        //     attestationObject: credential.rawAttestationObject
        // )
        // currentUser = response.user
        // storeAuthToken(response.token)
        // isAuthenticated = true

        // For now, just mark as authenticated
        isAuthenticated = true
    }
}

// MARK: - ASAuthorizationControllerPresentationContextProviding

extension AuthenticationManager: ASAuthorizationControllerPresentationContextProviding {
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        // Return the main window
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first else {
            fatalError("No window found")
        }
        return window
    }
}

// MARK: - Errors

enum AuthError: LocalizedError {
    case authenticationFailed(String)
    case registrationFailed(String)
    case invalidCredentials
    case userNotFound
    case networkError

    var errorDescription: String? {
        switch self {
        case .authenticationFailed(let message):
            return "Authentication failed: \(message)"
        case .registrationFailed(let message):
            return "Registration failed: \(message)"
        case .invalidCredentials:
            return "Invalid credentials"
        case .userNotFound:
            return "User not found"
        case .networkError:
            return "Network error occurred"
        }
    }
}

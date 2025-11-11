import Foundation
import CryptoKit

/// Manages client-side encryption for sensitive data
/// Uses AES-GCM for authenticated encryption
/// Server only receives ciphertext - zero-knowledge architecture
class CryptoManager {
    static let shared = CryptoManager()

    private let keychain = KeychainManager()

    private init() {}

    // MARK: - Key Management

    /// Generate a new symmetric encryption key
    func generateKey() throws -> SymmetricKey {
        let key = SymmetricKey(size: .bits256)
        try keychain.saveKey(key)
        return key
    }

    /// Get the current encryption key from keychain
    func getKey() throws -> SymmetricKey {
        guard let key = try keychain.loadKey() else {
            throw CryptoError.keyNotFound
        }
        return key
    }

    // MARK: - Encryption/Decryption

    /// Encrypt data using AES-GCM
    /// Returns base64-encoded ciphertext with nonce
    func encrypt(data: Data) throws -> String {
        let key = try getKey()

        let sealedBox = try AES.GCM.seal(data, using: key)

        guard let combined = sealedBox.combined else {
            throw CryptoError.encryptionFailed
        }

        return combined.base64EncodedString()
    }

    /// Encrypt string using AES-GCM
    func encrypt(string: String) throws -> String {
        guard let data = string.data(using: .utf8) else {
            throw CryptoError.invalidInput
        }
        return try encrypt(data: data)
    }

    /// Decrypt base64-encoded ciphertext
    func decrypt(ciphertext: String) throws -> Data {
        let key = try getKey()

        guard let combined = Data(base64Encoded: ciphertext) else {
            throw CryptoError.invalidCiphertext
        }

        let sealedBox = try AES.GCM.SealedBox(combined: combined)
        return try AES.GCM.open(sealedBox, using: key)
    }

    /// Decrypt to string
    func decryptString(ciphertext: String) throws -> String {
        let data = try decrypt(ciphertext: ciphertext)

        guard let string = String(data: data, encoding: .utf8) else {
            throw CryptoError.decodingFailed
        }

        return string
    }

    // MARK: - File Encryption

    /// Encrypt file data before upload
    func encryptFile(at url: URL) throws -> Data {
        let data = try Data(contentsOf: url)
        let encryptedString = try encrypt(data: data)
        return Data(encryptedString.utf8)
    }

    /// Decrypt file data after download
    func decryptFile(data: Data) throws -> Data {
        guard let ciphertext = String(data: data, encoding: .utf8) else {
            throw CryptoError.invalidInput
        }
        return try decrypt(ciphertext: ciphertext)
    }

    // MARK: - Hashing

    /// Generate SHA-256 hash of data
    func hash(data: Data) -> String {
        let digest = SHA256.hash(data: data)
        return digest.compactMap { String(format: "%02x", $0) }.joined()
    }

    /// Generate SHA-256 hash of string
    func hash(string: String) -> String {
        guard let data = string.data(using: .utf8) else {
            return ""
        }
        return hash(data: data)
    }
}

// MARK: - Keychain Manager

/// Secure storage for encryption keys
private class KeychainManager {
    private let service = "com.skilltry.encryption"
    private let account = "master-key"

    func saveKey(_ key: SymmetricKey) throws {
        let keyData = key.withUnsafeBytes { Data($0) }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: keyData,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]

        // Delete existing key
        SecItemDelete(query as CFDictionary)

        // Add new key
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw CryptoError.keychainError(status: status)
        }
    }

    func loadKey() throws -> SymmetricKey? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else {
            if status == errSecItemNotFound {
                return nil
            }
            throw CryptoError.keychainError(status: status)
        }

        guard let keyData = result as? Data else {
            throw CryptoError.keychainError(status: errSecInternalError)
        }

        return SymmetricKey(data: keyData)
    }

    func deleteKey() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]

        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw CryptoError.keychainError(status: status)
        }
    }
}

// MARK: - Errors

enum CryptoError: LocalizedError {
    case keyNotFound
    case encryptionFailed
    case decryptionFailed
    case invalidInput
    case invalidCiphertext
    case decodingFailed
    case keychainError(status: OSStatus)

    var errorDescription: String? {
        switch self {
        case .keyNotFound:
            return "Encryption key not found"
        case .encryptionFailed:
            return "Failed to encrypt data"
        case .decryptionFailed:
            return "Failed to decrypt data"
        case .invalidInput:
            return "Invalid input data"
        case .invalidCiphertext:
            return "Invalid ciphertext format"
        case .decodingFailed:
            return "Failed to decode decrypted data"
        case .keychainError(let status):
            return "Keychain error: \(status)"
        }
    }
}

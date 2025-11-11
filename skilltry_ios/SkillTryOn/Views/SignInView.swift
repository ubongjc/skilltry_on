import SwiftUI
import AuthenticationServices

struct SignInView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var email = ""
    @State private var showMagicLinkSent = false

    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                // Logo and title
                VStack(spacing: 12) {
                    Image(systemName: "briefcase.fill")
                        .font(.system(size: 64))
                        .foregroundColor(.blue)

                    Text("SkillTry-On")
                        .font(.largeTitle)
                        .fontWeight(.bold)

                    Text("Realistic job simulations\nwith instant feedback")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 60)

                Spacer()

                // Sign in options
                VStack(spacing: 16) {
                    // Passkey sign in (primary)
                    Button(action: {
                        Task {
                            try? await authManager.signInWithPasskey()
                        }
                    }) {
                        Label("Sign in with Passkey", systemImage: "person.badge.key.fill")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }

                    // Divider
                    HStack {
                        Rectangle()
                            .frame(height: 1)
                            .foregroundColor(.gray.opacity(0.3))
                        Text("or")
                            .foregroundColor(.secondary)
                            .padding(.horizontal, 8)
                        Rectangle()
                            .frame(height: 1)
                            .foregroundColor(.gray.opacity(0.3))
                    }

                    // Magic link fallback
                    VStack(spacing: 12) {
                        TextField("Email address", text: $email)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(.emailAddress)
                            .autocapitalization(.none)
                            .keyboardType(.emailAddress)

                        Button(action: {
                            Task {
                                try? await authManager.sendMagicLink(email: email)
                                showMagicLinkSent = true
                            }
                        }) {
                            Text("Send Magic Link")
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.gray.opacity(0.2))
                                .foregroundColor(.primary)
                                .cornerRadius(12)
                        }
                        .disabled(email.isEmpty || !isValidEmail(email))
                    }
                }
                .padding(.horizontal, 32)

                Spacer()

                // Privacy notice
                Text("We use passkeys for secure, passwordless authentication")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                    .padding(.bottom, 32)
            }
            .navigationBarHidden(true)
            .alert("Magic Link Sent", isPresented: $showMagicLinkSent) {
                Button("OK") { }
            } message: {
                Text("Check your email for a sign-in link")
            }
            .alert("Error", isPresented: .constant(authManager.error != nil)) {
                Button("OK") { authManager.error = nil }
            } message: {
                if let error = authManager.error {
                    Text(error.localizedDescription)
                }
            }
            .overlay {
                if authManager.isLoading {
                    ProgressView()
                        .scaleEffect(1.5)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.black.opacity(0.2))
                }
            }
        }
    }

    private func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let predicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return predicate.evaluate(with: email)
    }
}

#Preview {
    SignInView()
        .environmentObject(AuthenticationManager())
}

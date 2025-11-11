import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var showDeleteAccountAlert = false
    @State private var showExportDataSheet = false

    var body: some View {
        NavigationView {
            List {
                // Profile Section
                Section {
                    if let user = authManager.currentUser {
                        HStack {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 48))
                                .foregroundColor(.blue)

                            VStack(alignment: .leading, spacing: 4) {
                                Text(user.name ?? "User")
                                    .font(.headline)
                                Text(user.email)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }

                // Account Section
                Section("Account") {
                    Button(action: {
                        // Navigate to passkey management
                    }) {
                        Label("Manage Passkeys", systemImage: "key.fill")
                    }

                    Button(action: {
                        showExportDataSheet = true
                    }) {
                        Label("Export My Data", systemImage: "square.and.arrow.up")
                    }

                    Button(action: {
                        showDeleteAccountAlert = true
                    }) {
                        Label("Delete Account", systemImage: "trash")
                            .foregroundColor(.red)
                    }
                }

                // Privacy Section
                Section("Privacy") {
                    NavigationLink(destination: Text("Privacy Policy")) {
                        Label("Privacy Policy", systemImage: "hand.raised.fill")
                    }

                    NavigationLink(destination: Text("Data Usage")) {
                        Label("Data Usage", systemImage: "chart.bar.fill")
                    }

                    HStack {
                        Label("Client-Side Encryption", systemImage: "lock.shield.fill")
                        Spacer()
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                    }
                }

                // App Section
                Section("App") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }

                    NavigationLink(destination: Text("About")) {
                        Label("About", systemImage: "info.circle")
                    }
                }

                // Sign Out
                Section {
                    Button(action: {
                        authManager.signOut()
                    }) {
                        Label("Sign Out", systemImage: "arrow.right.square")
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Settings")
            .alert("Delete Account", isPresented: $showDeleteAccountAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    // TODO: Implement account deletion
                }
            } message: {
                Text("This will permanently delete your account and all associated data. This action cannot be undone.")
            }
            .sheet(isPresented: $showExportDataSheet) {
                ExportDataView()
            }
        }
    }
}

struct ExportDataView: View {
    @Environment(\.dismiss) var dismiss
    @State private var isExporting = false
    @State private var exportComplete = false

    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                Image(systemName: "square.and.arrow.up.circle.fill")
                    .font(.system(size: 64))
                    .foregroundColor(.blue)

                VStack(spacing: 12) {
                    Text("Export Your Data")
                        .font(.title2)
                        .fontWeight(.bold)

                    Text("We'll prepare a copy of all your data including attempts, scores, and feedback.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                if isExporting {
                    ProgressView()
                        .scaleEffect(1.5)
                        .padding()
                } else if exportComplete {
                    VStack(spacing: 12) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 48))
                            .foregroundColor(.green)

                        Text("Export Complete")
                            .font(.headline)

                        Text("Check your email for a download link")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                } else {
                    Button(action: {
                        isExporting = true
                        // TODO: Implement data export
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            isExporting = false
                            exportComplete = true
                        }
                    }) {
                        Text("Start Export")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal, 32)
                }

                Spacer()
            }
            .padding(.top, 48)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(AuthenticationManager())
}

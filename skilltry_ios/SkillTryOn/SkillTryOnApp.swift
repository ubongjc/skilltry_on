import SwiftUI

@main
struct SkillTryOnApp: App {
    @StateObject private var authManager = AuthenticationManager()
    @StateObject private var networkManager = NetworkManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(networkManager)
        }
    }
}

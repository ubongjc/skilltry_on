import SwiftUI

struct SimulationsListView: View {
    @EnvironmentObject var networkManager: NetworkManager
    @State private var simulations: [Simulation] = []
    @State private var isLoading = false
    @State private var selectedSector: String?

    let sectors = ["Technology", "Healthcare", "Finance", "Retail", "Education"]

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Sector filter
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        FilterChip(
                            title: "All",
                            isSelected: selectedSector == nil
                        ) {
                            selectedSector = nil
                            Task { await loadSimulations() }
                        }

                        ForEach(sectors, id: \.self) { sector in
                            FilterChip(
                                title: sector,
                                isSelected: selectedSector == sector
                            ) {
                                selectedSector = sector
                                Task { await loadSimulations() }
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical, 12)
                .background(Color(.systemBackground))

                Divider()

                // Simulations list
                if isLoading {
                    ProgressView()
                        .frame(maxHeight: .infinity)
                } else if simulations.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "tray")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        Text("No simulations found")
                            .foregroundColor(.secondary)
                    }
                    .frame(maxHeight: .infinity)
                } else {
                    List(simulations) { simulation in
                        NavigationLink(destination: SimulationDetailView(simulation: simulation)) {
                            SimulationRow(simulation: simulation)
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Simulations")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        Task { await loadSimulations() }
                    }) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
            .task {
                await loadSimulations()
            }
        }
    }

    private func loadSimulations() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let response: SimulationsResponse = try await networkManager.fetchSimulations(
                sector: selectedSector
            )
            simulations = response.data
        } catch {
            print("Failed to load simulations: \(error)")
        }
    }
}

struct SimulationRow: View {
    let simulation: Simulation

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(simulation.title)
                    .font(.headline)

                Spacer()

                DifficultyBadge(difficulty: simulation.difficulty)
            }

            if let description = simulation.description {
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
            }

            HStack {
                Label("\(simulation.estimatedDuration) min", systemImage: "clock")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                Text(simulation.sector)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.1))
                    .foregroundColor(.blue)
                    .cornerRadius(8)
            }
        }
        .padding(.vertical, 4)
    }
}

struct DifficultyBadge: View {
    let difficulty: String

    var color: Color {
        switch difficulty {
        case "EASY": return .green
        case "HARD": return .red
        default: return .orange
        }
    }

    var body: some View {
        Text(difficulty)
            .font(.caption)
            .fontWeight(.semibold)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.2))
            .foregroundColor(color)
            .cornerRadius(8)
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.blue : Color.gray.opacity(0.2))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(20)
        }
    }
}

struct SimulationDetailView: View {
    let simulation: Simulation

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 12) {
                    Text(simulation.title)
                        .font(.title)
                        .fontWeight(.bold)

                    HStack {
                        DifficultyBadge(difficulty: simulation.difficulty)
                        Label("\(simulation.estimatedDuration) min", systemImage: "clock")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }

                    if let description = simulation.description {
                        Text(description)
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                }
                .padding()

                Divider()

                // Start button
                Button(action: {
                    // TODO: Start simulation
                }) {
                    Text("Start Simulation")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                .padding(.horizontal)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    SimulationsListView()
        .environmentObject(NetworkManager())
}

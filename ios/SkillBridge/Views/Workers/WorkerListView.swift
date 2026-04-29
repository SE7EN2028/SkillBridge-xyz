import SwiftUI

struct WorkerListView: View {
    @StateObject private var vm = WorkerSearchViewModel()
    @State private var searchTask: Task<Void, Never>?

    var body: some View {
        ZStack(alignment: .top) {
            AnimatedBackground()
            ScrollView {
                VStack(spacing: 16) {
                    header
                    filters
                    results
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 24)
            }
        }
        .navigationTitle("")
        .toolbar(.hidden, for: .navigationBar)
        .task { await vm.search() }
        .onChange(of: vm.skill) { _, _ in scheduleSearch() }
        .onChange(of: vm.city) { _, _ in scheduleSearch() }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Find verified workers")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.appText)
            Text("Filter by skill and city.")
                .font(.subheadline).foregroundColor(.appTextDim)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var filters: some View {
        VStack(spacing: 10) {
            AppTextField(title: "Skill", systemImage: "wrench.and.screwdriver.fill", text: $vm.skill)
            AppTextField(title: "City", systemImage: "mappin.and.ellipse", text: $vm.city)
        }
        .appCard()
    }

    @ViewBuilder
    private var results: some View {
        if vm.isLoading {
            VStack(spacing: 10) {
                ForEach(0..<3, id: \.self) { _ in ShimmerCard() }
            }
        } else if let err = vm.errorMessage {
            ErrorBanner(message: err)
        } else if vm.workers.isEmpty {
            EmptyStateView(title: "No workers match", subtitle: "Try widening your filters.", icon: "magnifyingglass")
        } else {
            LazyVStack(spacing: 12) {
                ForEach(Array(vm.workers.enumerated()), id: \.element.id) { idx, w in
                    NavigationLink {
                        WorkerDetailView(workerId: w.id)
                    } label: {
                        WorkerCardView(worker: w)
                            .transition(.opacity.combined(with: .move(edge: .bottom)))
                    }
                    .buttonStyle(.plain)
                    .opacity(0)
                    .animation(.easeOut(duration: 0.4).delay(Double(min(idx, 8)) * 0.04), value: vm.workers)
                    .onAppear {} // placeholder
                    .modifier(ListItemAppearMod(index: idx))
                }
            }
        }
    }

    private func scheduleSearch() {
        searchTask?.cancel()
        searchTask = Task {
            try? await Task.sleep(nanoseconds: 350_000_000)
            if Task.isCancelled { return }
            await vm.search()
        }
    }
}

private struct ListItemAppearMod: ViewModifier {
    let index: Int
    @State private var visible = false
    func body(content: Content) -> some View {
        content
            .opacity(visible ? 1 : 0)
            .offset(y: visible ? 0 : 12)
            .onAppear {
                withAnimation(.easeOut(duration: 0.4).delay(Double(min(index, 8)) * 0.04)) {
                    visible = true
                }
            }
    }
}

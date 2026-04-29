import SwiftUI

struct JobListView: View {
    @StateObject private var vm = JobListViewModel()
    @EnvironmentObject var auth: AuthService
    @State private var searchTask: Task<Void, Never>?
    @State private var showingPost = false

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            AnimatedBackground()
            ScrollView {
                VStack(spacing: 16) {
                    header
                    filters
                    results
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 90)
            }

            if auth.currentUser?.role == .employer {
                NavigationLink {
                    JobPostView()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "plus")
                        Text("Post a job").fontWeight(.semibold)
                    }
                    .padding(.horizontal, 18)
                    .padding(.vertical, 12)
                    .background(
                        LinearGradient(colors: [.appBrand, .appBrandSoft],
                                       startPoint: .leading, endPoint: .trailing)
                    )
                    .clipShape(Capsule())
                    .foregroundColor(.white)
                    .shadow(color: Color.appBrand.opacity(0.5), radius: 18, x: 0, y: 10)
                }
                .padding(20)
            }
            _ = showingPost
        }
        .navigationTitle("")
        .toolbar(.hidden, for: .navigationBar)
        .task { await vm.search() }
        .onChange(of: vm.skill) { _, _ in scheduleSearch() }
        .onChange(of: vm.city) { _, _ in scheduleSearch() }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Open jobs")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.appText)
            Text("Apply directly. No middlemen.")
                .font(.subheadline).foregroundColor(.appTextDim)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var filters: some View {
        VStack(spacing: 10) {
            AppTextField(title: "Skill", systemImage: "wrench.and.screwdriver", text: $vm.skill)
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
        } else if vm.jobs.isEmpty {
            EmptyStateView(title: "No open jobs", subtitle: "Adjust your filters or check back later.", icon: "briefcase")
        } else {
            LazyVStack(spacing: 12) {
                ForEach(vm.jobs) { job in
                    NavigationLink {
                        JobDetailView(jobId: job.id)
                    } label: {
                        JobCardView(job: job)
                    }
                    .buttonStyle(.plain)
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

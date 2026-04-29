import SwiftUI

struct EmployerDashboardView: View {
    @StateObject private var vm = EmployerJobsViewModel()
    @EnvironmentObject var auth: AuthService

    var body: some View {
        VStack(spacing: 16) {
            HStack {
                Text("My jobs").font(.headline).foregroundColor(.appText)
                Spacer()
                NavigationLink {
                    JobPostView()
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                        Text("New").font(.subheadline.weight(.semibold))
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Capsule().fill(Color.appBrand.opacity(0.15)))
                    .foregroundColor(.appBrandSoft)
                    .overlay(Capsule().stroke(Color.appBrand.opacity(0.4), lineWidth: 1))
                }
            }
            if vm.isLoading {
                ShimmerCard()
            } else if vm.jobs.isEmpty {
                EmptyStateView(title: "No jobs yet",
                               subtitle: "Post your first job to get started.",
                               icon: "briefcase")
            } else {
                ForEach(vm.jobs) { j in
                    NavigationLink {
                        JobDetailView(jobId: j.id)
                    } label: {
                        JobCardView(job: j)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .task {
            if let id = auth.currentUser?.id { await vm.load(employerId: id) }
        }
    }
}

import SwiftUI

struct JobDetailView: View {
    let jobId: String
    @StateObject private var vm = JobDetailViewModel()
    @EnvironmentObject var auth: AuthService
    @State private var coverNote: String = ""
    @State private var applied: Bool = false

    var body: some View {
        ZStack {
            AnimatedBackground()
            ScrollView {
                if vm.isLoading {
                    LoadingView().frame(height: 300)
                } else if let err = vm.errorMessage {
                    ErrorBanner(message: err).padding()
                } else if let j = vm.job {
                    VStack(spacing: 16) {
                        header(for: j)
                        if auth.currentUser?.role == .worker, j.status == .open, !applied {
                            applyCard(jobId: j.id)
                        } else if applied {
                            successCard
                        }
                        if isOwner {
                            employerControls
                        }
                    }
                    .padding(16)
                }
            }
        }
        .navigationTitle("Job")
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load(id: jobId, includeApplications: isOwner) }
    }

    private var isOwner: Bool {
        auth.currentUser?.role == .employer && vm.job?.employerId == auth.currentUser?.id
    }

    private func header(for j: Job) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                Text(j.title).font(.title3.weight(.bold)).foregroundColor(.appText)
                Spacer()
                StatusChip(label: j.status.displayName, color: .appBrand)
            }
            HStack(spacing: 14) {
                Label(j.skillRequired, systemImage: "wrench.and.screwdriver.fill")
                Label(j.city, systemImage: "mappin")
                Label(j.budget.rupees, systemImage: "indianrupeesign.circle")
                    .foregroundColor(.appSuccess)
            }
            .font(.caption)
            .foregroundColor(.appTextDim)
            if let desc = j.description {
                Text(desc).font(.callout).foregroundColor(.appText)
            }
            if let emp = j.employer {
                HStack(spacing: 6) {
                    AvatarView(name: emp.name, size: 22)
                    Text("Posted by \(emp.name)").font(.caption2).foregroundColor(.appTextDim)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard()
    }

    private func applyCard(jobId: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Apply").font(.headline).foregroundColor(.appText)
            AppTextArea(title: "Cover note (optional)", text: $coverNote)
            PrimaryButton(title: "Send application", systemImage: "paperplane.fill") {
                Task {
                    let ok = await vm.apply(jobId: jobId, coverNote: coverNote.isEmpty ? nil : coverNote)
                    if ok {
                        withAnimation(.spring(response: 0.45, dampingFraction: 0.78)) { applied = true }
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard()
    }

    private var successCard: some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark.circle.fill").foregroundColor(.appSuccess)
            Text("Application sent").foregroundColor(.appText).font(.headline)
            Spacer()
        }
        .padding(14)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.appSuccess.opacity(0.12)))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.appSuccess.opacity(0.4), lineWidth: 1))
        .transition(.opacity.combined(with: .scale(scale: 0.96)))
    }

    private var employerControls: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Applications").font(.headline).foregroundColor(.appText)
            if vm.applications.isEmpty {
                Text("No applications yet.").font(.subheadline).foregroundColor(.appTextDim)
            } else {
                ForEach(vm.applications) { app in
                    ApplicationRow(app: app) { newStatus in
                        Task { await vm.setApplicationStatus(app.id, status: newStatus) }
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard()
    }
}

private struct ApplicationRow: View {
    let app: ApplicationDTO
    let onSet: (ApplicationStatus) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                AvatarView(name: app.workerProfile?.user?.name ?? "?", size: 32)
                VStack(alignment: .leading, spacing: 2) {
                    Text(app.workerProfile?.user?.name ?? "Worker")
                        .font(.subheadline).foregroundColor(.appText)
                    if let cn = app.coverNote, !cn.isEmpty {
                        Text(cn).font(.caption).foregroundColor(.appTextDim).lineLimit(2)
                    }
                }
                Spacer()
                StatusChip(label: app.status.displayName, color: app.status.color)
            }
            HStack(spacing: 8) {
                if app.status == .pending {
                    SecondaryButton(title: "Reject") { onSet(.rejected) }
                    PrimaryButton(title: "Accept") { onSet(.accepted) }
                } else if app.status == .accepted {
                    PrimaryButton(title: "Mark complete") { onSet(.completed) }
                }
            }
        }
        .padding(10)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.white.opacity(0.04)))
    }
}

import SwiftUI

struct WorkerDetailView: View {
    let workerId: String
    @StateObject private var vm = WorkerDetailViewModel()

    var body: some View {
        ZStack {
            AnimatedBackground()
            ScrollView {
                if vm.isLoading {
                    LoadingView().frame(height: 300)
                } else if let err = vm.errorMessage {
                    ErrorBanner(message: err).padding()
                } else if let w = vm.worker {
                    VStack(spacing: 16) {
                        header(for: w)
                        skills(for: w)
                        reviewsSection
                    }
                    .padding(16)
                }
            }
        }
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load(id: workerId) }
    }

    private func header(for w: WorkerProfile) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 14) {
                AvatarView(name: w.user?.name ?? "Worker", url: w.photoUrl, size: 78)
                VStack(alignment: .leading, spacing: 6) {
                    Text(w.user?.name ?? "Worker")
                        .font(.title2.weight(.bold))
                        .foregroundColor(.appText)
                    HStack(spacing: 6) {
                        VerifiedBadge(isVerified: w.isVerified)
                        StatusChip(label: w.isAvailable ? "Available" : "Busy",
                                   color: w.isAvailable ? .appSuccess : .appTextDim)
                    }
                    HStack(spacing: 14) {
                        Label(w.city, systemImage: "mappin").font(.caption)
                        Label(w.hourlyRate.rupees + "/hr", systemImage: "indianrupeesign.circle").font(.caption)
                    }.foregroundColor(.appTextDim)
                    RatingView(value: w.averageRating, size: 14, showValue: true,
                               reviewCount: w.reviewCount)
                }
                Spacer(minLength: 0)
            }
            if let bio = w.bio, !bio.isEmpty {
                Text(bio).font(.callout).foregroundColor(.appText)
            }
        }
        .appCard()
    }

    private func skills(for w: WorkerProfile) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Skills").font(.headline).foregroundColor(.appText)
            if let skills = w.skills, !skills.isEmpty {
                LazyVStack(alignment: .leading, spacing: 8) {
                    ForEach(skills) { s in
                        HStack {
                            Text(s.skillName).font(.callout).foregroundColor(.appText)
                            Spacer()
                            Text("\(s.yearsExp)y").font(.caption).foregroundColor(.appTextDim)
                            if s.certificateUrl != nil {
                                Image(systemName: "checkmark.seal.fill")
                                    .foregroundColor(.appBrandSoft)
                                    .font(.caption)
                            }
                        }
                        .padding(10)
                        .background(RoundedRectangle(cornerRadius: 10).fill(Color.white.opacity(0.04)))
                    }
                }
            } else {
                Text("No skills listed yet.").font(.subheadline).foregroundColor(.appTextDim)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard()
    }

    private var reviewsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Reviews").font(.headline).foregroundColor(.appText)
            if vm.reviews.isEmpty {
                Text("No reviews yet.").font(.subheadline).foregroundColor(.appTextDim)
            } else {
                ForEach(vm.reviews) { r in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            AvatarView(name: r.reviewer?.name ?? "?", size: 28)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(r.reviewer?.name ?? "Anonymous")
                                    .font(.subheadline).foregroundColor(.appText)
                                Text(r.createdAt.prefix(10))
                                    .font(.caption2).foregroundColor(.appTextDim)
                            }
                            Spacer()
                            RatingView(value: Double(r.rating), size: 12)
                        }
                        if let c = r.comment {
                            Text(c).font(.callout).foregroundColor(.appText.opacity(0.9))
                        }
                    }
                    .padding(10)
                    .background(RoundedRectangle(cornerRadius: 10).fill(Color.white.opacity(0.04)))
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard()
    }
}

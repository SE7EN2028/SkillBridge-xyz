import SwiftUI

struct WorkerCardView: View {
    let worker: WorkerProfile

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                AvatarView(name: worker.user?.name ?? "Worker",
                           url: worker.photoUrl,
                           size: 48)
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(worker.user?.name ?? "Worker")
                            .font(.headline)
                            .foregroundColor(.appText)
                            .lineLimit(1)
                        if worker.isVerified {
                            Image(systemName: "checkmark.seal.fill")
                                .foregroundColor(.appBrandSoft)
                                .font(.caption)
                        }
                    }
                    HStack(spacing: 10) {
                        Label(worker.city, systemImage: "mappin")
                        Label(worker.hourlyRate.rupees + "/hr", systemImage: "indianrupeesign.circle")
                    }
                    .font(.caption)
                    .foregroundColor(.appTextDim)
                }
                Spacer()
                RatingView(value: worker.averageRating, size: 12, showValue: true,
                           reviewCount: worker.reviewCount)
            }

            if let bio = worker.bio, !bio.isEmpty {
                Text(bio).font(.callout).foregroundColor(.appText.opacity(0.85)).lineLimit(2)
            }

            if let skills = worker.skills, !skills.isEmpty {
                FlowChips(items: Array(skills.prefix(4).map { $0.skillName }) +
                          (skills.count > 4 ? ["+\(skills.count - 4)"] : []))
            }
        }
        .appCard()
    }
}

struct FlowChips: View {
    let items: [String]
    var body: some View {
        FlexibleStack(spacing: 6) {
            ForEach(items, id: \.self) { s in
                Text(s).chipStyle().foregroundColor(.appText)
            }
        }
    }
}

// Simple wrapping HStack
struct FlexibleStack<Content: View>: View {
    let spacing: CGFloat
    @ViewBuilder let content: () -> Content
    init(spacing: CGFloat = 6, @ViewBuilder content: @escaping () -> Content) {
        self.spacing = spacing
        self.content = content
    }
    var body: some View {
        HStack(spacing: spacing) {
            content()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

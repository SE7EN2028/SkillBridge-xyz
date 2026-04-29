import SwiftUI

struct JobCardView: View {
    let job: Job

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
                Text(job.title)
                    .font(.headline)
                    .foregroundColor(.appText)
                    .lineLimit(2)
                Spacer()
                StatusChip(label: job.status.displayName, color: jobColor)
            }
            HStack(spacing: 14) {
                Label(job.skillRequired, systemImage: "wrench.and.screwdriver.fill")
                Label(job.city, systemImage: "mappin")
                Label(job.budget.rupees, systemImage: "indianrupeesign.circle")
                    .foregroundColor(.appSuccess)
            }
            .font(.caption)
            .foregroundColor(.appTextDim)
            if let desc = job.description, !desc.isEmpty {
                Text(desc).font(.callout).foregroundColor(.appText.opacity(0.85)).lineLimit(2)
            }
            if let emp = job.employer {
                HStack(spacing: 6) {
                    AvatarView(name: emp.name, size: 22)
                    Text("Posted by \(emp.name)").font(.caption2).foregroundColor(.appTextDim)
                }
            }
        }
        .appCard()
    }

    private var jobColor: Color {
        switch job.status {
        case .open: return .appBrand
        case .inProgress: return .appAccent
        case .completed: return .appSuccess
        case .cancelled: return .appTextDim
        }
    }
}

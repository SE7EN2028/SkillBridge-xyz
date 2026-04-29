import SwiftUI

struct ErrorBanner: View {
    let message: String

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(.appDanger)
            Text(message)
                .font(.callout)
                .foregroundColor(.appText)
                .multilineTextAlignment(.leading)
            Spacer()
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.appDanger.opacity(0.10))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.appDanger.opacity(0.4), lineWidth: 1)
        )
        .transition(.move(edge: .top).combined(with: .opacity))
    }
}

struct EmptyStateView: View {
    let title: String
    var subtitle: String? = nil
    var icon: String = "tray"

    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 28))
                .foregroundColor(.appTextDim)
                .padding(14)
                .background(Circle().fill(Color.white.opacity(0.05)))
            Text(title).font(.headline).foregroundColor(.appText)
            if let s = subtitle {
                Text(s).font(.subheadline).foregroundColor(.appTextDim).multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(36)
        .appCard()
    }
}

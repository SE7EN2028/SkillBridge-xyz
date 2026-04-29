import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var auth: AuthService

    var body: some View {
        ZStack {
            AnimatedBackground()
            ScrollView {
                VStack(spacing: 16) {
                    profileHeader
                    if auth.currentUser?.role == .worker {
                        WorkerDashboardView()
                    } else if auth.currentUser?.role == .employer {
                        EmployerDashboardView()
                    } else {
                        Text("Admin tools available on web.")
                            .foregroundColor(.appTextDim).appCard()
                    }
                    PrimaryButton(title: "Log out", systemImage: "rectangle.portrait.and.arrow.right") {
                        Task { await auth.logout() }
                    }
                }
                .padding(16)
            }
        }
        .navigationTitle("")
        .toolbar(.hidden, for: .navigationBar)
    }

    private var profileHeader: some View {
        HStack(spacing: 14) {
            AvatarView(name: auth.currentUser?.name ?? "?", size: 56)
            VStack(alignment: .leading, spacing: 2) {
                Text(auth.currentUser?.name ?? "User")
                    .font(.headline).foregroundColor(.appText)
                Text(auth.currentUser?.role.displayName ?? "")
                    .font(.caption).foregroundColor(.appTextDim)
            }
            Spacer()
            Image(systemName: "sparkles")
                .foregroundColor(.appAccent)
                .font(.title3)
        }
        .appCard()
    }
}

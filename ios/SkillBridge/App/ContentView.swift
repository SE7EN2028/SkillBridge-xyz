import SwiftUI

struct ContentView: View {
    @EnvironmentObject var auth: AuthService

    var body: some View {
        ZStack {
            Color.appBg.ignoresSafeArea()
            if auth.currentUser == nil {
                AuthRootView()
                    .transition(.opacity.combined(with: .scale(scale: 0.98)))
            } else {
                MainTabView()
                    .transition(.opacity.combined(with: .move(edge: .trailing)))
            }
        }
        .animation(.spring(response: 0.45, dampingFraction: 0.85), value: auth.currentUser?.id)
    }
}

struct MainTabView: View {
    @EnvironmentObject var auth: AuthService

    var body: some View {
        TabView {
            NavigationStack {
                WorkerListView()
            }
            .tabItem { Label("Workers", systemImage: "person.2.fill") }

            NavigationStack {
                JobListView()
            }
            .tabItem { Label("Jobs", systemImage: "briefcase.fill") }

            NavigationStack {
                DashboardView()
            }
            .tabItem { Label("You", systemImage: "person.crop.circle") }
        }
        .tint(.appBrand)
    }
}

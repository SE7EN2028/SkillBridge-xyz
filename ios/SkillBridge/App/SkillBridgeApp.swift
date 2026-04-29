import SwiftUI

@main
struct SkillBridgeApp: App {
    @StateObject private var auth = AuthService.shared

    init() {
        let nav = UINavigationBarAppearance()
        nav.configureWithTransparentBackground()
        nav.backgroundColor = UIColor(Color.appBg)
        nav.titleTextAttributes = [.foregroundColor: UIColor(Color.appText)]
        nav.largeTitleTextAttributes = [.foregroundColor: UIColor(Color.appText)]
        UINavigationBar.appearance().standardAppearance = nav
        UINavigationBar.appearance().scrollEdgeAppearance = nav
        UINavigationBar.appearance().compactAppearance = nav

        let tab = UITabBarAppearance()
        tab.configureWithTransparentBackground()
        tab.backgroundColor = UIColor(Color.appBg)
        UITabBar.appearance().standardAppearance = tab
        UITabBar.appearance().scrollEdgeAppearance = tab
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(auth)
                .preferredColorScheme(.dark)
        }
    }
}

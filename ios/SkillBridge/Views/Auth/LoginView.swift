import SwiftUI

struct AuthRootView: View {
    @State private var showRegister = false

    var body: some View {
        ZStack {
            AnimatedBackground()
            if showRegister {
                RegisterView(switchToLogin: { withAnimation { showRegister = false } })
                    .transition(.move(edge: .trailing).combined(with: .opacity))
            } else {
                LoginView(switchToRegister: { withAnimation { showRegister = true } })
                    .transition(.move(edge: .leading).combined(with: .opacity))
            }
        }
    }
}

struct LoginView: View {
    @StateObject private var vm = AuthViewModel()
    @FocusState private var focused: Field?
    var switchToRegister: () -> Void

    enum Field { case email, password }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                BrandHeader(title: "Welcome back",
                            subtitle: "Log in to continue building your reputation.")
                VStack(spacing: 14) {
                    AppTextField(title: "Email",
                                 systemImage: "envelope.fill",
                                 text: $vm.email,
                                 keyboard: .emailAddress)
                        .focused($focused, equals: .email)
                    AppSecureField(title: "Password",
                                   systemImage: "lock.fill",
                                   text: $vm.password)
                        .focused($focused, equals: .password)
                }
                if let err = vm.errorMessage {
                    ErrorBanner(message: err)
                }
                PrimaryButton(title: "Log in",
                              systemImage: "arrow.right",
                              isLoading: vm.isLoading) {
                    Task { await vm.login() }
                }
                HStack {
                    Text("New here?").foregroundColor(.appTextDim)
                    Button("Create an account", action: switchToRegister)
                        .foregroundColor(.appBrandSoft)
                }
                .font(.subheadline)
                .frame(maxWidth: .infinity, alignment: .center)
                .padding(.top, 4)
            }
            .padding(20)
        }
        .scrollDismissesKeyboard(.interactively)
        .toolbar(.hidden, for: .navigationBar)
    }
}

import SwiftUI

struct RegisterView: View {
    @StateObject private var vm = AuthViewModel()
    var switchToLogin: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                BrandHeader(title: "Create account",
                            subtitle: "Pick how you'll use SkillBridge.")
                rolePicker
                VStack(spacing: 14) {
                    AppTextField(title: "Full name",
                                 systemImage: "person.fill",
                                 text: $vm.name,
                                 capitalization: .words)
                    AppTextField(title: "Email",
                                 systemImage: "envelope.fill",
                                 text: $vm.email,
                                 keyboard: .emailAddress)
                    AppSecureField(title: "Password",
                                   systemImage: "lock.fill",
                                   text: $vm.password)
                }
                if let err = vm.errorMessage {
                    ErrorBanner(message: err)
                }
                PrimaryButton(title: "Create account",
                              systemImage: "person.crop.circle.badge.plus",
                              isLoading: vm.isLoading) {
                    Task { await vm.register() }
                }
                HStack {
                    Text("Already have an account?").foregroundColor(.appTextDim)
                    Button("Log in", action: switchToLogin)
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

    private var rolePicker: some View {
        HStack(spacing: 10) {
            roleCard(.worker, title: "Worker", systemImage: "hammer.fill",
                     subtitle: "Get hired for your skills")
            roleCard(.employer, title: "Employer", systemImage: "briefcase.fill",
                     subtitle: "Hire verified workers")
        }
    }

    private func roleCard(_ role: UserRole, title: String, systemImage: String, subtitle: String) -> some View {
        let selected = vm.role == role
        return Button {
            withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                vm.role = role
            }
        } label: {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Image(systemName: systemImage)
                        .foregroundColor(selected ? .appBrandSoft : .appTextDim)
                    Text(title).font(.subheadline.weight(.semibold))
                        .foregroundColor(.appText)
                    Spacer()
                    if selected {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.appBrand)
                    }
                }
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.appTextDim)
                    .multilineTextAlignment(.leading)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(selected ? Color.appBrand.opacity(0.12) : Color.white.opacity(0.04))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(selected ? Color.appBrand : Color.appStroke,
                            lineWidth: selected ? 1.5 : 1)
            )
        }
        .buttonStyle(.plain)
    }
}

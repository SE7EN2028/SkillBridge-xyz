import SwiftUI

struct JobPostView: View {
    @StateObject private var vm = PostJobViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            AnimatedBackground()
            ScrollView {
                VStack(spacing: 16) {
                    BrandHeader(title: "Post a job",
                                subtitle: "Reach verified workers in seconds.")
                    VStack(spacing: 12) {
                        AppTextField(title: "Title", systemImage: "text.alignleft", text: $vm.title)
                        AppTextArea(title: "Description", text: $vm.description)
                        AppTextField(title: "Skill required", systemImage: "wrench.and.screwdriver", text: $vm.skillRequired)
                        AppTextField(title: "City", systemImage: "mappin.and.ellipse", text: $vm.city)
                        AppTextField(title: "Budget (₹)", systemImage: "indianrupeesign.circle",
                                     text: $vm.budget, keyboard: .numberPad)
                    }
                    .appCard()
                    if let err = vm.errorMessage {
                        ErrorBanner(message: err)
                    }
                    PrimaryButton(title: "Publish",
                                  systemImage: "paperplane.fill",
                                  isLoading: vm.isSubmitting) {
                        Task {
                            if await vm.submit() != nil {
                                dismiss()
                            }
                        }
                    }
                }
                .padding(16)
            }
        }
        .navigationTitle("New job")
        .navigationBarTitleDisplayMode(.inline)
    }
}

import SwiftUI

struct WorkerDashboardView: View {
    @StateObject private var profileVM = WorkerProfileViewModel()
    @StateObject private var appsVM = MyApplicationsViewModel()
    @State private var creating: Bool = false
    @State private var newCity: String = ""
    @State private var newRate: String = ""
    @State private var newBio: String = ""
    @State private var newSkill: String = ""
    @State private var newSkillYears: String = ""

    var body: some View {
        VStack(spacing: 16) {
            if profileVM.isLoading {
                LoadingView().frame(height: 220)
            } else if let p = profileVM.profile, !creating {
                profileCard(p)
                skillsCard(p)
                appsCard
            } else {
                createProfileCard
            }
        }
        .task {
            await profileVM.loadMine()
            await appsVM.load()
        }
    }

    private func profileCard(_ p: WorkerProfile) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("My profile").font(.headline).foregroundColor(.appText)
                Spacer()
                VerifiedBadge(isVerified: p.isVerified)
            }
            HStack(spacing: 14) {
                Label(p.city, systemImage: "mappin")
                Label(p.hourlyRate.rupees + "/hr", systemImage: "indianrupeesign.circle")
            }
            .font(.caption).foregroundColor(.appTextDim)
            RatingView(value: p.averageRating, showValue: true, reviewCount: p.reviewCount)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard()
    }

    private func skillsCard(_ p: WorkerProfile) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Skills").font(.headline).foregroundColor(.appText)
            if let skills = p.skills, !skills.isEmpty {
                ForEach(skills) { s in
                    HStack {
                        Text(s.skillName).foregroundColor(.appText)
                        Spacer()
                        Text("\(s.yearsExp)y").font(.caption).foregroundColor(.appTextDim)
                        Button {
                            Task { await profileVM.removeSkill(s.id) }
                        } label: {
                            Image(systemName: "trash").foregroundColor(.appDanger)
                        }
                    }
                    .padding(8)
                    .background(RoundedRectangle(cornerRadius: 10).fill(Color.white.opacity(0.04)))
                }
            } else {
                Text("No skills yet.").font(.subheadline).foregroundColor(.appTextDim)
            }
            HStack {
                AppTextField(title: "Skill", text: $newSkill)
                AppTextField(title: "Years", text: $newSkillYears, keyboard: .numberPad)
                    .frame(width: 90)
            }
            PrimaryButton(title: "Add skill", systemImage: "plus") {
                if let years = Int(newSkillYears), !newSkill.isEmpty {
                    Task {
                        await profileVM.addSkill(newSkill, years: years)
                        newSkill = ""
                        newSkillYears = ""
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard()
    }

    private var appsCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("My applications").font(.headline).foregroundColor(.appText)
            if appsVM.applications.isEmpty {
                Text("No applications yet.").font(.subheadline).foregroundColor(.appTextDim)
            } else {
                ForEach(appsVM.applications) { app in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(app.job?.title ?? "Job")
                                .font(.subheadline).foregroundColor(.appText)
                            Text("\(app.job?.skillRequired ?? "") · \(app.job?.city ?? "")")
                                .font(.caption).foregroundColor(.appTextDim)
                        }
                        Spacer()
                        StatusChip(label: app.status.displayName, color: app.status.color)
                        if app.status == .pending {
                            Button {
                                Task { await appsVM.cancel(app.id) }
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.appDanger)
                            }
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

    private var createProfileCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Create your worker profile").font(.headline).foregroundColor(.appText)
            Text("A profile is required before you can apply to jobs.")
                .font(.subheadline).foregroundColor(.appTextDim)
            AppTextField(title: "City", systemImage: "mappin", text: $newCity)
            AppTextField(title: "Hourly rate (₹)", systemImage: "indianrupeesign.circle",
                         text: $newRate, keyboard: .numberPad)
            AppTextArea(title: "Bio", text: $newBio)
            if let err = profileVM.errorMessage {
                ErrorBanner(message: err)
            }
            PrimaryButton(title: "Create profile", systemImage: "person.badge.plus") {
                guard let rate = Double(newRate) else {
                    profileVM.errorMessage = "Enter a valid hourly rate"
                    return
                }
                Task {
                    let ok = await profileVM.create(city: newCity,
                                                    hourlyRate: rate,
                                                    bio: newBio.isEmpty ? nil : newBio)
                    if ok { creating = false }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard()
    }
}

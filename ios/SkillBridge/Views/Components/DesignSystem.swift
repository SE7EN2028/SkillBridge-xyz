import SwiftUI

// MARK: - Brand header

struct BrandHeader: View {
    let title: String
    let subtitle: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                LogoMark(size: 34)
                Text("SkillBridge")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.appText)
            }
            .padding(.bottom, 8)
            Text(title)
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(.appText)
            Text(subtitle)
                .font(.subheadline)
                .foregroundColor(.appTextDim)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct LogoMark: View {
    var size: CGFloat = 28
    @State private var animateStroke: CGFloat = 0

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: size * 0.22, style: .continuous)
                .fill(Color.appBg)
                .overlay(
                    RoundedRectangle(cornerRadius: size * 0.22, style: .continuous)
                        .stroke(Color.appStroke, lineWidth: 1)
                )
                .frame(width: size, height: size)
            BridgeShape()
                .trim(from: 0, to: animateStroke)
                .stroke(
                    LinearGradient(colors: [.appBrandSoft, .appAccent], startPoint: .leading, endPoint: .trailing),
                    style: StrokeStyle(lineWidth: size * 0.10, lineCap: .round)
                )
                .frame(width: size * 0.7, height: size * 0.4)
                .offset(y: size * 0.05)
            HStack(spacing: size * 0.55) {
                Circle().fill(Color.appBrand).frame(width: size * 0.13, height: size * 0.13)
                Circle().fill(Color.appAccent).frame(width: size * 0.13, height: size * 0.13)
            }
            .offset(y: size * 0.20)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.9)) { animateStroke = 1 }
        }
    }
}

private struct BridgeShape: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.minX, y: rect.maxY))
        p.addQuadCurve(
            to: CGPoint(x: rect.maxX, y: rect.maxY),
            control: CGPoint(x: rect.midX, y: rect.minY - rect.height * 0.4)
        )
        return p
    }
}

// MARK: - Animated background

struct AnimatedBackground: View {
    @State private var phase: CGFloat = 0
    var body: some View {
        ZStack {
            Color.appBg
            // Mesh radial blobs
            Circle()
                .fill(Color.appBrand.opacity(0.35))
                .frame(width: 360, height: 360)
                .blur(radius: 90)
                .offset(x: -120 + phase * 30, y: -260)
            Circle()
                .fill(Color.appAccent.opacity(0.30))
                .frame(width: 320, height: 320)
                .blur(radius: 90)
                .offset(x: 140, y: -120 - phase * 20)
            Circle()
                .fill(Color.appBrandSoft.opacity(0.22))
                .frame(width: 380, height: 380)
                .blur(radius: 100)
                .offset(x: -80 + phase * 40, y: 280)
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.easeInOut(duration: 6).repeatForever(autoreverses: true)) {
                phase = 1
            }
        }
    }
}

// MARK: - Inputs

struct AppTextField: View {
    let title: String
    var systemImage: String? = nil
    @Binding var text: String
    var keyboard: UIKeyboardType = .default
    var capitalization: TextInputAutocapitalization = .never

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(.caption.weight(.medium)).foregroundColor(.appTextDim)
            HStack(spacing: 10) {
                if let s = systemImage {
                    Image(systemName: s).foregroundColor(.appTextDim)
                }
                TextField("", text: $text)
                    .keyboardType(keyboard)
                    .textInputAutocapitalization(capitalization)
                    .autocorrectionDisabled()
                    .foregroundColor(.appText)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.white.opacity(0.04)))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.appStroke, lineWidth: 1))
        }
    }
}

struct AppSecureField: View {
    let title: String
    var systemImage: String? = nil
    @Binding var text: String
    @State private var visible = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(.caption.weight(.medium)).foregroundColor(.appTextDim)
            HStack(spacing: 10) {
                if let s = systemImage {
                    Image(systemName: s).foregroundColor(.appTextDim)
                }
                Group {
                    if visible {
                        TextField("", text: $text)
                    } else {
                        SecureField("", text: $text)
                    }
                }
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
                .foregroundColor(.appText)
                Button {
                    visible.toggle()
                } label: {
                    Image(systemName: visible ? "eye.slash.fill" : "eye.fill")
                        .foregroundColor(.appTextDim)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.white.opacity(0.04)))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.appStroke, lineWidth: 1))
        }
    }
}

struct AppTextArea: View {
    let title: String
    @Binding var text: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(.caption.weight(.medium)).foregroundColor(.appTextDim)
            TextEditor(text: $text)
                .frame(minHeight: 100)
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
                .scrollContentBackground(.hidden)
                .background(RoundedRectangle(cornerRadius: 12).fill(Color.white.opacity(0.04)))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.appStroke, lineWidth: 1))
                .foregroundColor(.appText)
        }
    }
}

// MARK: - Buttons

struct PrimaryButton: View {
    let title: String
    var systemImage: String? = nil
    var isLoading: Bool = false
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView().tint(.white)
                } else {
                    if let s = systemImage {
                        Image(systemName: s)
                    }
                    Text(title).fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(
                LinearGradient(colors: [.appBrand, .appBrandSoft],
                               startPoint: .leading, endPoint: .trailing)
            )
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .shadow(color: Color.appBrand.opacity(0.45), radius: 18, x: 0, y: 8)
        }
        .buttonStyle(PressableStyle())
        .disabled(isLoading)
    }
}

struct SecondaryButton: View {
    let title: String
    var systemImage: String? = nil
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if let s = systemImage {
                    Image(systemName: s)
                }
                Text(title).fontWeight(.medium)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .foregroundColor(.appText)
            .background(RoundedRectangle(cornerRadius: 14).fill(Color.white.opacity(0.05)))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.appStroke, lineWidth: 1))
        }
        .buttonStyle(PressableStyle())
    }
}

private struct PressableStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .opacity(configuration.isPressed ? 0.92 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

// MARK: - Avatar / chips / badges

struct AvatarView: View {
    let name: String
    var url: String? = nil
    var size: CGFloat = 44

    var body: some View {
        ZStack {
            if let url, let u = URL(string: url) {
                AsyncImage(url: u) { phase in
                    if let img = phase.image {
                        img.resizable().scaledToFill()
                    } else {
                        gradientPlaceholder
                    }
                }
                .frame(width: size, height: size)
                .clipShape(Circle())
            } else {
                gradientPlaceholder
            }
        }
        .overlay(Circle().stroke(Color.appStroke, lineWidth: 1))
    }

    private var gradientPlaceholder: some View {
        let (c1, c2) = colors(for: name)
        return ZStack {
            LinearGradient(colors: [c1, c2], startPoint: .topLeading, endPoint: .bottomTrailing)
            Text(initials(name))
                .font(.system(size: size * 0.38, weight: .semibold))
                .foregroundColor(.white)
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
    }

    private func initials(_ s: String) -> String {
        s.split(separator: " ").compactMap { $0.first.map(String.init) }.prefix(2).joined().uppercased()
    }

    private func colors(for s: String) -> (Color, Color) {
        let palette: [(Color, Color)] = [
            (.appBrand, .appBrandSoft),
            (.appAccent, Color(red: 1.0, green: 0.75, blue: 0.4)),
            (Color(red: 0.45, green: 0.78, blue: 0.55), .appSuccess),
            (Color(red: 0.83, green: 0.40, blue: 0.69), Color(red: 1.00, green: 0.55, blue: 0.79)),
            (Color(red: 0.47, green: 0.42, blue: 0.95), Color(red: 0.69, green: 0.61, blue: 1.00))
        ]
        let idx = abs(s.hashValue) % palette.count
        return palette[idx]
    }
}

struct StatusChip: View {
    let label: String
    let color: Color

    var body: some View {
        Text(label)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(Capsule().fill(color.opacity(0.15)))
            .overlay(Capsule().stroke(color.opacity(0.45), lineWidth: 1))
            .foregroundColor(color)
    }
}

struct VerifiedBadge: View {
    let isVerified: Bool

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: isVerified ? "checkmark.seal.fill" : "exclamationmark.shield.fill")
            Text(isVerified ? "Verified" : "Unverified")
        }
        .font(.caption.weight(.semibold))
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Capsule().fill((isVerified ? Color.appBrand : Color.appAccent).opacity(0.15)))
        .foregroundColor(isVerified ? .appBrandSoft : .appAccent)
    }
}

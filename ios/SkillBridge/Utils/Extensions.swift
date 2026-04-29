import SwiftUI

extension Color {
    static let appBg          = Color(red: 0.020, green: 0.027, blue: 0.058)
    static let appSurface     = Color(red: 0.043, green: 0.055, blue: 0.110)
    static let appSurfaceAlt  = Color.white.opacity(0.04)
    static let appStroke      = Color.white.opacity(0.10)
    static let appText        = Color(red: 0.965, green: 0.969, blue: 0.984)
    static let appTextDim     = Color(red: 0.667, green: 0.694, blue: 0.769)
    static let appTextMuted   = Color(red: 0.479, green: 0.514, blue: 0.612)
    static let appBrand       = Color(red: 0.122, green: 0.576, blue: 1.000)
    static let appBrandSoft   = Color(red: 0.282, green: 0.713, blue: 1.000)
    static let appAccent      = Color(red: 1.000, green: 0.624, blue: 0.110)
    static let appSuccess     = Color(red: 0.337, green: 0.812, blue: 0.572)
    static let appDanger      = Color(red: 0.965, green: 0.420, blue: 0.420)
}

extension View {
    func appCard(padding: CGFloat = 18) -> some View {
        self
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(Color.appSurface.opacity(0.7))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(Color.appStroke, lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.4), radius: 18, x: 0, y: 8)
    }

    func chipStyle() -> some View {
        self
            .font(.caption.weight(.medium))
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(
                Capsule().fill(Color.white.opacity(0.05))
            )
            .overlay(Capsule().stroke(Color.appStroke, lineWidth: 1))
    }
}

extension Date {
    var shortDateString: String {
        let f = DateFormatter()
        f.dateStyle = .medium
        return f.string(from: self)
    }
}

extension Double {
    var rupees: String { "₹\(Int(self))" }
}

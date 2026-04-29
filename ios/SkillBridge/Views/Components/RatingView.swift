import SwiftUI

struct RatingView: View {
    let value: Double
    var size: CGFloat = 14
    var showValue: Bool = false
    var reviewCount: Int? = nil

    var body: some View {
        HStack(spacing: 4) {
            HStack(spacing: 2) {
                ForEach(1...5, id: \.self) { i in
                    Image(systemName: Double(i) <= value.rounded() ? "star.fill" : "star")
                        .font(.system(size: size))
                        .foregroundColor(Double(i) <= value.rounded() ? .appAccent : .appTextMuted)
                }
            }
            if showValue {
                Text(String(format: "%.1f", value))
                    .font(.system(size: size, weight: .semibold))
                    .foregroundColor(.appText)
                if let n = reviewCount {
                    Text("(\(n))")
                        .font(.system(size: size - 1))
                        .foregroundColor(.appTextDim)
                }
            }
        }
    }
}

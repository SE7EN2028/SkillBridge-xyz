import SwiftUI

struct LoadingView: View {
    @State private var animate = false

    var body: some View {
        VStack(spacing: 14) {
            ZStack {
                Circle()
                    .stroke(Color.appStroke, lineWidth: 4)
                    .frame(width: 44, height: 44)
                Circle()
                    .trim(from: 0, to: 0.3)
                    .stroke(
                        AngularGradient(
                            gradient: Gradient(colors: [.appBrand, .appAccent]),
                            center: .center
                        ),
                        style: StrokeStyle(lineWidth: 4, lineCap: .round)
                    )
                    .frame(width: 44, height: 44)
                    .rotationEffect(.degrees(animate ? 360 : 0))
                    .animation(.linear(duration: 0.9).repeatForever(autoreverses: false), value: animate)
            }
            Text("Loading…").font(.caption).foregroundColor(.appTextDim)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .onAppear { animate = true }
    }
}

struct ShimmerCard: View {
    @State private var shimmerOffset: CGFloat = -1
    var body: some View {
        RoundedRectangle(cornerRadius: 16)
            .fill(Color.white.opacity(0.04))
            .frame(height: 110)
            .overlay(
                LinearGradient(
                    colors: [.clear, Color.white.opacity(0.07), .clear],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .frame(width: 140)
                .offset(x: shimmerOffset * 300)
                .mask(RoundedRectangle(cornerRadius: 16))
            )
            .clipped()
            .onAppear {
                withAnimation(.linear(duration: 1.4).repeatForever(autoreverses: false)) {
                    shimmerOffset = 1
                }
            }
    }
}

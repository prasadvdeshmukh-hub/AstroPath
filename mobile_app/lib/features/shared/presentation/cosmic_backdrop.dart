import 'package:astropath_mobile/app/theme/app_theme.dart';
import 'package:flutter/material.dart';

class CosmicBackdrop extends StatelessWidget {
  const CosmicBackdrop({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: AstroPathTheme.appBackgroundGradient,
      ),
      child: Stack(
        children: [
          const Positioned.fill(
            child: IgnorePointer(
              child: CustomPaint(
                painter: _StarfieldPainter(),
              ),
            ),
          ),
          Positioned(
            top: -110,
            left: -88,
            child: _GlowOrb(
              size: 250,
              colors: [
                AstroPathTheme.nebula.withOpacity(0.52),
                Colors.transparent,
              ],
            ),
          ),
          const Positioned(
            top: 70,
            right: -44,
            child: Opacity(
              opacity: 0.52,
              child: CosmicHeroGlyph(
                size: 196,
              ),
            ),
          ),
          Positioned(
            bottom: 150,
            left: -28,
            child: _GlowOrb(
              size: 158,
              colors: [
                AstroPathTheme.aurora.withOpacity(0.26),
                Colors.transparent,
              ],
            ),
          ),
          Positioned(
            bottom: -120,
            right: -24,
            child: _GlowOrb(
              size: 260,
              colors: [
                AstroPathTheme.starlight.withOpacity(0.16),
                Colors.transparent,
              ],
            ),
          ),
          Positioned.fill(
            child: IgnorePointer(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.transparent,
                      AstroPathTheme.midnight.withOpacity(0.06),
                      AstroPathTheme.midnight.withOpacity(0.68),
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
            ),
          ),
          child,
        ],
      ),
    );
  }
}

class CosmicHeroGlyph extends StatelessWidget {
  const CosmicHeroGlyph({
    super.key,
    this.size = 164,
  });

  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        clipBehavior: Clip.none,
        children: [
          Container(
            width: size * 0.92,
            height: size * 0.92,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withOpacity(0.06)),
            ),
          ),
          Positioned(
            top: size * 0.08,
            left: size * 0.18,
            child: _StarBurst(
              size: size * 0.11,
              color: AstroPathTheme.starlight,
            ),
          ),
          Positioned(
            top: size * 0.2,
            right: size * 0.14,
            child: _StarDot(
              radius: size * 0.022,
              color: Colors.white.withOpacity(0.92),
            ),
          ),
          Positioned(
            bottom: size * 0.16,
            right: size * 0.2,
            child: _StarDot(
              radius: size * 0.032,
              color: AstroPathTheme.aurora,
            ),
          ),
          Container(
            width: size * 0.56,
            height: size * 0.56,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  Color(0xFFFFE7AE),
                  AstroPathTheme.starlight,
                  Color(0xFF8D5D32),
                ],
                stops: [0.1, 0.54, 1],
              ),
              boxShadow: [
                BoxShadow(
                  color: Color(0x55E6C36A),
                  blurRadius: 32,
                  spreadRadius: 6,
                ),
              ],
            ),
          ),
          Positioned(
            top: size * 0.3,
            child: Transform.rotate(
              angle: -0.3,
              child: Container(
                width: size * 0.95,
                height: size * 0.22,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(size),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.42),
                    width: 2,
                  ),
                  gradient: LinearGradient(
                    colors: [
                      Colors.white.withOpacity(0.12),
                      Colors.transparent,
                      Colors.white.withOpacity(0.16),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            bottom: size * 0.22,
            left: size * 0.12,
            child: Container(
              width: size * 0.16,
              height: size * 0.16,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AstroPathTheme.plasma.withOpacity(0.92),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _GlowOrb extends StatelessWidget {
  const _GlowOrb({
    required this.size,
    required this.colors,
  });

  final double size;
  final List<Color> colors;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(colors: colors),
        ),
      ),
    );
  }
}

class _StarDot extends StatelessWidget {
  const _StarDot({
    required this.radius,
    required this.color,
  });

  final double radius;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: radius * 2,
      height: radius * 2,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.34),
            blurRadius: radius * 8,
            spreadRadius: radius * 0.4,
          ),
        ],
      ),
    );
  }
}

class _StarBurst extends StatelessWidget {
  const _StarBurst({
    required this.size,
    required this.color,
  });

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: size * 0.16,
            height: size,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(size),
            ),
          ),
          Container(
            width: size,
            height: size * 0.16,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(size),
            ),
          ),
          Transform.rotate(
            angle: 0.785,
            child: Container(
              width: size * 0.12,
              height: size * 0.72,
              decoration: BoxDecoration(
                color: color.withOpacity(0.72),
                borderRadius: BorderRadius.circular(size),
              ),
            ),
          ),
          Transform.rotate(
            angle: -0.785,
            child: Container(
              width: size * 0.12,
              height: size * 0.72,
              decoration: BoxDecoration(
                color: color.withOpacity(0.72),
                borderRadius: BorderRadius.circular(size),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StarfieldPainter extends CustomPainter {
  const _StarfieldPainter();

  @override
  void paint(Canvas canvas, Size size) {
    const stars = <List<double>>[
      [0.08, 0.12, 1.5, 0.54],
      [0.22, 0.08, 1.2, 0.62],
      [0.36, 0.14, 1.8, 0.48],
      [0.48, 0.09, 1.3, 0.55],
      [0.62, 0.17, 1.7, 0.45],
      [0.76, 0.1, 1.4, 0.52],
      [0.9, 0.16, 1.6, 0.44],
      [0.12, 0.28, 1.2, 0.34],
      [0.28, 0.24, 1.4, 0.4],
      [0.54, 0.3, 1.1, 0.36],
      [0.72, 0.26, 1.5, 0.42],
      [0.84, 0.34, 1.2, 0.38],
      [0.18, 0.48, 1.2, 0.28],
      [0.38, 0.42, 1.7, 0.34],
      [0.58, 0.52, 1.4, 0.32],
      [0.8, 0.46, 1.3, 0.34],
      [0.14, 0.68, 1.4, 0.28],
      [0.3, 0.72, 1.1, 0.26],
      [0.46, 0.64, 1.8, 0.3],
      [0.66, 0.74, 1.2, 0.28],
      [0.88, 0.7, 1.6, 0.34],
      [0.08, 0.88, 1.2, 0.28],
      [0.24, 0.94, 1.5, 0.24],
      [0.52, 0.9, 1.2, 0.26],
      [0.74, 0.86, 1.4, 0.32],
      [0.92, 0.92, 1.7, 0.26],
    ];

    final starPaint = Paint();
    for (final star in stars) {
      starPaint.color = Colors.white.withOpacity(star[3]);
      canvas.drawCircle(
        Offset(size.width * star[0], size.height * star[1]),
        star[2],
        starPaint,
      );
    }

    const bursts = <List<double>>[
      [0.16, 0.22, 12],
      [0.68, 0.18, 10],
      [0.82, 0.58, 8],
      [0.26, 0.82, 9],
    ];

    final burstPaint = Paint()
      ..color = Colors.white.withOpacity(0.55)
      ..strokeWidth = 1.3
      ..strokeCap = StrokeCap.round;

    for (final burst in bursts) {
      final center = Offset(size.width * burst[0], size.height * burst[1]);
      final arm = burst[2] / 2;
      canvas.drawLine(
        Offset(center.dx - arm, center.dy),
        Offset(center.dx + arm, center.dy),
        burstPaint,
      );
      canvas.drawLine(
        Offset(center.dx, center.dy - arm),
        Offset(center.dx, center.dy + arm),
        burstPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

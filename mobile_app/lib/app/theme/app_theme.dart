import 'package:flutter/material.dart';

class AstroPathTheme {
  static const Color midnight = Color(0xFF07111F);
  static const Color deepSpace = Color(0xFF0E1A2D);
  static const Color nebula = Color(0xFF5B2FA6);
  static const Color starlight = Color(0xFFE6C36A);
  static const Color aurora = Color(0xFF40C9C6);
  static const Color cardSurface = Color(0xFF162238);
  static const Color comet = Color(0xFFFF7A7A);
  static const Color plasma = Color(0xFFD88FFF);

  static const LinearGradient appBackgroundGradient = LinearGradient(
    colors: [
      midnight,
      Color(0xFF101B31),
      Color(0xFF271844),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [
      Color(0xFF17253B),
      Color(0xFF10192D),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroCardGradient = LinearGradient(
    colors: [
      Color(0xFF183053),
      Color(0xFF311C56),
      Color(0xFF0F1A33),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static ThemeData dark() {
    const colorScheme = ColorScheme.dark(
      primary: starlight,
      secondary: nebula,
      tertiary: aurora,
      surface: cardSurface,
      onPrimary: midnight,
      onSecondary: Colors.white,
      onSurface: Colors.white,
      error: comet,
    );

    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: midnight,
      canvasColor: Colors.transparent,
    );

    final textTheme = base.textTheme.apply(
      bodyColor: Colors.white,
      displayColor: Colors.white,
    );

    final inputBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(20),
      borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
    );

    return base.copyWith(
      textTheme: textTheme.copyWith(
        headlineLarge: textTheme.headlineLarge?.copyWith(letterSpacing: -0.8),
        headlineMedium: textTheme.headlineMedium?.copyWith(letterSpacing: -0.6),
        headlineSmall: textTheme.headlineSmall?.copyWith(letterSpacing: -0.4),
        titleLarge: textTheme.titleLarge?.copyWith(letterSpacing: -0.2),
        titleMedium: textTheme.titleMedium?.copyWith(letterSpacing: -0.1),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.white,
        centerTitle: false,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.transparent,
        indicatorColor: starlight.withOpacity(0.18),
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final active = states.contains(WidgetState.selected);
          return IconThemeData(
            color: active ? starlight : Colors.white70,
          );
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final active = states.contains(WidgetState.selected);
          return TextStyle(
            color: active ? Colors.white : Colors.white70,
            fontWeight: active ? FontWeight.w700 : FontWeight.w500,
          );
        }),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: starlight,
          foregroundColor: midnight,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          side: BorderSide(color: Colors.white.withOpacity(0.12)),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: starlight,
          textStyle: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: deepSpace.withOpacity(0.78),
        border: inputBorder,
        enabledBorder: inputBorder,
        focusedBorder: inputBorder.copyWith(
          borderSide: const BorderSide(color: starlight, width: 1.2),
        ),
        hintStyle: const TextStyle(color: Colors.white54),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      chipTheme: base.chipTheme.copyWith(
        backgroundColor: Colors.white.withOpacity(0.05),
        selectedColor: starlight.withOpacity(0.18),
        side: BorderSide(color: Colors.white.withOpacity(0.1)),
        labelStyle: const TextStyle(color: Colors.white),
        secondaryLabelStyle: const TextStyle(color: Colors.white),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
        ),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? starlight
              : Colors.white70,
        ),
        trackColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? aurora.withOpacity(0.42)
              : Colors.white24,
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: starlight,
      ),
      cardTheme: CardThemeData(
        color: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: Colors.white.withOpacity(0.06)),
        ),
      ),
      dividerColor: Colors.white.withOpacity(0.08),
    );
  }
}

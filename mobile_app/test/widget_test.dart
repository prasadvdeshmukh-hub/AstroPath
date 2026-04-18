import 'package:astropath_mobile/app/app.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('renders AstroPath onboarding flow', (tester) async {
    await tester.pumpWidget(const AstroPathApp());
    await tester.pump(const Duration(milliseconds: 600));

    expect(find.text('AstroPath'), findsOneWidget);
    expect(find.text('Decode Your Destiny, Daily.'), findsOneWidget);
  });
}

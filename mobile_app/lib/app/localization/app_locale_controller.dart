import 'package:flutter/material.dart';

class AppLocaleController extends ValueNotifier<Locale> {
  AppLocaleController() : super(const Locale('en'));

  static const supportedLocales = [
    Locale('en'),
    Locale('hi'),
    Locale('mr'),
  ];

  void updateLocale(Locale locale) {
    value = locale;
  }
}

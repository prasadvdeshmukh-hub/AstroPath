import 'package:astropath_mobile/core/models/assistant_snapshot.dart';
import 'package:astropath_mobile/core/models/consultation_hub_data.dart';
import 'package:astropath_mobile/core/models/dashboard_snapshot.dart';
import 'package:flutter/material.dart';

abstract class AstroApi {
  Future<DashboardSnapshot> fetchDashboard(Locale locale);
  Future<ConsultationHubData> fetchConsultationHub(Locale locale);
  Future<AssistantSnapshot> fetchAssistantSnapshot(Locale locale);
}

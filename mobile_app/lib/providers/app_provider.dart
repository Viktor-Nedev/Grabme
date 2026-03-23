import 'dart:async';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AppProvider extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;

  List<Map<String, dynamic>> _profiles = [];
  List<Map<String, dynamic>> _organizations = [];
  List<Map<String, dynamic>> _donations = [];
  List<Map<String, dynamic>> _requests = [];
  List<Map<String, dynamic>> _events = [];

  bool _isLoading = true;

  List<Map<String, dynamic>> get profiles => _profiles;
  List<Map<String, dynamic>> get organizations => _organizations;
  List<Map<String, dynamic>> get donations => _donations;
  List<Map<String, dynamic>> get requests => _requests;
  List<Map<String, dynamic>> get events => _events;
  bool get isLoading => _isLoading;

  AppProvider() {
    _initRealtimeSubscriptions();
    refreshAll();
  }

  void _initRealtimeSubscriptions() {
    // Listen to changes for realtime DB updates if needed
    _supabase.channel('public:events').onPostgresChanges(
      event: PostgresChangeEvent.all,
      schema: 'public',
      table: 'events',
      callback: (payload) { refreshAll(); },
    ).subscribe();
    
    _supabase.channel('public:requests').onPostgresChanges(
      event: PostgresChangeEvent.all,
      schema: 'public',
      table: 'requests',
      callback: (payload) { refreshAll(); },
    ).subscribe();
    
    _supabase.channel('public:donations').onPostgresChanges(
      event: PostgresChangeEvent.all,
      schema: 'public',
      table: 'donations',
      callback: (payload) { refreshAll(); },
    ).subscribe();
  }

  Future<void> refreshAll() async {
    _isLoading = true;
    notifyListeners();

    try {
      final responses = await Future.wait([
        _supabase.from('profiles').select(),
        _supabase.from('organizations').select(),
        _supabase.from('donations').select(),
        _supabase.from('requests').select(),
        _supabase.from('events').select(),
      ]);

      _profiles = List<Map<String, dynamic>>.from(responses[0] as List);
      _organizations = List<Map<String, dynamic>>.from(responses[1] as List);
      _donations = List<Map<String, dynamic>>.from(responses[2] as List);
      _requests = List<Map<String, dynamic>>.from(responses[3] as List);
      _events = List<Map<String, dynamic>>.from(responses[4] as List);

    } catch (e) {
      // print('Provider fetch error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}

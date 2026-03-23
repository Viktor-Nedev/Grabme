import 'dart:async';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ChatProvider extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;

  List<Map<String, dynamic>> _conversations = [];
  List<Map<String, dynamic>> _conversationMembers = [];
  List<Map<String, dynamic>> _messages = [];
  bool _isLoading = true;

  List<Map<String, dynamic>> get conversations => _conversations;
  List<Map<String, dynamic>> get conversationMembers => _conversationMembers;
  List<Map<String, dynamic>> get messages => _messages;
  bool get isLoading => _isLoading;

  ChatProvider() {
    _initSubscriptions();
    refreshChat();
  }

  void _initSubscriptions() {
    _supabase.channel('public:messages').onPostgresChanges(
      event: PostgresChangeEvent.all,
      schema: 'public',
      table: 'messages',
      callback: (payload) {
        refreshChat();
      },
    ).subscribe();
  }

  Future<void> refreshChat() async {
    _isLoading = true;
    notifyListeners();

    try {
      final user = _supabase.auth.currentUser;
      if (user == null) return;

      final responses = await Future.wait([
        _supabase.from('conversations').select().order('updated_at', ascending: false),
        _supabase.from('conversation_members').select(),
        _supabase.from('messages').select().order('created_at', ascending: true),
      ]);

      _conversations = List<Map<String, dynamic>>.from(responses[0] as List);
      _conversationMembers = List<Map<String, dynamic>>.from(responses[1] as List);
      _messages = List<Map<String, dynamic>>.from(responses[2] as List);

    } catch (e) {
      // debugPrint('Chat fetch error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> sendMessage(String conversationId, String content) async {
    final user = _supabase.auth.currentUser;
    if (user == null || content.trim().isEmpty) return;

    await _supabase.from('messages').insert({
      'conversation_id': conversationId,
      'profile_id': user.id,
      'content': content.trim(),
    });
  }
}
